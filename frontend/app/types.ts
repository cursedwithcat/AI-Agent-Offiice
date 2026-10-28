export type AgentRoleId =
  | 'ceo'
  | 'pm'
  | 'designer'
  | 'architect'
  | 'database'
  | 'backend'
  | 'frontend'
  | 'security'
  | 'qa'
  | 'maintenance'
  | 'developer';

export interface RoleInfo {
  id: AgentRoleId;
  name: string;
  title: string;
  department: string;
  avatar: string;
  color: string;
  tagline: string;
  description: string;
  system_prompt?: string;
  personality?: string;
  level?: number;
  status?: string;
  skills?: string[];
  model?: string;
  effort?: string;
}

export interface AvailableModel {
  id: string;
  name: string;
  family?: string;
}

export interface ModelListResponse {
  models: AvailableModel[];
  efforts: string[];
}

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  created_at: string;
  file_count: number;
}

export interface FileNode {
  name: string;
  path: string;
  rel_path: string;
  type: 'file' | 'directory';
  size: number;
  children?: FileNode[];
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  total_tokens: number;
}

export type WorkflowMode = 'pipeline' | 'meeting' | 'single' | 'maintenance';

export interface StreamEvent {
  run_id?: string;
  step:
    | 'run_start'
    | 'phase_change'
    | 'thinking'
    | 'stdout'
    | 'tool_call'
    | 'tool_result'
    | 'agent_done'
    | 'approval_required'
    | 'run_complete'
    | 'error'
    | 'result'
    | 'init'
    | 'stderr'
    | 'token_usage'
    | 'ping';
  agent_id?: string;
  agent_name?: string;
  role_title?: string;
  avatar?: string;
  color?: string;
  phase?: string;
  content?: string;
  tool?: string;
  parameters?: Record<string, any>;
  state?: 'ACTIVE' | 'DONE';
  duration_seconds?: number;
  status?: string;
  metadata?: Record<string, any>;
  usage?: TokenUsage;
  design_deliverable?: string;
  timestamp?: string;
  model?: string;
  effort?: string;
}

export interface DialogueMessage {
  id: string;
  agent_id?: string;
  agent_name?: string;
  role_title?: string;
  avatar?: string;
  color?: string;
  phase?: string;
  type: 'message' | 'tool' | 'phase' | 'system' | 'approval';
  content: string;
  thinking?: string;
  toolName?: string;
  toolParams?: Record<string, any>;
  toolState?: 'ACTIVE' | 'DONE';
  toolDuration?: number;
  design_deliverable?: string;
  timestamp: string;
  model?: string;
  effort?: string;
  isSimulation?: boolean;
}

export interface PipelineCheckpoint {
  projectId: string;
  prompt: string;
  completedRoles: AgentRoleId[];
  resumeFromRole: AgentRoleId;
  deliverables: Record<string, string>;
  lastPhaseTitle?: string;
  timestamp: string;
}
