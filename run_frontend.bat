@echo off
setlocal

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: `npm` not found. Install Node.js (LTS) and ensure PATH is updated.
  pause
  exit /b 1
)

cd /d "%FRONTEND%"
npm install
npm start

