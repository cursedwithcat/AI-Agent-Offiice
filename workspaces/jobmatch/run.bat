@echo off
title Jobmatch Platform [http://localhost:3001]
cd /d "%~dp0"

echo ======================================================================
echo    JOBMATCH PLATFORM - 4-Sided Talent and Employability System
echo    (Seeker, Company ATS, University Analytics, Admin Center)
echo ======================================================================
echo.

:: 1. Verify Node.js Environment
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js [v18+ recommended] from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Verify npm Environment
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in PATH!
    echo Please ensure npm is correctly installed and added to PATH.
    echo.
    pause
    exit /b 1
)

:: 3. Verify SQLite Database State
if not exist "database\jobmatch.db" (
    echo [INFO] Database not found. Initializing SQLite WAL schema and seeds...
    call npm run db:migrate
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to initialize database!
        pause
        exit /b 1
    )
    echo [INFO] Database initialization completed successfully.
)

:: 4. Verify Dependencies
if not exist "node_modules\" (
    echo [INFO] Root node_modules missing. Installing dependencies...
    call npm install
)
if not exist "server\node_modules\" (
    echo [INFO] Server node_modules missing. Installing dependencies...
    call npm --prefix server install
)
if not exist "client\node_modules\" (
    echo [INFO] Client node_modules missing. Installing dependencies...
    call npm --prefix client install
)

:: 5. Launch Notification and Auto-open Browser
echo.
echo ======================================================================
echo    Starting Jobmatch Services...
echo     - Backend API : http://localhost:5000 (Proxy target and REST API)
echo     - Frontend App: http://localhost:3001 (Web Portal)
echo ======================================================================
echo.
echo [INFO] Opening default browser at http://localhost:3001 in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3001"

:: 6. Run Concurrent Services
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [NOTICE] Jobmatch process stopped with exit code %ERRORLEVEL%.
    pause
)
