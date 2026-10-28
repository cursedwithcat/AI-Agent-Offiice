@echo off
title Agent Office Launcher
echo ========================================================
echo        AGENT OFFICE - AUTONOMOUS AI VENTURE
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "Agent Office Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/2] Starting Next.js Frontend on http://localhost:3000...
start "Agent Office Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ========================================================
echo System launched successfully!
echo - Frontend Web UI: http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo - Workspaces Path:  %~dp0workspaces
echo ========================================================
pause
