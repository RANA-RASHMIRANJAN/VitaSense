$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

$npm = Get-Command "npm" -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host "ERROR: npm not found. Install Node.js (LTS) and ensure PATH includes npm." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $backend "node_modules"))) {
  Write-Host "Installing backend dependencies..."
  Push-Location $backend
  & npm install
  Pop-Location
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Installing frontend dependencies..."
  Push-Location $frontend
  & npm install
  Pop-Location
}

Write-Host "Starting backend (port 5000)..."
Push-Location $backend
$backendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Pop-Location

Write-Host "Starting frontend (port 3000)..."
Push-Location $frontend
$frontendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "start" -PassThru -NoNewWindow
Pop-Location

Write-Host "Launched:"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:5000/api/health"

Write-Host "Processes:"
Write-Host "  backend PID:  $($backendProc.Id)"
Write-Host "  frontend PID: $($frontendProc.Id)"

