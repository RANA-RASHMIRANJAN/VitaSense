$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root "backend"

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

Write-Host "Starting backend (port 5000)..."
Push-Location $backend
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" | Out-Null
Pop-Location

Write-Host "Backend should be available at http://localhost:5000/api/health"

