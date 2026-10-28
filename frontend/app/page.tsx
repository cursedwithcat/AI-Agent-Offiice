'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RoleInfo,
  ProjectInfo,
  FileNode,
  DialogueMessage,
  WorkflowMode,
  AgentRoleId,
  PipelineCheckpoint,
} from './types';
import { Header } from './components/Header';
import { AgentNodeGraph } from './components/AgentNodeGraph';
import { AgentDossierModal } from './components/AgentDossierModal';
import { ProjectLauncher } from './components/ProjectLauncher';
import { LiveStream } from './components/LiveStream';
import { FileExplorer } from './components/FileExplorer';
import { Layers, FolderCode, Sparkles } from 'lucide-react';

const ORDERED_PIPELINE_ROLES: AgentRoleId[] = [
  'ceo',
  'pm',
  'designer',
  'architect',
  'database',
  'backend',
  'frontend',
  'security',
  'qa',
  'maintenance',
];

export default function Home() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeAgentId, setActiveAgentId] = useState<string>('');
  const [activePhase, setActivePhase] = useState<string>('');
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [currentRunId, setCurrentRunId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'both' | 'stream' | 'files'>('both');
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);
  const [savedDesignSpec, setSavedDesignSpec] = useState<string>('');
  const [activeProjectPrompt, setActiveProjectPrompt] = useState<string>('');
  const [pipelineCheckpoint, setPipelineCheckpoint] = useState<PipelineCheckpoint | null>(null);
  const roleDeliverablesRef = useRef<Record<string, string>>({});

  const abortControllerRef = useRef<AbortController | null>(null);

  // RPG Employee Dossier & Custom Prompt Editor State
  const [selectedDossierAgent, setSelectedDossierAgent] = useState<RoleInfo | null>(null);

  const handleSaveAgent = async (updated: RoleInfo) => {
    try {
      const res = await fetch(`/api/agents/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data: RoleInfo = await res.json();
        setRoles((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        setSelectedDossierAgent((prev) => (prev && prev.id === data.id ? data : prev));
      }
    } catch (err) {
      console.error('Failed to update agent profile:', err);
    }
  };

  const handleResetAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/reset`, {
        method: 'POST',
      });
      if (res.ok) {
        const data: RoleInfo = await res.json();
        setRoles((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        setSelectedDossierAgent((prev) => (prev && prev.id === data.id ? data : prev));
      }
    } catch (err) {
      console.error('Failed to reset agent profile:', err);
    }
  };

  // 1. Health check & Initial Data
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: ProjectInfo[] = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching projects:', e);
    }
  }, [selectedProjectId]);

  const fetchFiles = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const res = await fetch(`/api/projects/${projId}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (e) {
      console.error('Error fetching files:', e);
    }
  }, []);

  const currentRunMessagesRef = useRef<DialogueMessage[]>([]);

  const saveWorkspaceLogsToBackend = useCallback(async (projId: string, msgs: DialogueMessage[]) => {
    if (!projId) return;
    const realMsgs = msgs.filter((m) => !m.isSimulation);
    try {
      localStorage.setItem(`agent_office_logs_${projId}`, JSON.stringify(realMsgs));
      await fetch(`/api/projects/${encodeURIComponent(projId)}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: realMsgs }),
      });
    } catch (err) {
      console.warn('Failed to save logs to backend:', err);
    }
  }, []);

  const fetchWorkspaceLogs = useCallback(async (projId: string) => {
    if (!projId) {
      setMessages([]);
      currentRunMessagesRef.current = [];
      return;
    }
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projId)}/logs`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          currentRunMessagesRef.current = data.messages;
          return;
        }
      }
      const cached = localStorage.getItem(`agent_office_logs_${projId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            currentRunMessagesRef.current = parsed;
            return;
          }
        } catch (_) {}
      }
      setMessages([]);
      currentRunMessagesRef.current = [];
    } catch (e) {
      console.warn('Error fetching workspace logs:', e);
      const cached = localStorage.getItem(`agent_office_logs_${projId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            currentRunMessagesRef.current = parsed;
            return;
          }
        } catch (_) {}
      }
      setMessages([]);
      currentRunMessagesRef.current = [];
    }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchRoles();
    fetchProjects();

    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchRoles, fetchProjects]);

  useEffect(() => {
    if (selectedProjectId && !isRunning) {
      fetchFiles(selectedProjectId);
      fetchWorkspaceLogs(selectedProjectId);
    }
  }, [selectedProjectId, isRunning, fetchFiles, fetchWorkspaceLogs]);

  // Create Project
  const handleCreateProject = async (name: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newProj: ProjectInfo = await res.json();
        await fetchProjects();
        setSelectedProjectId(newProj.id);
        await fetchFiles(newProj.id);
        setMessages([]);
        currentRunMessagesRef.current = [];
      }
    } catch (e) {
      console.error('Error creating project:', e);
    }
  };

  // Delete Project Workspace
  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) return;
    const proj = projects.find((p) => p.id === projectId);
    const projName = proj ? proj.name : projectId;

    const confirmDelete = window.confirm(
      `คุณต้องการลบ Workspace "${projName}" (${projectId}) ใช่หรือไม่?\n\nคำเตือน: ไฟล์และโค้ดทั้งหมดในโฟลเดอร์นี้จะถูกลบถาวร ไม่สามารถกู้คืนได้`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to delete workspace');
      }

      try {
        localStorage.removeItem(`agent_office_logs_${projectId}`);
      } catch (_) {}

      const projRes = await fetch('/api/projects');
      if (projRes.ok) {
        const updatedProjects: ProjectInfo[] = await projRes.json();
        setProjects(updatedProjects);
        if (updatedProjects.length > 0) {
          const nextId = updatedProjects[0].id;
          setSelectedProjectId(nextId);
          await fetchFiles(nextId);
          await fetchWorkspaceLogs(nextId);
        } else {
          setSelectedProjectId('');
          setFiles([]);
          setMessages([]);
          currentRunMessagesRef.current = [];
        }
      }
    } catch (err: any) {
      console.error('Delete workspace error:', err);
      alert(`เกิดข้อผิดพลาดในการลบ Workspace: ${err.message}`);
    }
  };

  // Read File Content
  const handleReadFile = async (relPath: string): Promise<string> => {
    const res = await fetch(
      `/api/projects/${selectedProjectId}/file-content?path=${encodeURIComponent(relPath)}`
    );
    if (!res.ok) {
      throw new Error('Failed to read file');
    }
    const data = await res.json();
    return data.content;
  };

  // Clear stream and persistent logs
  const handleClearMessages = async () => {
    if (messages.length === 0) return;
    const confirmClear = window.confirm('คุณต้องการลบประวัติ Log ทั้งหมดของ Workspace นี้ใช่หรือไม่?');
    if (!confirmClear) return;

    setMessages([]);
    currentRunMessagesRef.current = [];
    setCompletedAgents([]);
    setIsPendingApproval(false);
    setSavedDesignSpec('');

    if (selectedProjectId) {
      try {
        localStorage.removeItem(`agent_office_logs_${selectedProjectId}`);
        await fetch(`/api/projects/${encodeURIComponent(selectedProjectId)}/logs`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('Failed to delete workspace logs on backend:', e);
      }
    }
  };

  const simulationAbortRef = useRef(false);
  const activeAgentRef = useRef<string>('');
  const activePhaseRef = useRef<string>('');
  const lastRunConfigRef = useRef<{ effort?: string; modelOverride?: string }>({});

  // Cancel execution
  const handleCancelRun = async () => {
    simulationAbortRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (currentRunId) {
      try {
        await fetch(`/api/cancel-run/${currentRunId}`, { method: 'POST' });
      } catch (e) {
        console.error('Error cancelling run:', e);
      }
    }
    setIsRunning(false);

    // Save checkpoint if cancelled mid-pipeline
    const curAgent = activeAgentRef.current || activeAgentId;
    const curPhase = activePhaseRef.current || activePhase;
    if (curAgent) {
      const currentRoleIdx = ORDERED_PIPELINE_ROLES.indexOf(curAgent as AgentRoleId);
      const completedList = currentRoleIdx > 0 ? ORDERED_PIPELINE_ROLES.slice(0, currentRoleIdx) : [];
      setPipelineCheckpoint({
        projectId: selectedProjectId,
        prompt: activeProjectPrompt,
        completedRoles: completedList,
        resumeFromRole: curAgent as AgentRoleId,
        deliverables: { ...roleDeliverablesRef.current },
        lastPhaseTitle: curPhase,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    }
  };

  const seqRef = useRef(0);
  const genUniqueId = useCallback((prefix: string) => {
    seqRef.current += 1;
    return `${prefix}-${Date.now()}-${seqRef.current}-${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  // Run Test Simulation for Node Topology
  const handleRunTestSimulation = async () => {
    setIsRunning(true);
    setCompletedAgents([]);
    simulationAbortRef.current = false;
    const timeStr = () =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: genUniqueId('sys'),
        type: 'system',
        isSimulation: true,
        content: `**Simulation Mode Initialized**: Executing full 5-node agent topology test run with animated handovers and sample deliverables.`,
        timestamp: timeStr(),
      },
    ]);

    const simSteps = [
      {
        role: 'ceo',
        phase: 'Phase 1: Executive Vision & Scoping',
        title: 'Chief Executive Officer (CEO)',
        color: '#2563EB',
        tokens: { input: 1250, output: 780, thinking: 310 },
        message: '### Executive Vision & Scoping\nWe are launching the autonomous Enterprise Task Tracker application. The core objective is high performance, modular architecture, and immediate value delivery.\n\n- Scope: Full-stack MVP in 5 minutes\n- Directives: Focus on core task CRUD, clean styling, and local persistence.',
      },
      {
        role: 'pm',
        phase: 'Phase 2: Product & Feature Specifications',
        title: 'Lead Product Manager (PM)',
        color: '#7C3AED',
        tokens: { input: 2180, output: 1420, thinking: 580 },
        message: '### Product Specifications & User Stories\nBreaking down executive requirements into functional milestones:\n\n1. **User Story 1**: Task creation with title, priority tag, and deadline\n2. **User Story 2**: Interactive status toggling (Active / Completed)\n3. **Acceptance Criteria**: State survives browser reload via LocalStorage/DB.',
      },
      {
        role: 'designer',
        phase: 'Phase 3: UI/UX Design System & Wireframes',
        title: 'Lead UI/UX Designer',
        color: '#E11D48',
        tokens: { input: 3200, output: 2100, thinking: 890 },
        message: '### UI/UX Specifications & Design System\nCrafted complete design tokens and component wireframes:\n\n- Color Palette: Deep Slate (`#0f172a`), Clean White (`#ffffff`), Accent Indigo (`#4f46e5`)\n- Layout: Responsive Dual-Panel Dashboard with Fluid Card Grid\n- Interaction: Micro-animations on status toggles, floating action bar\n\n```\n+-------------------------------------------------------------+\n| [Dashboard]   [All Tasks: 12]   [Pending: 4]   [Done: 8]    |\n+-------------------------------------------------------------+\n| + Add Task Input Field                   [+ Create Button]  |\n+-------------------------------------------------------------+\n| [x] Implement DB schema        (High)      Due: Tomorrow    |\n| [ ] Build REST API router      (Medium)    Due: Friday      |\n+-------------------------------------------------------------+\n```\n\n**Design Approval Summary**: Layout and design tokens finalized. Awaiting client review and approval to proceed with engineering implementation.',
      },
      {
        role: 'architect',
        phase: 'Phase 4: System Architecture & Technical Blueprint',
        title: 'Chief System Architect',
        color: '#0284C7',
        tokens: { input: 3850, output: 2250, thinking: 1100 },
        message: '### Technical Blueprint & Architecture\nSelecting vanilla HTML5, CSS Grid, Express-style modular server, and SQLite persistence.\n\n- File Structure:\n  - `schema.sql`: Table definitions and relations\n  - `server.js`: API endpoints and routes\n  - `index.html`: Semantic application shell\n  - `app.js`: Client DOM reactivity and API syncing\n\nBlueprint approved. Handing off to Vikram (Database Architect) and Sean (Backend Engineer).',
      },
      {
        role: 'database',
        phase: 'Phase 5: Database Schema & Entity Models',
        title: 'Database & Data Architect',
        color: '#D97706',
        tokens: { input: 4100, output: 1950, thinking: 780 },
        tools: [
          { name: 'write_to_file', params: { TargetFile: 'schema.sql', size: '1.4 KB' } },
        ],
        message: '### Database Schema Deliverable\nDefined relational data model and persistence scripts directly in workspace:\n\n- `schema.sql`: Created `tasks` table with indexes on `status` and `priority`.\n- Data Integrity: Constraints on task title and auto-updating `updated_at` triggers.',
      },
      {
        role: 'backend',
        phase: 'Phase 6: Server API Logic & Routing',
        title: 'Senior Backend Engineer',
        color: '#4F46E5',
        tokens: { input: 4900, output: 3400, thinking: 1650 },
        tools: [
          { name: 'write_to_file', params: { TargetFile: 'server.js', size: '3.2 KB' } },
        ],
        message: '### Server Implementation Summary\nImplemented modular API routes and controller handlers:\n\n- `server.js`: RESTful endpoints (`GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`)\n- Database Connection: SQLite query mapper with error boundary middleware.',
      },
      {
        role: 'frontend',
        phase: 'Phase 7: Client Interface & Component Implementation',
        title: 'Senior Frontend Engineer',
        color: '#059669',
        tokens: { input: 5800, output: 4200, thinking: 2100 },
        tools: [
          { name: 'write_to_file', params: { TargetFile: 'index.html', size: '2.1 KB' } },
          { name: 'write_to_file', params: { TargetFile: 'app.js', size: '3.6 KB' } },
        ],
        message: '### Frontend UI Implementation Summary\nBuilt client views matching Maya Lin\'s UI/UX wireframes with pixel precision:\n\n- `index.html`: Modern responsive task management interface\n- `app.js`: Real-time state manager, LocalStorage fallback, and DOM reactivity.',
      },
      {
        role: 'security',
        phase: 'Phase 8: Security Audit & Code Hardening',
        title: 'DevSecOps & Security Specialist',
        color: '#DC2626',
        tokens: { input: 3900, output: 1600, thinking: 750 },
        tools: [
          { name: 'run_command', params: { CommandLine: 'audit_security_owasp server.js app.js' } },
        ],
        message: '### DevSecOps Security Audit Certificate\nPerformed automated inspection against OWASP Top 10 guidelines:\n\n- XSS Defense: DOM text sanitization verified\n- SQL Injection: Parameterized SQLite queries confirmed\n- Security Verdict: **PASSED (0 Critical Vulnerabilities)**',
      },
      {
        role: 'qa',
        phase: 'Phase 9: Quality Assurance & Delivery Gate',
        title: 'QA & Release Lead',
        color: '#0D9488',
        tokens: { input: 4100, output: 1850, thinking: 820 },
        tools: [
          { name: 'run_command', params: { CommandLine: 'syntax_check index.html server.js app.js' } },
        ],
        message: '### Quality Assurance & Release Sign-Off\nInspected all generated files across the workspace:\n\n- Syntax Validation: Passed (0 errors)\n- Regression Tests: 100% components operational\n- Final Verdict: **APPROVED FOR PRODUCTION DEPLOYMENT**\n\n*QA sign-off complete. Handing over to Maintenance & Operations!*',
      },
      {
        role: 'maintenance',
        phase: 'Phase 10: Operational Handover & Active Maintenance Readiness',
        title: 'Maintenance & Support Lead',
        color: '#F97316',
        tokens: { input: 3400, output: 1600, thinking: 690 },
        tools: [
          { name: 'write_to_file', params: { TargetFile: 'MAINTENANCE.md', size: '1.8 KB' } },
        ],
        message: '### Operational Baseline & Active Maintenance Readiness\nRegistered project into active post-launch lifecycle support:\n\n- Baseline Indexing: Monitored files (`index.html`, `server.js`, `schema.sql`, `app.js`)\n- Maintenance Channel: **ACTIVE & STANDBY**\n- Cross-Team Dispatch: Ready to triage incoming change requests, bug reports, and enhancements, dispatching tasks directly to Backend (Sean), Frontend (David), Database (Vikram), or Design (Maya).\n\n*All 10 department milestones verified!*',
      },
    ];

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < simSteps.length; i++) {
      if (simulationAbortRef.current) break;
      const step = simSteps[i];

      setActiveAgentId(step.role);
      setActivePhase(step.phase);

      // Milestone banner
      setMessages((prev) => [
        ...prev,
        {
          id: genUniqueId('phase'),
          type: 'phase',
          isSimulation: true,
          phase: step.phase,
          agent_id: step.role,
          agent_name: roles.find((r) => r.id === step.role)?.name || step.role,
          role_title: step.title,
          color: step.color,
          content: '',
          timestamp: timeStr(),
        },
      ]);

      await sleep(1000);
      if (simulationAbortRef.current) break;

      // Tools if any
      if (step.tools) {
        for (const t of step.tools) {
          if (simulationAbortRef.current) break;
          setMessages((prev) => [
            ...prev,
            {
              id: genUniqueId('tool'),
              type: 'tool',
              isSimulation: true,
              toolName: t.name,
              toolParams: t.params,
              toolState: 'DONE',
              toolDuration: 0.12,
              content: '',
              timestamp: timeStr(),
            },
          ]);
          await sleep(600);
        }
      }

      if (simulationAbortRef.current) break;

      // Agent message
      setMessages((prev) => [
        ...prev,
        {
          id: genUniqueId('msg'),
          type: 'message',
          isSimulation: true,
          agent_id: step.role,
          agent_name: roles.find((r) => r.id === step.role)?.name || step.role,
          role_title: step.title,
          color: step.color,
          content: step.message,
          timestamp: timeStr(),
        },
      ]);

      setCompletedAgents((prev) => [...prev, step.role]);
      await sleep(1200);
    }

    setIsRunning(false);
    setActiveAgentId('');
    setActivePhase('');

    if (!simulationAbortRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: genUniqueId('sys'),
          type: 'system',
          isSimulation: true,
          content: `**Enterprise Company Topology Simulation Completed**: All 10 department nodes and deliverables verified and operational.`,
          timestamp: timeStr(),
        },
      ]);
    }
  };

  // Launch Run via SSE Stream
  const handleStartRun = async (
    projectId: string,
    prompt: string,
    mode: WorkflowMode,
    targetRole?: AgentRoleId,
    effort?: string,
    requireDesignApproval: boolean = true,
    startPhase: string = 'start',
    designSpec?: string,
    userFeedback?: string,
    resumeFromRole?: AgentRoleId,
    previousDeliverables?: Record<string, string>,
    modelOverride?: string
  ) => {
    setActiveProjectPrompt(prompt);
    lastRunConfigRef.current = { effort, modelOverride };
    setIsRunning(true);
    if (startPhase === 'after_design') {
      setCompletedAgents(['ceo', 'pm', 'designer']);
    } else if (resumeFromRole && previousDeliverables) {
      const targetIdx = ORDERED_PIPELINE_ROLES.indexOf(resumeFromRole);
      setCompletedAgents(targetIdx > 0 ? ORDERED_PIPELINE_ROLES.slice(0, targetIdx) : []);
      roleDeliverablesRef.current = { ...previousDeliverables };
    } else {
      setCompletedAgents([]);
      roleDeliverablesRef.current = {};
    }
    setIsPendingApproval(false);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Check backend health before running
    if (!backendOnline) {
      setMessages((prev) => [
        ...prev,
        {
          id: genUniqueId('err'),
          type: 'system',
          content: `**Backend Offline**: ไม่สามารถติดต่อ Backend ได้ กรุณาเปิดรัน Backend ผ่าน \`start-backend.bat\` หรือ \`python run.py\` ที่พอร์ต 8000 ก่อนสั่งงาน`,
          timestamp: timeStr,
        },
      ]);
      setIsRunning(false);
      return;
    }

    // Initial system notice
    const phaseLabel =
      startPhase === 'after_design'
        ? 'ENGINEERING & RELEASE PHASE (APPROVED)'
        : resumeFromRole
        ? `RESUMING FROM ${resumeFromRole.toUpperCase()}`
        : `${mode.toUpperCase()}`;
    const modelTag = modelOverride ? ` | Model: ${modelOverride}` : '';
    const effortTag = effort ? ` | Effort: ${effort.toUpperCase()}` : '';
    const initNotice: DialogueMessage = {
      id: genUniqueId('sys'),
      type: 'system',
      content: `**Pipeline Initialized** (Mode: ${phaseLabel}, Workspace: ${projectId}${modelTag}${effortTag})\nInstruction: "${prompt}"`,
      timestamp: timeStr,
    };

    setMessages((prev) => {
      const cleanPrev = prev.filter((m) => !m.isSimulation);
      const next = [...cleanPrev, initNotice];
      currentRunMessagesRef.current = next;
      saveWorkspaceLogsToBackend(projectId, next);
      return next;
    });

    try {
      const response = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          prompt,
          mode,
          target_role: targetRole,
          effort,
          require_design_approval: requireDesignApproval,
          start_phase: startPhase,
          design_spec: designSpec,
          user_feedback: userFeedback,
          resume_from_role: resumeFromRole,
          previous_deliverables: previousDeliverables,
          model: modelOverride,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to initiate agent stream: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      let currentAgentMsgId: string | null = null;
      let currentAgentAccumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.slice(6).trim();
          try {
            const ev = JSON.parse(jsonStr);
            const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (ev.run_id) setCurrentRunId(ev.run_id);

            // Handle event step
            if (ev.step === 'run_start') {
              // Started
            } else if (ev.step === 'ping') {
              // Keep-alive heartbeat ping
              continue;
            } else if (ev.step === 'phase_change') {
              activePhaseRef.current = ev.phase || '';
              activeAgentRef.current = ev.agent_id || '';
              setActivePhase(ev.phase);
              setActiveAgentId(ev.agent_id);
              currentAgentMsgId = null;
              currentAgentAccumulatedText = '';

              setMessages((prev) => {
                const next: DialogueMessage[] = [
                  ...prev,
                  {
                    id: genUniqueId('phase'),
                    type: 'phase' as const,
                    phase: ev.phase,
                    agent_id: ev.agent_id,
                    agent_name: ev.agent_name,
                    role_title: ev.role_title,
                    avatar: ev.avatar,
                    color: ev.color,
                    model: ev.model,
                    effort: ev.effort,
                    content: '',
                    timestamp: ts,
                  },
                ];
                currentRunMessagesRef.current = next;
                saveWorkspaceLogsToBackend(projectId, next);
                return next;
              });
            } else if (ev.step === 'stdout') {
              if (ev.agent_id) {
                activeAgentRef.current = ev.agent_id;
                setActiveAgentId(ev.agent_id);
              }
              currentAgentAccumulatedText += ev.content;

              if (!currentAgentMsgId) {
                currentAgentMsgId = genUniqueId('msg');
              }

              const targetMsgId = currentAgentMsgId;
              const textSnapshot = currentAgentAccumulatedText;

              setMessages((prev) => {
                const existingIdx = prev.findIndex((m) => m.id === targetMsgId);
                let next: DialogueMessage[];
                if (existingIdx !== -1) {
                  next = [...prev];
                  next[existingIdx] = {
                    ...next[existingIdx],
                    content: textSnapshot,
                  };
                } else {
                  next = [
                    ...prev,
                    {
                      id: targetMsgId,
                      type: 'message' as const,
                      agent_id: ev.agent_id,
                      agent_name: ev.agent_name,
                      role_title: roles.find((r) => r.id === ev.agent_id)?.title || ev.agent_name,
                      avatar: roles.find((r) => r.id === ev.agent_id)?.avatar || 'bot',
                      color: roles.find((r) => r.id === ev.agent_id)?.color || '#2563eb',
                      content: textSnapshot,
                      timestamp: ts,
                    },
                  ];
                }
                currentRunMessagesRef.current = next;
                return next;
              });
            } else if (ev.step === 'thinking') {
              const tokens = ev.metadata?.thinking_tokens || 0;
              const targetMsgId = currentAgentMsgId;
              if (targetMsgId) {
                setMessages((prev) => {
                  const next: DialogueMessage[] = prev.map((m) =>
                    m.id === targetMsgId
                      ? { ...m, thinking: `Reasoning stream: ${tokens} tokens processed` }
                      : m
                  );
                  currentRunMessagesRef.current = next;
                  return next;
                });
              }
            } else if (ev.step === 'tool_call') {
              // Tool started
              setMessages((prev) => {
                const next: DialogueMessage[] = [
                  ...prev,
                  {
                    id: genUniqueId('tool'),
                    type: 'tool' as const,
                    toolName: ev.tool,
                    toolParams: ev.parameters,
                    toolState: 'ACTIVE' as const,
                    content: '',
                    timestamp: ts,
                  },
                ];
                currentRunMessagesRef.current = next;
                return next;
              });

              // If write_to_file was called, refresh files
              if (ev.tool === 'write_to_file') {
                fetchFiles(projectId);
              }
            } else if (ev.step === 'tool_result') {
              // Tool done
              setMessages((prev) => {
                const last: DialogueMessage[] = [...prev];
                for (let i = last.length - 1; i >= 0; i--) {
                  if (last[i].type === 'tool' && last[i].toolName === ev.tool) {
                    last[i] = {
                      ...last[i],
                      toolState: 'DONE' as const,
                      toolDuration: ev.duration_seconds,
                    };
                    break;
                  }
                }
                currentRunMessagesRef.current = last;
                return last;
              });

              fetchFiles(projectId);
            } else if (ev.step === 'approval_required') {
              setIsPendingApproval(true);
              setSavedDesignSpec(ev.design_deliverable || '');
              if (ev.design_deliverable) {
                roleDeliverablesRef.current['designer'] = ev.design_deliverable;
              }
              setIsRunning(false);
              activeAgentRef.current = '';
              activePhaseRef.current = 'Awaiting User Design Approval';
              setActiveAgentId('');
              setActivePhase('Awaiting User Design Approval');

              setMessages((prev) => {
                const next: DialogueMessage[] = [
                  ...prev,
                  {
                    id: genUniqueId('approval'),
                    type: 'approval' as const,
                    agent_id: ev.agent_id || 'designer',
                    agent_name: ev.agent_name || 'Maya Lin',
                    role_title: ev.role_title || 'Lead UI/UX Designer',
                    color: '#E11D48',
                    content: ev.message,
                    design_deliverable: ev.design_deliverable,
                    timestamp: ts,
                  },
                ];
                currentRunMessagesRef.current = next;
                saveWorkspaceLogsToBackend(projectId, next);
                return next;
              });
            } else if (ev.step === 'agent_done') {
              if (ev.agent_id) {
                if (currentAgentAccumulatedText) {
                  roleDeliverablesRef.current[ev.agent_id] = currentAgentAccumulatedText;
                }
                if (ev.agent_id === 'designer' && currentAgentAccumulatedText) {
                  setSavedDesignSpec(currentAgentAccumulatedText);
                }
                setCompletedAgents((prev) =>
                  prev.includes(ev.agent_id) ? prev : [...prev, ev.agent_id]
                );

                // Update checkpoint progress for subsequent milestone resumption
                const currentRoleIdx = ORDERED_PIPELINE_ROLES.indexOf(ev.agent_id as AgentRoleId);
                if (currentRoleIdx !== -1 && currentRoleIdx < ORDERED_PIPELINE_ROLES.length - 1) {
                  const nextRole = ORDERED_PIPELINE_ROLES[currentRoleIdx + 1];
                  const completedList = ORDERED_PIPELINE_ROLES.slice(0, currentRoleIdx + 1);
                  setPipelineCheckpoint({
                    projectId,
                    prompt: activeProjectPrompt || prompt,
                    completedRoles: completedList,
                    resumeFromRole: nextRole,
                    deliverables: { ...roleDeliverablesRef.current },
                    lastPhaseTitle: activePhaseRef.current,
                    timestamp: ts,
                  });
                }
              }
              currentAgentMsgId = null;
              currentAgentAccumulatedText = '';
              fetchFiles(projectId);
              saveWorkspaceLogsToBackend(projectId, currentRunMessagesRef.current);
            } else if (ev.step === 'run_complete') {
              setIsRunning(false);
              activeAgentRef.current = '';
              activePhaseRef.current = '';
              setActiveAgentId('');
              setActivePhase('');
              setPipelineCheckpoint(null);
              fetchFiles(projectId);
              fetchProjects();
              saveWorkspaceLogsToBackend(projectId, currentRunMessagesRef.current);
            } else if (ev.step === 'error') {
              setMessages((prev) => {
                const next: DialogueMessage[] = [
                  ...prev,
                  {
                    id: genUniqueId('err'),
                    type: 'system' as const,
                    content: `**Execution Error**: ${ev.content}`,
                    timestamp: ts,
                  },
                ];
                currentRunMessagesRef.current = next;
                saveWorkspaceLogsToBackend(projectId, next);
                return next;
              });

              // Checkpoint on error at the failing agent
              const errAgent = ev.agent_id || activeAgentRef.current;
              if (errAgent) {
                const currentRoleIdx = ORDERED_PIPELINE_ROLES.indexOf(errAgent as AgentRoleId);
                const completedList = currentRoleIdx > 0 ? ORDERED_PIPELINE_ROLES.slice(0, currentRoleIdx) : [];
                setPipelineCheckpoint({
                  projectId,
                  prompt: activeProjectPrompt || prompt,
                  completedRoles: completedList,
                  resumeFromRole: errAgent as AgentRoleId,
                  deliverables: { ...roleDeliverablesRef.current },
                  lastPhaseTitle: activePhaseRef.current,
                  timestamp: ts,
                });
              }
            }
          } catch (err) {
            console.error('Error parsing SSE event:', err);
          }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Run failed:', e);
        const isNetErr =
          e.message?.toLowerCase().includes('network') ||
          e.message?.toLowerCase().includes('failed to fetch');
        const errNotice = isNetErr
          ? 'การเชื่อมต่อขัดข้อง (Network Error) — ไม่สามารถติดต่อ Backend ได้ กรุณาตรวจสอบว่า Backend (FastAPI พอร์ต 8000) กำลังเปิดทำงานอยู่'
          : e.message;

        setMessages((prev) => {
          const next: DialogueMessage[] = [
            ...prev,
            {
              id: genUniqueId('err'),
              type: 'system' as const,
              content: `**Connection Alert**: ${errNotice}`,
              timestamp: timeStr,
            },
          ];
          currentRunMessagesRef.current = next;
          saveWorkspaceLogsToBackend(projectId, next);
          return next;
        });

        const errAgent = activeAgentRef.current;
        if (errAgent) {
          const currentRoleIdx = ORDERED_PIPELINE_ROLES.indexOf(errAgent as AgentRoleId);
          const completedList = currentRoleIdx > 0 ? ORDERED_PIPELINE_ROLES.slice(0, currentRoleIdx) : [];
          setPipelineCheckpoint({
            projectId,
            prompt: activeProjectPrompt || prompt,
            completedRoles: completedList,
            resumeFromRole: errAgent as AgentRoleId,
            deliverables: { ...roleDeliverablesRef.current },
            lastPhaseTitle: activePhaseRef.current,
            timestamp: timeStr,
          });
        }
      }
    } finally {
      setIsRunning(false);
      activeAgentRef.current = '';
      setActiveAgentId('');
      fetchFiles(projectId);
      fetchProjects();
      saveWorkspaceLogsToBackend(projectId, currentRunMessagesRef.current);
    }
  };

  // Handle Resuming Pipeline from checkpoint
  const handleResumeRun = async (correctionNotes?: string) => {
    if (!pipelineCheckpoint) return;
    const { projectId, prompt, resumeFromRole, deliverables, completedRoles } = pipelineCheckpoint;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const resumeRoleInfo = roles.find((r) => r.id === resumeFromRole);

    setMessages((prev) => [
      ...prev,
      {
        id: genUniqueId('sys'),
        type: 'system',
        content: `**Resuming Pipeline from Checkpoint**\n- Continuing with: **${resumeRoleInfo?.name || resumeFromRole}** (${resumeRoleInfo?.title || resumeFromRole})\n- Completed milestones retained: ${completedRoles.join(', ')}${
          correctionNotes ? `\n- Client Directives: "${correctionNotes}"` : ''
        }`,
        timestamp: ts,
      },
    ]);

    await handleStartRun(
      projectId,
      prompt,
      'pipeline',
      undefined,
      lastRunConfigRef.current.effort,
      false,
      'resume',
      undefined,
      correctionNotes,
      resumeFromRole,
      deliverables,
      lastRunConfigRef.current.modelOverride
    );
  };

  // Handle Approval of UI/UX Design Gate
  const handleApproveDesign = async (feedback?: string) => {
    setIsPendingApproval(false);
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: genUniqueId('sys'),
        type: 'system',
        content: `**UI/UX Design Approved**: Client approved Maya Lin's design specifications. Dispatching Engineering, QA & Maintenance departments (Architect -> Database -> Backend -> Frontend -> Security -> QA -> Maintenance).${
          feedback ? `\n\nClient Directives: "${feedback}"` : ''
        }`,
        timestamp: ts,
      },
    ]);

    await handleStartRun(
      selectedProjectId,
      activeProjectPrompt || 'Implement the approved design specifications',
      'pipeline',
      undefined,
      lastRunConfigRef.current.effort,
      false,
      'after_design',
      savedDesignSpec,
      feedback,
      undefined,
      { ...roleDeliverablesRef.current },
      lastRunConfigRef.current.modelOverride
    );
  };

  // Handle Request for UI/UX Revision
  const handleRequestDesignRevision = async (feedback: string) => {
    setIsPendingApproval(false);
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: genUniqueId('sys'),
        type: 'system',
        content: `**Design Revision Requested**: Asking Maya Lin to revise UI/UX specifications according to client directives:\n"${feedback}"`,
        timestamp: ts,
      },
    ]);

    await handleStartRun(
      selectedProjectId,
      `Please revise the UI/UX design specifications according to this client feedback: ${feedback}`,
      'single',
      'designer',
      lastRunConfigRef.current.effort,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      lastRunConfigRef.current.modelOverride
    );
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        backendOnline={backendOnline}
        activeProjectName={currentProject?.name}
        onRefreshProjects={fetchProjects}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Futuristic Agent Node Topology */}
        <AgentNodeGraph
          roles={roles}
          activeAgentId={activeAgentId}
          activePhase={activePhase}
          isRunning={isRunning}
          completedAgents={completedAgents}
          onTestFlow={handleRunTestSimulation}
          onInspectAgent={setSelectedDossierAgent}
        />
        {/* Task Control & Launcher */}
        <ProjectLauncher
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onStartRun={handleStartRun}
          onCancelRun={handleCancelRun}
          isRunning={isRunning}
          roles={roles}
          onRunTest={handleRunTestSimulation}
          checkpoint={pipelineCheckpoint}
          onResumeCheckpoint={handleResumeRun}
          onSaveAgent={handleSaveAgent}
        />

        {/* View Switcher for split vs tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                activeTab === 'both'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Split Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                activeTab === 'stream'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-violet-600" />
              <span>Live Process ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                activeTab === 'files'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project Files ({files.length})</span>
            </button>
          </div>
        </div>

        {/* Split Studio: Live Stream + Workspace Files */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Live Process Stream */}
          {(activeTab === 'both' || activeTab === 'stream') && (
            <div
              className={
                activeTab === 'both'
                  ? 'lg:col-span-7 xl:col-span-7'
                  : 'lg:col-span-12'
              }
            >
              <LiveStream
                messages={messages}
                isRunning={isRunning}
                onClearMessages={handleClearMessages}
                onApproveDesign={handleApproveDesign}
                onRequestDesignRevision={handleRequestDesignRevision}
                isPendingApproval={isPendingApproval}
                checkpoint={pipelineCheckpoint}
                roles={roles}
                onResumePipeline={handleResumeRun}
                onDiscardCheckpoint={() => setPipelineCheckpoint(null)}
                projectId={selectedProjectId}
              />
            </div>
          )}

          {/* Project File Tree & Code Viewer */}
          {(activeTab === 'both' || activeTab === 'files') && (
            <div
              className={
                activeTab === 'both'
                  ? 'lg:col-span-5 xl:col-span-5'
                  : 'lg:col-span-12'
              }
            >
              <FileExplorer
                files={files}
                selectedProjectId={selectedProjectId}
                onRefresh={() => fetchFiles(selectedProjectId)}
                onReadFile={handleReadFile}
              />
            </div>
          )}
        </div>

        {/* RPG Employee Dossier & Custom Prompt Editor Modal */}
        <AgentDossierModal
          agent={selectedDossierAgent}
          isOpen={!!selectedDossierAgent}
          onClose={() => setSelectedDossierAgent(null)}
          onSave={handleSaveAgent}
          onReset={handleResetAgent}
        />
      </main>
    </div>
  );
}
