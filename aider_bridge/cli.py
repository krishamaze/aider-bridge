"""Command line interface for Aider Bridge"""
import sys
from pathlib import Path
from aider_bridge.api_server import create_app

def start_server(port=5000, debug=False):
    """Start the Aider Bridge API server"""
    app = create_app()
    app.run(host="127.0.0.1", port=port, debug=debug)

def main():
    """CLI entry point"""
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print(f"🚀 Starting Aider Bridge API on http://127.0.0.1:{port}")
    start_server(port=port)

if __name__ == "__main__":
    main()
