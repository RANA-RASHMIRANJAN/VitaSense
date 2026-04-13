$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontend = Join-Path $root "frontend"

$npm = Get-Command "npm" -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host "ERROR: npm not found. Install Node.js (LTS) and ensure PATH includes npm." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Installing frontend dependencies..."
  Push-Location $frontend
  & npm install
  Pop-Location
}

Write-Host "Starting frontend (port 3000)..."
Push-Location $frontend
Start-Process -FilePath "npm.cmd" -ArgumentList "start" | Out-Null
Pop-Location

Write-Host "Frontend should be available at http://localhost:3000"

