@echo off
REM Aider Bridge API Server - Windows
REM Usage: start-api.bat [model] [port]

setlocal enabledelayedexpansion

set MODEL=%1
if "!MODEL!"=="" set MODEL=gemini

set PORT=%2
if "!PORT!"=="" set PORT=5000

echo.
echo ======================================
echo ?? Starting Aider Bridge API Server
echo ======================================
echo Model: !MODEL!
echo Port: !PORT!
echo.

python api_server.py

pause
