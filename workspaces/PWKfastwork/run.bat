@echo off
setlocal
title PWKfastwork - Job Portal
cd /d "%~dp0"

echo ====================================================
echo      PWKfastwork - Modern Job Portal Platform
echo ====================================================
echo.
echo Starting server on http://localhost:3001 ...
echo.

start "PWKfastwork Server" cmd /k "npm.cmd run dev"

timeout /t 3 >nul
start http://localhost:3001

echo.
echo Server is running at http://localhost:3001
echo To stop, simply close the opened server window.
echo.
pause
