# Local Development Startup Script for Thandatti Foods
# This script starts both backend API and frontend UI servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Thandatti Foods - Local Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists in backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ ERROR: backend/.env file not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env file with database configuration." -ForegroundColor Yellow
    exit 1
}

# Check if database password is set
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -match "DB_PASSWORD=your_password_here") {
    Write-Host "⚠️  WARNING: Database password not set!" -ForegroundColor Yellow
    Write-Host "Please update DB_PASSWORD in backend/.env with your actual database password." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
Set-Location backend
node test-db-connection.js
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Database connection failed. Please fix the connection issues before continuing." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ Database connection successful!" -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "Starting backend API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend UI server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers are starting..." -ForegroundColor Green
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running in separate windows)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

