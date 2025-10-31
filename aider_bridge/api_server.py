#!/usr/bin/env python

import traceback
from pathlib import Path
import yaml
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

coder = None

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "aider-bridge API running", "version": "0.1.0"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/context", methods=["GET"])
def get_context():
    try:
        return jsonify({
            "status": "ready",
            "message": "Context endpoint ready"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400
        message = data["message"]
        return jsonify({"response": f"Echo: {message}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/files", methods=["POST"])
def add_files():
    try:
        data = request.get_json()
        if not data or "fnames" not in data:
            return jsonify({"error": "No filenames provided"}), 400
        fnames = data["fnames"]
        return jsonify({"message": f"Added {len(fnames)} file(s)"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/execute", methods=["POST"])
def execute():
    try:
        data = request.get_json()
        if not data or "yaml_content" not in data:
            return jsonify({"error": "No yaml_content provided"}), 400
        yaml_content = data["yaml_content"]
        try:
            parsed = yaml.safe_load(yaml_content)
        except yaml.YAMLError as e:
            return jsonify({"error": f"Invalid YAML: {str(e)}"}), 400
        return jsonify({"claude_feedback": "YAML received and parsed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def api_server_main():
    app.run(port=5000, debug=True)

if __name__ == "__main__":
    api_server_main()
