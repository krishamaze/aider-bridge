# Aider Bridge API Server - PowerShell
# Usage: .\start-api.ps1 [model] [port]

param(
    [string]$Model = "gemini",
    [int]$Port = 5000
)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Aider Bridge API Server" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Model: $Model"
Write-Host "Port: $Port"
Write-Host ""

python api_server.py
