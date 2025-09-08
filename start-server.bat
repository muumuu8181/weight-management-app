@echo off
echo Starting HTTP Server for Weight Management App...
echo Please open browser and go to: http://localhost:3000
echo Press Ctrl+C to stop the server
cd /d "%~dp0"
python -m http.server 3000
pause