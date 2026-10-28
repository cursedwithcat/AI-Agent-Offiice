#!/usr/bin/env bash
# Agent Office Launcher (macOS & Linux)

echo "========================================================"
echo "       AGENT OFFICE - AUTONOMOUS AI VENTURE"
echo "========================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/2] Starting FastAPI Backend on http://localhost:8000..."
(cd "$SCRIPT_DIR/backend" && python run.py) &
BACKEND_PID=$!

echo "[2/2] Starting Next.js Frontend on http://localhost:3000..."
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "System launched successfully!"
echo "- Frontend Web UI: http://localhost:3000"
echo "- Backend API Docs: http://localhost:8000/docs"
echo "- Workspaces Path:  $SCRIPT_DIR/workspaces"
echo "========================================================"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
