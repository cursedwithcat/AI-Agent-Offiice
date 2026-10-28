@echo off
title Agent Office Frontend
echo Starting Next.js Frontend on http://localhost:3000 ...
cd /d "%~dp0frontend"
npm.cmd run dev
pause
