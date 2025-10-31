#!/usr/bin/env python

import traceback
from pathlib import Path

import yaml
from flask import Flask, jsonify, request
from flask_cors import CORS

from aider.coders import Coder
from aider.coders.editblock_coder import do_replace
from aider.main import main as cli_main

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

coder = None


@app.route("/context", methods=["GET"])
def get_context():
    """
    Get the repository context.
    """
    try:
        coder = get_coder()
        if not coder:
            return jsonify({"error": "Coder not available"}), 503

        repo_map_str = ""
        if coder.repo_map:
            # Get the repo map using the coder's method
            repo_map_str = coder.get_repo_map()

        git_status = ""
        if coder.repo:
            try:
                git_status = coder.repo.repo.active_branch.name
            except TypeError:
                git_status = "DETACHED HEAD"

        files_in_repo = []
        if coder.repo:
            files_in_repo = coder.get_all_relative_files()

        context = {
            "files_count": len(files_in_repo),
            "repo_map": repo_map_str,
            "git_status": git_status,
            "active_files": coder.get_inchat_relative_files()[:10],
        }
        return jsonify(context)

    except Exception:
        error_message = traceback.format_exc()
        return jsonify({"error": error_message}), 500


def get_coder():
    global coder
    if coder is None:
        coder = cli_main(return_coder=True)
        if not isinstance(coder, Coder):
            raise ValueError(coder)

        # Force the coder to cooperate, regardless of cmd line args
        coder.yield_stream = False
        coder.stream = False
        coder.pretty = False

    return coder


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400

        message = data["message"]

        coder_instance = get_coder()
        response = coder_instance.run(with_message=message)

        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/files", methods=["POST"])
def add_files():
    try:
        data = request.get_json()
        if not data or "fnames" not in data:
            return jsonify({"error": "No filenames provided"}), 400

        fnames = data["fnames"]
        if not isinstance(fnames, list) or not all(isinstance(fname, str) for fname in fnames):
            return jsonify({"error": "'fnames' must be a list of strings"}), 400

        coder_instance = get_coder()
        for fname in fnames:
            coder_instance.add_rel_fname(fname)

        message = f"Added {len(fnames)} file(s) to the chat."
        coder_instance.io.tool_output(message)
        return jsonify({"message": message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/execute", methods=["POST"])
def execute():
    """
    Execute YAML-formatted requests for files_needed or code_changes.
    """
    try:
        data = request.get_json()
        if not data or "yaml_content" not in data:
            return jsonify({"error": "No yaml_content provided"}), 400

        yaml_content = data["yaml_content"]
        coder_instance = get_coder()

        # Parse YAML
        try:
            parsed = yaml.safe_load(yaml_content)
        except yaml.YAMLError as e:
            return jsonify({"error": f"Invalid YAML: {str(e)}"}), 400

        if not isinstance(parsed, dict):
            return jsonify({"error": "YAML must be a dictionary"}), 400

        # Handle files_needed
        if "files_needed" in parsed:
            file_list = parsed["files_needed"]
            if not isinstance(file_list, list):
                return jsonify({"error": "files_needed must be a list"}), 400

            # Build response with full file content
            claude_feedback = "Here is the full code of your requested file(s):\n\n"

            for fname in file_list:
                # Add file to coder context
                coder_instance.add_rel_fname(fname)

                # Read full file content
                abs_path = coder_instance.abs_root_path(fname)
                content = coder_instance.io.read_text(abs_path)

                # Add file content to response
                claude_feedback += f"### {fname}\n```\n"
                if content is not None:
                    claude_feedback += content
                else:
                    claude_feedback += "(File not found or unreadable)"
                claude_feedback += "\n```\n\n"

            # Add invitation for more files
            claude_feedback += (
                "\n\nIf you need to see other files to complete the analysis, "
                "ask me in YAML with files_needed: ['filename.py'] "
                "and I'll provide them."
            )

            return jsonify({"claude_feedback": claude_feedback})

        # Handle code_changes
        elif "code_changes" in parsed:
            changes = parsed["code_changes"]
            if not isinstance(changes, list):
                return jsonify({"error": "code_changes must be a list"}), 400

            try:
                applied_count = 0
                edited_files = set()

                for change in changes:
                    if not isinstance(change, dict):
                        continue

                    fname = change.get("file")
                    search = change.get("search")
                    replace = change.get("replace")

                    if not fname or search is None or replace is None:
                        continue

                    # Get absolute path
                    abs_path = coder_instance.abs_root_path(fname)

                    # Read current content
                    content = coder_instance.io.read_text(abs_path)
                    if content is None:
                        raise ValueError(f"Cannot read file: {fname}")

                    # Apply SEARCH/REPLACE
                    new_content = do_replace(abs_path, content, search, replace, coder_instance.fence)

                    if new_content is None:
                        raise ValueError(
                            f"SEARCH block failed to match in {fname}:\n{search}"
                        )

                    # Write the new content
                    coder_instance.io.write_text(abs_path, new_content)
                    edited_files.add(fname)
                    applied_count += 1

                # Run linter on edited files
                lint_errors = ""
                if edited_files and coder_instance.linter:
                    lint_output_parts = []
                    for fname in edited_files:
                        abs_path = coder_instance.abs_root_path(fname)
                        try:
                            errors = coder_instance.linter.lint(abs_path)
                            if errors:
                                lint_output_parts.append(errors)
                        except Exception as lint_err:
                            # Gracefully handle linting errors
                            pass

                    if lint_output_parts:
                        lint_errors = "\n".join(lint_output_parts)

                # If lint errors found, return them without committing
                if lint_errors:
                    claude_feedback = (
                        f"⚠️ Linting errors found:\n\n{lint_errors}\n\n"
                        "Please fix these issues and provide corrected code in YAML."
                    )
                    return jsonify({"claude_feedback": claude_feedback})

                # Auto-commit if changes were made and no lint errors
                commit_info = ""
                if edited_files and coder_instance.repo and coder_instance.auto_commits:
                    result = coder_instance.repo.commit(
                        fnames=list(edited_files),
                        context="Applied code changes via API",
                        aider_edits=True,
                        coder=coder_instance,
                    )
                    if result:
                        commit_hash, commit_message = result
                        commit_info = f"\nCommit: {commit_hash[:7]}"

                # Success message with lint status
                if coder_instance.linter:
                    claude_feedback = f"✅ Applied and linted clean{commit_info}\n\nPlease verify changes and provide next steps in YAML."
                else:
                    claude_feedback = f"✅ Applied {applied_count} change(s){commit_info}\n\nPlease verify changes and provide next steps in YAML."

                return jsonify({"claude_feedback": claude_feedback})

            except Exception as e:
                error_msg = str(e)
                claude_feedback = (
                    f"❌ Error applying changes:\n{error_msg}\n\n"
                    "Please review and give corrected code in YAML."
                )
                return jsonify({"claude_feedback": claude_feedback})

        else:
            return jsonify({"error": "YAML must contain 'files_needed' or 'code_changes'"}), 400

    except Exception as e:
        error_message = traceback.format_exc()
        return jsonify({"error": error_message}), 500


def api_server_main():
    get_coder()  # Initialize coder at startup
    app.run(port=5000)


if __name__ == "__main__":
    api_server_main()
