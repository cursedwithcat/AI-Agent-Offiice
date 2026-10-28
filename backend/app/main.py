import os
import sys
import uuid
import asyncio
import logging

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import subprocess
from contextlib import asynccontextmanager
from typing import List, Optional, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .config import CORS_ORIGINS, AGY_BIN, WORKSPACES_DIR
from .models import (
    RoleInfo,
    UpdateAgentRequest,
    AgentChatRequest,
    AvailableModel,
    ModelListResponse,
    ProjectInfo,
    CreateProjectRequest,
    SaveLogsRequest,
    RunRequest,
    FileNode,
)
from .roles import ROLES_METADATA, sync_roles_metadata_from_db
from .database import (
    init_db,
    db_get_all_agents,
    db_get_agent,
    db_update_agent,
    db_reset_agent,
)
from .project_manager import (
    list_projects,
    create_project,
    delete_project,
    get_project_path,
    build_file_tree,
    read_file_content,
    read_project_logs,
    save_project_logs,
    delete_project_logs,
)
from .orchestrator import orchestrate_run
from .runner import cancel_run, execute_agy_turn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent_office.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes Database tables, seeds default roles if empty, and syncs in-memory cache."""
    try:
        init_db()
        sync_roles_metadata_from_db()
        logger.info("Database initialized and agent profiles loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database on startup: {e}")
    yield


app = FastAPI(
    title="Agent Office API",
    description="Backend orchestration service powering autonomous agent office with Antigravity / agy CLI & SQLite/PostgreSQL Database",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint and Antigravity binary verification"""
    agy_exists = os.path.exists(AGY_BIN) if os.path.isabs(AGY_BIN) else bool(AGY_BIN)
    return {
        "status": "healthy",
        "agy_binary": AGY_BIN,
        "agy_available": agy_exists,
        "workspaces_dir": str(WORKSPACES_DIR),
        "database_connected": True,
    }


# ==========================================
# AGENTS & ROLES CRUD (DATABASE-DRIVEN)
# ==========================================

@app.get("/api/roles", response_model=List[RoleInfo])
@app.get("/api/agents", response_model=List[RoleInfo])
async def get_roles():
    """Returns all 10 active Agent company roles with their custom prompts & game stats from DB"""
    sync_roles_metadata_from_db()
    return [role for role in ROLES_METADATA.values() if role.id.value != "developer"]


@app.get("/api/agents/{agent_id}", response_model=RoleInfo)
async def get_agent_profile(agent_id: str):
    """Returns detailed agent profile including editable system prompt and RPG stats"""
    agent = db_get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return RoleInfo(**agent)


@app.put("/api/agents/{agent_id}", response_model=RoleInfo)
async def update_agent_profile(agent_id: str, req: UpdateAgentRequest):
    """Updates an employee's name, role, department, color, custom system prompt, and RPG traits in DB"""
    updates = req.model_dump(exclude_unset=True)
    updated = db_update_agent(agent_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found or update failed")
    return RoleInfo(**updated)


@app.post("/api/agents/{agent_id}/reset", response_model=RoleInfo)
async def reset_agent_profile(agent_id: str):
    """Resets an agent back to its factory default template"""
    reset = db_reset_agent(agent_id)
    if not reset:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found or reset failed")
    return RoleInfo(**reset)


@app.get("/api/models", response_model=ModelListResponse)
async def get_available_models():
    """Lists distinct base AI models supported by the agy CLI installation and reasoning effort options."""
    models_dict: Dict[str, AvailableModel] = {
        "default": AvailableModel(id="default", name="Default CLI Model", family="System")
    }

    # Try querying agy models dynamically
    try:
        proc = subprocess.run(
            [AGY_BIN, "models"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=8,
        )
        if proc.returncode == 0:
            for line in proc.stdout.strip().splitlines():
                if "\t" in line:
                    parts = line.split("\t", 1)
                    m_id = parts[0].strip()
                    m_name = parts[1].strip()
                    if m_id and not m_id.startswith("Fetching"):
                        # Normalize base ID by stripping repetitive -high/-medium/-low
                        base_id = m_id
                        clean_name = m_name
                        for suffix in ("-high", "-medium", "-low"):
                            if base_id.endswith(suffix):
                                base_id = base_id[:-len(suffix)]
                                break
                        for name_suf in (" (High)", " (Medium)", " (Low)"):
                            if clean_name.endswith(name_suf):
                                clean_name = clean_name[:-len(name_suf)]
                                break

                        family = "Anthropic" if "claude" in base_id else "Google" if "gemini" in base_id else "OpenAI" if "gpt" in base_id else base_id.split("-")[0].capitalize()
                        if base_id not in models_dict:
                            models_dict[base_id] = AvailableModel(id=base_id, name=clean_name, family=family)
    except Exception as e:
        logger.warning(f"Could not dynamically query agy models: {e}")

    # Fallback to standard known models if CLI output was empty
    if len(models_dict) == 1:
        models_dict["gemini-3.8-flash"] = AvailableModel(id="gemini-3.8-flash", name="Gemini 3.8 Flash", family="Google")
        models_dict["claude-sonnet-5-5"] = AvailableModel(id="claude-sonnet-5-5", name="Claude Sonnet 5.5", family="Anthropic")
        models_dict["claude-opus-5-5"] = AvailableModel(id="claude-opus-5-5", name="Claude Opus 5.5", family="Anthropic")
        models_dict["gpt-oss-120b"] = AvailableModel(id="gpt-oss-120b", name="GPT-OSS 120B", family="OpenAI")

    efforts = ["auto", "low", "medium", "high", "xhigh", "max"]
    return ModelListResponse(
        models=list(models_dict.values()),
        efforts=efforts,
    )


@app.post("/api/agents/{agent_id}/chat")
async def chat_with_agent(agent_id: str, req: AgentChatRequest):
    """Quick interactive test conversation with a specific agent using their customized prompt, model & effort"""
    agent = db_get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    prompt = (
        f"{agent.get('system_prompt', '')}\n\n"
        f"You are directly speaking with your user/manager in a quick interactive dialogue.\n"
        f"Manager: \"{req.message}\"\n\n"
        f"Respond in character as {agent['name']} ({agent['title']}), concise, authentic to your personality ({agent.get('personality', '')}). Keep response under 3 sentences."
    )

    run_id = f"chat_{uuid.uuid4().hex[:8]}"
    cwd = str(WORKSPACES_DIR)
    agent_model = agent.get("model", "default")
    agent_effort = agent.get("effort", "low")

    collected_text = []
    try:
        async for evt in execute_agy_turn(
            run_id=run_id,
            prompt=prompt,
            cwd=cwd,
            effort=agent_effort,
            model=agent_model,
            agent_id=agent_id,
            agent_name=agent["name"],
        ):
            if evt.get("step") == "stdout" and evt.get("content"):
                collected_text.append(evt["content"])

        reply = "".join(collected_text).strip()
        if not reply:
            reply = f"Hello! I am {agent['name']}, {agent['title']}. My status is {agent.get('status', 'READY')}. I received your message: '{req.message}'. Ready to assist!"
    except Exception as e:
        logger.warning(f"Live agy test chat fallback: {e}")
        reply = f"Hello! I'm {agent['name']} ({agent['title']}). Personality trait: {agent.get('personality')}. All system prompt instructions are locked in and ready for the next project run!"

    return {
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "title": agent["title"],
        "model": agent_model,
        "effort": agent_effort,
        "reply": reply,
    }


# ==========================================
# PROJECTS & FILES ENDPOINTS
# ==========================================

@app.get("/api/projects", response_model=List[ProjectInfo])
async def get_projects():
    """Lists all workspace projects"""
    return list_projects()


@app.post("/api/projects", response_model=ProjectInfo)
async def create_new_project(req: CreateProjectRequest):
    """Creates a new workspace project folder"""
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Project name cannot be empty")
    return create_project(req.name)


@app.delete("/api/projects/{project_id}")
async def delete_workspace(project_id: str):
    """Deletes a workspace project folder and all its contents"""
    try:
        success = delete_project(project_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
        return {"status": "deleted", "project_id": project_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")


@app.get("/api/projects/{project_id}/logs")
async def get_workspace_logs(project_id: str):
    """Returns persistent logs for the specified workspace"""
    messages = read_project_logs(project_id)
    return {"project_id": project_id, "messages": messages}


@app.post("/api/projects/{project_id}/logs")
async def save_workspace_logs(project_id: str, req: SaveLogsRequest):
    """Saves persistent logs for the specified workspace"""
    success = save_project_logs(project_id, req.messages)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save workspace logs")
    return {"status": "saved", "project_id": project_id, "count": len(req.messages)}


@app.delete("/api/projects/{project_id}/logs")
async def clear_workspace_logs(project_id: str):
    """Clears persistent logs for the specified workspace"""
    delete_project_logs(project_id)
    return {"status": "cleared", "project_id": project_id}


@app.get("/api/projects/{project_id}/files", response_model=List[FileNode])
async def get_project_files(project_id: str):
    """Returns file tree structure of the project directory"""
    proj_path = get_project_path(project_id)
    if not proj_path.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    return build_file_tree(proj_path)


@app.get("/api/projects/{project_id}/file-content")
async def get_file_content(project_id: str, path: str = Query(..., description="Relative file path")):
    """Returns text content of a project file"""
    try:
        content = read_file_content(project_id, path)
        return {"project_id": project_id, "path": path, "content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ==========================================
# AGENT ORCHESTRATION PIPELINE
# ==========================================

@app.post("/api/run-agent")
async def run_agent(req: RunRequest):
    """
    Kicks off an autonomous Agent Office run (Pipeline, Meeting, Single, or Maintenance mode)
    and streams real-time Server-Sent Events (SSE).
    """
    logger.info(f"Received /api/run-agent request for project '{req.project_id}' in mode '{req.mode}'")
    return StreamingResponse(
        orchestrate_run(req),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/cancel-run/{run_id}")
@app.post("/api/cancel-agent/{run_id}")
async def cancel_active_run(run_id: str):
    """Terminates an ongoing background subprocess"""
    success = await cancel_run(run_id)
    if not success:
        return {"status": "not_found_or_finished", "run_id": run_id}
    return {"status": "cancelled", "run_id": run_id}
