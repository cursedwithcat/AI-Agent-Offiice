from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class AgentRole(str, Enum):
    CEO = "ceo"
    PM = "pm"
    DESIGNER = "designer"
    ARCHITECT = "architect"
    DATABASE = "database"
    BACKEND = "backend"
    FRONTEND = "frontend"
    SECURITY = "security"
    QA = "qa"
    MAINTENANCE = "maintenance"
    # Legacy alias support
    DEVELOPER = "developer"


class WorkflowMode(str, Enum):
    PIPELINE = "pipeline"        # Full lifecycle: CEO -> PM -> Designer -> Architect -> DB -> Backend -> Frontend -> Security -> QA -> Maintenance
    MEETING = "meeting"          # Round-table discussion & consultation
    SINGLE = "single"            # Direct execution with one selected agent
    MAINTENANCE = "maintenance"  # Post-project change request, triage, coordination & dispatch


class RoleInfo(BaseModel):
    id: AgentRole
    name: str
    title: str
    department: str
    avatar: str
    color: str
    tagline: str
    description: str
    system_prompt: Optional[str] = None
    personality: Optional[str] = None
    level: Optional[int] = 5
    status: Optional[str] = "READY"
    skills: Optional[List[str]] = Field(default_factory=list)
    model: Optional[str] = "default"
    effort: Optional[str] = "medium"


class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    color: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    personality: Optional[str] = None
    level: Optional[int] = None
    status: Optional[str] = None
    skills: Optional[List[str]] = None
    model: Optional[str] = None
    effort: Optional[str] = None


class AvailableModel(BaseModel):
    id: str
    name: str
    family: Optional[str] = None


class ModelListResponse(BaseModel):
    models: List[AvailableModel]
    efforts: List[str]


class AgentChatRequest(BaseModel):
    message: str


class ProjectInfo(BaseModel):
    id: str
    name: str
    path: str
    created_at: str
    file_count: int


class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = ""


class SaveLogsRequest(BaseModel):
    messages: List[Dict[str, Any]]


class RunRequest(BaseModel):
    project_id: str
    prompt: str
    mode: WorkflowMode = WorkflowMode.PIPELINE
    target_role: Optional[AgentRole] = None
    model: Optional[str] = None  # None = use per-agent DB setting; or override
    effort: Optional[str] = None  # None = use per-agent DB setting; or override (low, medium, high, xhigh, max)
    require_design_approval: Optional[bool] = True
    start_phase: Optional[str] = "start"  # "start", "after_design"
    design_spec: Optional[str] = None
    user_feedback: Optional[str] = None
    resume_from_role: Optional[AgentRole] = None
    previous_deliverables: Optional[Dict[str, str]] = None


class FileNode(BaseModel):
    name: str
    path: str
    rel_path: str
    type: str  # "file" or "directory"
    size: Optional[int] = 0
    children: Optional[List["FileNode"]] = None


class StreamMessage(BaseModel):
    run_id: str
    step: str  # "start", "thinking", "stdout", "tool_call", "tool_result", "phase_change", "complete", "error"
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
