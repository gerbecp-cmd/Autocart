@echo off
setlocal
cd /d "%~dp0"
start "AutoCart Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0AutoCart-LocalServer.ps1"
exit /b 0
