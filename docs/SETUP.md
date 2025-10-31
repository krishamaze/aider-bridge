# Aider Bridge - Setup Guide

Complete guide to use Aider Bridge with Claude.ai or Perplexity.ai.

## Prerequisites

Before starting, make sure you have:

- ✅ Python 3.9 or higher
- ✅ Aider installed (`pip show aider-ai`)
- ✅ Chrome or Chromium browser
- ✅ API key set (GEMINI_API_KEY, ANTHROPIC_API_KEY, or similar)

## Installation Steps

### Step 1: Install Dependencies

cd api-server
pip install -r requirements.txt

text

### Step 2: Start API Server

#### Option A: Windows Batch
scripts\start-api.bat

text

#### Option B: Windows PowerShell
.\scripts\start-api.ps1

text

API should start on: [**http://localhost:5000**](http://localhost:5000)

You should see:
Running on http://127.0.0.1:5000
Press CTRL+C to quit

text

### Step 3: Install Chrome Extension

1. Open **chrome://extensions/**
2. Enable **Developer mode** (toggle on top right)
3. Click **Load unpacked**
4. Select the **extension** folder
5. You should see "Aider Bridge" extension installed

### Step 4: Test Connection

1. Go to https://claude.ai or https://www.perplexity.ai
2. Click the **Aider Bridge** extension icon (top right)
3. You should see:
   - ✅ API Connected (green)
   - Platform: Claude.ai or Perplexity.ai

## How to Use

### Step 1: Create YAML in Claude

Ask Claude to create a YAML response:

Please create a Python script to read a CSV file. Format the response as:

response_type: ready_to_code
code_changes:

file: "script.py"
search: "# placeholder"
replace: "# actual code here"

text

### Step 2: Run Aider Bridge

1. Claude responds with YAML (in a code block)
2. Click **Aider Bridge** extension icon
3. Click **▶️ Run Aider Bridge** button
4. The response auto-fills your input!

### Step 3: Complete the Conversation

5. Press Enter to send
6. Claude continues helping!

## Example YAML Formats

### Request Files
response_type: need_files
files_needed: ["app.py", "config.py"]
next_step: "Show me the existing code structure"

text

### Apply Code Changes
response_type: ready_to_code
code_changes:

file: "src/main.py"
search: "def process():\n pass"
replace: "def process():\n # Implementation\n return True"

file: "src/utils.py"
search: "class Helper:\n pass"
replace: "class Helper:\n def init(self):\n pass"

text

## Troubleshooting

### Extension not showing?
- Refresh the page
- Make sure you''re on claude.ai or perplexity.ai
- Check chrome://extensions/ - should be enabled

### API not connecting?
- Make sure API is running: `scripts\start-api.bat`
- Check http://localhost:5000/context in browser
- Make sure API key is set

### YAML not detected?
- YAML must be in a code block (triple backticks)
- Must include `response_type: need_files` or `response_type: ready_to_code`
- Must be in the last AI message

### Input not filling?
- Check console (F12) for errors
- Make sure platform is detected (Claude or Perplexity)
- Try refreshing the page

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /context | GET | Get repository context |
| /execute | POST | Execute YAML request |
| /chat | POST | Send chat message |
| /files | POST | Add files to context |

## File Structure

aider-bridge-package/
├── api-server/
│ ├── api_server.py # Main API
│ └── requirements.txt # Dependencies
├── extension/
│ ├── manifest.json # Extension config
│ ├── content.js # Core logic
│ ├── popup.html # UI
│ └── popup.js # UI logic
├── scripts/
│ ├── start-api.bat # Windows startup
│ └── start-api.ps1 # PowerShell startup
└── docs/
└── SETUP.md # This file

text

## Next Steps

1. ✅ Setup complete!
2. Open Claude.ai or Perplexity.ai
3. Test with a simple YAML request
4. Start building!

---

**Need help?** Check the console (F12) for error messages.
