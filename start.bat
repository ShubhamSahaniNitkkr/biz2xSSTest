@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo  Financial Wellness Agent - Starting...
echo ============================================
echo.

if not exist "backend\.env" (
  echo [setup] Creating backend\.env from .env.example
  copy "backend\.env.example" "backend\.env" >nul
)

if not exist "frontend\.env" (
  echo [setup] Creating frontend\.env from .env.example
  copy "frontend\.env.example" "frontend\.env" >nul
)

if not exist "backend\node_modules" (
  echo [setup] Installing backend dependencies...
  cd backend
  call npm install
  cd ..
)

if not exist "frontend\node_modules" (
  echo [setup] Installing frontend dependencies...
  cd frontend
  call npm install
  cd ..
)

echo [seed] Seeding database...
cd backend
call npm run seed
if errorlevel 1 (
  echo [error] Seed failed. Check backend\.env and try again.
  pause
  exit /b 1
)
cd ..

echo.
echo [start] Backend  - http://localhost:3001
echo [start] Frontend - http://localhost:5173
echo.

start "Financial Wellness - Backend" /D "%~dp0backend" cmd /k npm run dev
timeout /t 2 /nobreak >nul
start "Financial Wellness - Frontend" /D "%~dp0frontend" cmd /k npm run dev

echo.
echo Both servers are starting in separate windows.
echo Open http://localhost:5173 in your browser.
echo Login: employee1@company.com
echo.
pause
