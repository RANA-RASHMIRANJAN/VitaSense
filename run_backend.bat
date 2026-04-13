@echo off
setlocal

set ROOT=%~dp0
set BACKEND=%ROOT%backend

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: `npm` not found. Install Node.js (LTS) and ensure PATH is updated.
  pause
  exit /b 1
)

cd /d "%BACKEND%"
npm install
npm run dev

