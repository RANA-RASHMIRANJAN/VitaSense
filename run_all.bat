@echo off
setlocal

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: npm not found.
  echo Install Node.js (LTS) and ensure PATH is updated, then re-run this script.
  echo.
  pause
  exit /b 1
)

echo.
echo Installing backend dependencies...
cd /d %BACKEND%
call npm install

echo.
echo Installing frontend dependencies...
cd /d %FRONTEND%
call npm install

echo.
echo Starting backend (port 5000)...
cd /d %BACKEND%
start "vitamin-backend" cmd /c "npm run dev"

echo.
echo Starting frontend (port 3000)...
cd /d %FRONTEND%
start "vitamin-frontend" cmd /c "npm start"

echo.
echo Done launching.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api/health
echo.
pause

