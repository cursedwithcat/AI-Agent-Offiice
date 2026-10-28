import os
import shutil
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACES_DIR = ROOT_DIR / "workspaces"
BACKEND_DIR = ROOT_DIR / "backend"

# Ensure workspaces dir exists
WORKSPACES_DIR.mkdir(parents=True, exist_ok=True)

# Database URL: Supports SQLite (default) and PostgreSQL
DEFAULT_DB_PATH = BACKEND_DIR / "agent_office.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

# AGY executable lookup
custom_agy_path = os.getenv("AGY_PATH")
if custom_agy_path and Path(custom_agy_path).exists():
    AGY_BIN = custom_agy_path
else:
    found_bin = shutil.which("agy") or shutil.which("agy.exe")
    if found_bin:
        AGY_BIN = found_bin
    else:
        local_app_data = os.getenv("LOCALAPPDATA")
        win_candidate = Path(local_app_data) / "agy" / "bin" / "agy.exe" if local_app_data else None
        unix_candidate = Path.home() / ".local" / "bin" / "agy"
        if win_candidate and win_candidate.exists():
            AGY_BIN = str(win_candidate)
        elif unix_candidate and unix_candidate.exists():
            AGY_BIN = str(unix_candidate)
        else:
            AGY_BIN = "agy"

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*",
]
