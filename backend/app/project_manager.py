import os
import re
import datetime
import shutil
import stat
import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from .config import WORKSPACES_DIR
from .models import ProjectInfo, FileNode

logger = logging.getLogger("agent_office.project_manager")


def _handle_remove_readonly(func, path, exc):
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception:
        pass


def sanitize_project_name(name: str) -> str:
    """Sanitize name to safe folder name"""
    safe = re.sub(r"[^\w\-_]", "-", name.strip().lower())
    safe = re.sub(r"-+", "-", safe).strip("-")
    return safe or "project-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")


def get_project_path(project_id: str) -> Path:
    """Get absolute path of a project folder inside workspaces"""
    safe_id = sanitize_project_name(project_id)
    proj_path = WORKSPACES_DIR / safe_id
    proj_path.mkdir(parents=True, exist_ok=True)
    return proj_path


def list_projects() -> List[ProjectInfo]:
    """List all projects in workspaces directory"""
    projects = []
    if not WORKSPACES_DIR.exists():
        return projects

    for entry in WORKSPACES_DIR.iterdir():
        if entry.is_dir() and not entry.name.startswith("."):
            try:
                # Count files ignoring large hidden folders
                file_count = 0
                for root, dirs, files in os.walk(entry):
                    dirs[:] = [d for d in dirs if d not in [".git", "node_modules", "__pycache__", ".venv", ".next"]]
                    file_count += len(files)

                stat = entry.stat()
                created = datetime.datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d %H:%M:%S")

                projects.append(
                    ProjectInfo(
                        id=entry.name,
                        name=entry.name.replace("-", " ").title(),
                        path=str(entry),
                        created_at=created,
                        file_count=file_count,
                    )
                )
            except Exception:
                continue

    # Sort newest first
    projects.sort(key=lambda p: p.created_at, reverse=True)
    return projects


def create_project(name: str) -> ProjectInfo:
    """Create a new project folder"""
    safe_id = sanitize_project_name(name)
    proj_path = WORKSPACES_DIR / safe_id
    proj_path.mkdir(parents=True, exist_ok=True)

    # Initialize a starter README if empty
    readme_path = proj_path / "README.md"
    if not readme_path.exists():
        readme_path.write_text(
            f"# {name}\n\nProject initialized by Agent Office on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n",
            encoding="utf-8",
        )

    return ProjectInfo(
        id=safe_id,
        name=name,
        path=str(proj_path),
        created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        file_count=1,
    )


def delete_project(project_id: str) -> bool:
    """Safely delete a workspace project folder and all its contents"""
    safe_id = sanitize_project_name(project_id)
    proj_path = (WORKSPACES_DIR / safe_id).resolve()
    workspaces_root = WORKSPACES_DIR.resolve()

    # Prevent directory traversal
    if not str(proj_path).startswith(str(workspaces_root)) or proj_path == workspaces_root:
        raise ValueError("Invalid project path outside workspaces directory")

    if not proj_path.exists() or not proj_path.is_dir():
        return False

    try:
        shutil.rmtree(proj_path, onerror=_handle_remove_readonly)
        return True
    except Exception as e:
        logger.error(f"Failed to delete project directory {proj_path}: {e}")
        raise


def get_project_logs_path(project_id: str) -> Path:
    """Path to the persistent logs JSON file for a workspace"""
    safe_id = sanitize_project_name(project_id)
    proj_path = WORKSPACES_DIR / safe_id
    return proj_path / ".agent_office_logs.json"


def read_project_logs(project_id: str) -> List[Dict[str, Any]]:
    """Read saved workspace dialogue/stream messages"""
    logs_file = get_project_logs_path(project_id)
    if not logs_file.exists():
        return []
    try:
        with open(logs_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and "messages" in data:
                return data["messages"]
            return []
    except Exception as e:
        logger.warning(f"Error reading project logs for {project_id}: {e}")
        return []


def save_project_logs(project_id: str, messages: List[Dict[str, Any]]) -> bool:
    """Save workspace dialogue/stream messages"""
    safe_id = sanitize_project_name(project_id)
    proj_path = WORKSPACES_DIR / safe_id
    if not proj_path.exists():
        proj_path.mkdir(parents=True, exist_ok=True)
    logs_file = proj_path / ".agent_office_logs.json"
    try:
        with open(logs_file, "w", encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving project logs for {project_id}: {e}")
        return False


def delete_project_logs(project_id: str) -> bool:
    """Delete saved workspace dialogue/stream messages"""
    logs_file = get_project_logs_path(project_id)
    if logs_file.exists():
        try:
            logs_file.unlink()
            return True
        except Exception as e:
            logger.error(f"Error deleting logs for {project_id}: {e}")
            return False
    return True


def build_file_tree(base_path: Path, current_path: Optional[Path] = None) -> List[FileNode]:
    """Recursively builds file hierarchy tree"""
    if current_path is None:
        current_path = base_path

    if not current_path.exists():
        return []

    nodes: List[FileNode] = []
    ignored = {".git", "node_modules", "__pycache__", ".venv", ".next", ".turbo"}

    try:
        entries = sorted(current_path.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower()))
        for entry in entries:
            if entry.name in ignored or entry.name.startswith("."):
                continue

            rel_path = str(entry.relative_to(base_path)).replace("\\", "/")
            if entry.is_dir():
                children = build_file_tree(base_path, entry)
                nodes.append(
                    FileNode(
                        name=entry.name,
                        path=str(entry),
                        rel_path=rel_path,
                        type="directory",
                        size=0,
                        children=children,
                    )
                )
            else:
                nodes.append(
                    FileNode(
                        name=entry.name,
                        path=str(entry),
                        rel_path=rel_path,
                        type="file",
                        size=entry.stat().st_size,
                        children=None,
                    )
                )
    except Exception:
        pass

    return nodes


def read_file_content(project_id: str, rel_path: str) -> str:
    """Safe read of file content within project directory"""
    proj_path = get_project_path(project_id)
    target = (proj_path / rel_path).resolve()

    # Prevent directory traversal
    if not str(target).startswith(str(proj_path.resolve())):
        raise ValueError("Invalid file path outside project workspace")

    if not target.exists() or target.is_dir():
        raise FileNotFoundError(f"File not found: {rel_path}")

    # Maximum 1MB read
    if target.stat().st_size > 1024 * 1024:
        return "File too large to display (> 1MB)"

    try:
        return target.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return f"Error reading file: {str(e)}"
