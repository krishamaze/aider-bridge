# Aider Bridge - Complete Package

Complete system for using Claude/Perplexity with Aider via API.

## 📦 What''s Included

✅ Aider API Server (Flask)
✅ Browser extension code (Chrome)
✅ Startup scripts (Windows)
✅ Requirements file
✅ Documentation

## 🚀 Quick Start

### 1. Install Dependencies
pip install -r api-server/requirements.txt

text

### 2. Start API Server
Windows (batch)
scripts\start-api.bat

Windows (PowerShell)
.\scripts\start-api.ps1

Then API runs on: http://localhost:5000
text

### 3. Install Chrome Extension
- Go to chrome://extensions/
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `extension/` folder

### 4. Use It!
- Open Claude.ai or Perplexity.ai
- Ask for code
- Create YAML response
- Extension auto-fills!

## 📋 File Structure

aider-bridge-package/
├── api-server/ # Backend API
│ ├── api_server.py # Main server
│ └── requirements.txt # Dependencies
├── extension/ # Chrome extension (to be added)
├── scripts/ # Startup scripts
│ ├── start-api.bat
│ └── start-api.ps1
└── docs/ # Documentation (to be added)

text

## ✅ Status Check

Before starting, verify:
1. Python 3.9+ installed
2. Aider installed (pip show aider-ai)
3. Port 5000 available
4. API key set (GEMINI_API_KEY or similar)

## 🔗 API Endpoints

- GET /context - Repository info
- POST /chat - Send messages
- POST /files - Add files
- POST /execute - Execute YAML

## 📚 Next Steps

1. Read SETUP.md for detailed guide
2. Check extension/ folder for browser code
3. Create YAML in your AI chat
4. Click extension "Run Full Test"

---
Made with ❤️ for developers
