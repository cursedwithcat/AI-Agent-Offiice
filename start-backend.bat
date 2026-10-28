@echo off
title Agent Office Backend
echo Starting FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
python run.py
pause
