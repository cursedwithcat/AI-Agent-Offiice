'use client';

import React, { useState, useEffect } from 'react';
import { ProjectInfo, WorkflowMode, AgentRoleId, RoleInfo, PipelineCheckpoint, AvailableModel, ModelListResponse } from '../types';
import { RoleIcon } from './RoleIcon';
import {
  Play,
  Square,
  FolderPlus,
  Sparkles,
  Layers,
  MessageSquare,
  UserCheck,
  Folder,
  Send,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Cpu,
  Zap,
  Scale,
  Brain,
  Flame,
  Sliders,
  Gauge,
  Settings2,
  X,
  Check,
  Trash2,
} from 'lucide-react';

interface ProjectLauncherProps {
  projects: ProjectInfo[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void> | void;
  onStartRun: (
    projectId: string,
    prompt: string,
    mode: WorkflowMode,
    targetRole?: AgentRoleId,
    effort?: string,
    requireDesignApproval?: boolean,
    startPhase?: string,
    designSpec?: string,
    userFeedback?: string,
    resumeFromRole?: AgentRoleId,
    previousDeliverables?: Record<string, string>,
    modelOverride?: string
  ) => void;
  onCancelRun: () => void;
  isRunning: boolean;
  roles: RoleInfo[];
  onRunTest?: () => void;
  checkpoint?: PipelineCheckpoint | null;
  onResumeCheckpoint?: (notes?: string) => void;
  onSaveAgent?: (agent: RoleInfo) => Promise<void>;
}

const PRESET_PROMPTS = [
  {
    title: 'Markdown Notes Web App',
    prompt: 'สร้าง Web Application สำหรับจดบันทึก Markdown Notes ด้วย HTML, CSS และ Modern JavaScript โดยมีระบบ Live Preview, ค้นหาบันทึกได้, ติดแท็ก, และบันทึกลง LocalStorage อัตโนมัติ พร้อม UI มินิมอลสวยงาม',
  },
  {
    title: 'Python SQLite Task Tracker',
    prompt: 'สร้างโปรเจกต์ Python CLI สำหรับจัดการงาน (Task Tracker) โดยเชื่อมต่อกับฐานข้อมูล SQLite รองรับการเพิ่ม ลบ อัปเดตสถานะ แสดงสถิติ และ export เป็น JSON/CSV พร้อมไฟล์ README และ requirements.txt',
  },
  {
    title: 'FastAPI Microservice API',
    prompt: 'สร้าง RESTful API ด้วย FastAPI และ Pydantic สำหรับระบบ Inventory Management มี endpoints จัดการสินค้า หมวดหมู่ และสต็อก พร้อม unit tests ด้วย pytest และ Dockerfile',
  },
];

const MAINTENANCE_PRESETS = [
  {
    title: 'Dark Mode & UI Polish',
    prompt: 'ต้องการเพิ่มปุ่มสลับ Dark Mode / Light Mode พร้อมบันทึกสถานะธีมลง LocalStorage และปรับปรุงความสวยงามของฟอนต์และปุ่มกดให้ดูทันสมัย',
  },
  {
    title: 'API Pagination & Error Handling',
    prompt: 'ต้องการเพิ่มระบบ Pagination (limit, offset) ใน Backend API และปรับปรุง Request Validation พร้อมจัดการ Error Response ให้เป็นมาตรฐาน JSON',
  },
  {
    title: 'DB Schema Update & Field Enhancements',
    prompt: 'ต้องการอัปเดตโครงสร้างฐานข้อมูล เพิ่มคอลัมน์ status, created_at, updated_at และแก้ปัญหา data integrity ให้ระบบเสถียรขึ้น',
  },
];

export const ProjectLauncher: React.FC<ProjectLauncherProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onStartRun,
  onCancelRun,
  isRunning,
  roles,
  onRunTest,
  checkpoint,
  onResumeCheckpoint,
  onSaveAgent,
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<WorkflowMode>('pipeline');
  const [targetRole, setTargetRole] = useState<AgentRoleId>('frontend');
  const [effort, setEffort] = useState<string>('auto');
  const [modelOverride, setModelOverride] = useState<string>('auto');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [requireDesignApproval, setRequireDesignApproval] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showTeamAiModal, setShowTeamAiModal] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const activeRolesList = roles.filter((r) => r.id !== 'developer');
  const selectedSpecialist = activeRolesList.find((r) => r.id === targetRole);
  const isGlobalOverrideActive = modelOverride !== 'auto' || effort !== 'auto';

  const handleQuickUpdateRole = async (role: RoleInfo, patch: Partial<RoleInfo>) => {
    if (!onSaveAgent) return;
    setSavingRoleId(role.id);
    try {
      await onSaveAgent({ ...role, ...patch });
      setSavedToast(`บันทึกค่า AI ของ ${role.name} แล้ว`);
      setTimeout(() => setSavedToast(null), 2200);
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleBulkTeamPreset = async (presetType: 'smart' | 'low' | 'medium' | 'high' | 'max', bulkModel?: string) => {
    if (!onSaveAgent) return;
    setSavingRoleId('__all__');
    try {
      for (const role of activeRolesList) {
        let nextEffort = role.effort || 'medium';
        if (presetType === 'smart') {
          nextEffort = ['ceo', 'pm', 'architect', 'security'].includes(role.id) ? 'high' : 'medium';
        } else {
          nextEffort = presetType;
        }
        const nextModel = bulkModel !== undefined ? bulkModel : (role.model || 'default');
        await onSaveAgent({ ...role, effort: nextEffort, model: nextModel });
      }
      setSavedToast('อัปเดตค่า AI ประจำตำแหน่งทั้ง 10 ตำแหน่งเรียบร้อยแล้ว');
      setTimeout(() => setSavedToast(null), 2500);
    } finally {
      setSavingRoleId(null);
    }
  };

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: ModelListResponse) => {
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      })
      .catch((e) => console.warn('Could not fetch models in launcher:', e));
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      setIsCreatingProject(true);
      await onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectModal(false);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleLaunch = () => {
    if (!prompt.trim() || !selectedProjectId) return;
    onStartRun(
      selectedProjectId,
      prompt.trim(),
      mode,
      targetRole,
      effort === 'auto' ? undefined : effort,
      requireDesignApproval,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      modelOverride === 'auto' ? undefined : modelOverride
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm shadow-slate-100">
      <div className="flex flex-col gap-4">
        {/* Top Controls: Project Selector & Mode Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Project Workspace:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              disabled={isRunning}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-xs truncate font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.file_count} files)
                </option>
              ))}
              {projects.length === 0 && <option value="">No projects found</option>}
            </select>

            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>New Workspace</span>
            </button>

            {onDeleteProject && selectedProjectId && (
              <button
                type="button"
                onClick={() => onDeleteProject(selectedProjectId)}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-medium text-slate-600 hover:text-rose-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="ลบ Workspace นี้ออกจากระบบ"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Workspace</span>
              </button>
            )}
          </div>

          {/* Workflow Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMode('pipeline')}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'pipeline'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Pipeline</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('meeting')}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'meeting'
                  ? 'bg-white text-violet-700 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Boardroom Meeting</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('maintenance')}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'maintenance'
                  ? 'bg-white text-orange-700 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-orange-600" />
              <span>Maintenance & Fix</span>
              <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-orange-100 text-orange-800">
                NEW
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('single')}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'single'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Single Agent</span>
            </button>
          </div>
        </div>

        {/* Maintenance Mode Callout */}
        {mode === 'maintenance' && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/90 border border-orange-200/80 text-xs text-orange-950">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-orange-900 flex items-center gap-1.5">
                <span>ศูนย์รับเรื่องแก้ไขงาน & ประสานงานซ่อมบำรุง (Lucas Miller - Maintenance Lead)</span>
              </div>
              <p className="text-[11px] text-orange-800/90 mt-0.5 leading-relaxed">
                แจ้งสิ่งที่อยากแก้ไขหรือปรับปรุงเพิ่มเติมได้ที่นี่ Lucas จะตรวจสอบโค้ดเดิมในโปรเจกต์ วางแผนแก้ปัญหา และประสานงานส่งต่อให้ทีม (Backend, Frontend, Database, QA) จัดการแก้ไขตามหน้าที่จนเรียบร้อย
              </p>
            </div>
          </div>
        )}

        {/* If Single Mode, pick role */}
        {mode === 'single' && (
          <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-600 font-semibold">เลือกพนักงานที่จะสั่งงาน (Assign Specialist):</span>
              {selectedSpecialist && (
                <div className="flex items-center gap-1.5 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500">ค่าที่จะใช้รันจริง:</span>
                  <span className="font-mono font-bold text-blue-700 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-500" />
                    {modelOverride !== 'auto'
                      ? `${modelOverride} (Override)`
                      : selectedSpecialist.model && selectedSpecialist.model !== 'default'
                      ? selectedSpecialist.model
                      : 'CLI Default'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono font-bold uppercase text-amber-700 flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {effort !== 'auto'
                      ? `${effort} (Override)`
                      : selectedSpecialist.effort || 'medium'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeRolesList.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setTargetRole(r.id)}
                  disabled={isRunning}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    targetRole === r.id
                      ? 'bg-white border-blue-500 text-blue-700 shadow-xs font-semibold'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <RoleIcon name={r.id} className="w-3.5 h-3.5" />
                  <span>{r.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({r.title.split(' ')[0]})</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200/70 text-slate-600 font-mono uppercase">
                    {r.effort || 'med'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Checkpoint Resume Alert */}
        {checkpoint && !isRunning && onResumeCheckpoint && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/90 border border-amber-300 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-slate-800">
                <span className="font-semibold text-amber-900">มีสถานะงานที่ค้างอยู่</span>
                <span className="text-slate-600"> — สำเร็จแล้ว {checkpoint.completedRoles.length}/10 ด่าน, พร้อมรันต่อที่ </span>
                <strong className="text-blue-700 font-bold font-mono">
                  {roles.find((r) => r.id === checkpoint.resumeFromRole)?.name || checkpoint.resumeFromRole}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onResumeCheckpoint()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>รันต่อทันที (Resume)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Prompt Input Box */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
            rows={3}
            placeholder={
              mode === 'pipeline'
                ? 'Describe your project goal (e.g. Build an autonomous markdown note app, build a REST API service...)'
                : mode === 'maintenance'
                ? 'แจ้งสิ่งที่ต้องการแก้ไขเพิ่มเติม หรือแจ้งบั๊ก (เช่น อยากเพิ่มปุ่ม Dark Mode, อยากแก้ API pagination, ปรับแต่งสีสัน... Lucas Miller จะวิเคราะห์และประสานงานทีมให้)'
                : mode === 'meeting'
                ? 'Enter the topic or dilemma for the Executive Boardroom to discuss and brainstorm...'
                : 'Enter the exact task for this specialist to execute...'
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
          />

          {/* Quick Presets */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Presets:
              </span>
              {(mode === 'maintenance' ? MAINTENANCE_PRESETS : PRESET_PROMPTS).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p.prompt)}
                  disabled={isRunning}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>

            {/* Active AI Mode Status Indicator */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {isGlobalOverrideActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-medium">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>โหมด AI: บังคับใช้ค่าเดียวทั้งรอบนี้ (Override)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setModelOverride('auto');
                      setEffort('auto');
                      setIsCustomModel(false);
                    }}
                    className="ml-1 underline text-amber-900 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    รีเซ็ตเป็นตามตำแหน่ง
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>โหมด AI: ใช้ค่าประจำตำแหน่งของแต่ละคน (Per-Role)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Button to open Unified 10-Role AI Settings Modal */}
            <button
              type="button"
              onClick={() => setShowTeamAiModal(true)}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="ดูและตั้งค่า Model & Effort ประจำตัวของพนักงานทั้ง 10 ตำแหน่งในหน้าเดียว"
            >
              <Settings2 className="w-3.5 h-3.5 text-blue-600" />
              <span>ตั้งค่า AI ทั้งทีม (10 ตำแหน่ง)</span>
            </button>

            {/* Quick Run Override: Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1" title="เลือก 'ตามตำแหน่ง (Per-Role)' เพื่อใช้โมเดลประจำตัวของแต่ละคน หรือเลือกโมเดลอื่นเพื่อบังคับใช้ทั้งรอบนี้">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                Model รอบนี้:
              </span>
              {isCustomModel ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customModelText}
                    onChange={(e) => {
                      setCustomModelText(e.target.value);
                      setModelOverride(e.target.value.trim() || 'auto');
                    }}
                    placeholder="e.g. claude-3-7-sonnet"
                    disabled={isRunning}
                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomModel(false);
                      setModelOverride('auto');
                    }}
                    title="Switch back to presets"
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select
                    value={modelOverride}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomModel(true);
                        setCustomModelText('');
                      } else {
                        setModelOverride(e.target.value);
                      }
                    }}
                    disabled={isRunning}
                    className={`border rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer max-w-[175px] sm:max-w-[205px] truncate ${
                      modelOverride === 'auto'
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                    }`}
                    title="เลือก 'ตามตำแหน่ง (Per-Role)' เพื่อใช้โมเดลที่ตั้งไว้ในแต่ละ Agent หรือเลือกโมเดลเพื่อบังคับใช้กับทุกคนในรอบนี้"
                  >
                    <option value="auto">ตามตำแหน่ง (Per-Role Default)</option>
                    {availableModels
                      .filter((m) => m.id !== 'default')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          บังคับใช้: {m.name || m.id}
                        </option>
                      ))}
                    <option value="__custom__">+ พิมพ์ชื่อโมเดลเอง...</option>
                  </select>
                </div>
              )}
            </div>

            {/* Quick Run Override: Reasoning Effort */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1" title="เลือก 'ตามตำแหน่ง' เพื่อใช้ระดับการคิดประจำตัวของแต่ละคน หรือเลือก LOW/MED/HIGH/MAX เพื่อบังคับใช้เท่ากันทั้งรอบนี้">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Effort รอบนี้:
              </span>
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {([
                  { id: 'auto', label: 'ตามตำแหน่ง', icon: Gauge },
                  { id: 'low', label: 'LOW', icon: Zap },
                  { id: 'medium', label: 'MED', icon: Scale },
                  { id: 'high', label: 'HIGH', icon: Brain },
                  { id: 'max', label: 'MAX', icon: Flame },
                ] as const).map(({ id: lvl, label, icon: IconComponent }) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEffort(lvl)}
                    disabled={isRunning}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      effort === lvl
                        ? lvl === 'auto'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                          : 'bg-amber-500 text-white shadow-2xs font-bold border border-amber-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={
                      lvl === 'auto'
                        ? 'ใช้ระดับการคิด (Effort) ตามที่ตั้งค่าไว้ประจำตัวของแต่ละตำแหน่ง'
                        : `บังคับให้ทุกคนใช้ระดับการคิด ${lvl.toUpperCase()} ในรอบรันนี้`
                    }
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UX/UI Approval Gate Toggle */}
            {mode === 'pipeline' && (
              <label className="hidden sm:flex items-center gap-1.5 ml-1 cursor-pointer text-[11px] text-slate-600 font-medium select-none hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={requireDesignApproval}
                  onChange={(e) => setRequireDesignApproval(e.target.checked)}
                  disabled={isRunning}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>UI Approval Gate</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-rose-50 text-rose-700 border border-rose-200">
                  Maya Lin
                </span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                type="button"
                onClick={onCancelRun}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Cancel Execution</span>
              </button>
            ) : (
              <>
                {onRunTest && (
                  <button
                    type="button"
                    onClick={onRunTest}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-xs transition-all cursor-pointer"
                    title="Simulate all 5 nodes and visual laser flow without typing a real prompt"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Run Test Flow</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!prompt.trim() || !selectedProjectId}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs shadow-md transition-all cursor-pointer ${
                    mode === 'maintenance'
                      ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  {mode === 'maintenance' ? (
                    <>
                      <Wrench className="w-3.5 h-3.5 fill-current" />
                      <span>Dispatch Maintenance</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Agent Company</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unified Team AI Model & Effort Configuration Modal */}
      {showTeamAiModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowTeamAiModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                    <span>ศูนย์ตั้งค่า AI Model & Reasoning Effort ทั้งบริษัท (10 ตำแหน่ง)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      agy --model / --effort
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    จัดการโมเดลและระดับการใช้ความคิดของพนักงานแต่ละคนในหน้าเดียว บันทึกลงฐานข้อมูลอัตโนมัติ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamAiModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation & Quick Bulk Presets */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1. ค่าประจำตำแหน่ง (ตารางด้านล่าง — บันทึกถาวร)</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    ใช้เมื่อแถบหน้าหลักเลือก <strong>&ldquo;ตามตำแหน่ง (Per-Role)&rdquo;</strong> ช่วยให้แบ่งงานได้เหมาะกับตำแหน่ง เช่น ให้ <strong>CEO / Architect</strong> คิดลึก (<code>HIGH</code>) และสายลงมือโค้ดใช้ความเร็วสมดุล (<code>MEDIUM</code>)
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>2. ค่าบังคับใช้รอบนี้ (แถบหน้าหลัก — ชั่วคราว)</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    หากเปลี่ยนแถบหน้าหลักจาก <strong>&ldquo;ตามตำแหน่ง&rdquo;</strong> เป็นค่าอื่น (เช่น <code>LOW</code> หรือเลือกโมเดลเฉพาะ) ระบบจะบังคับใช้ค่านั้นกับทุกคนเฉพาะรอบรันนั้นทันที
                  </p>
                </div>
              </div>

              {/* Quick Bulk Presets Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 mr-1">ตั้งค่าด่วนทั้งทีม:</span>
                  <button
                    type="button"
                    disabled={savingRoleId === '__all__'}
                    onClick={() => handleBulkTeamPreset('smart')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    🎯 สูตรแนะนำ (วางแผน=HIGH / โค้ด=MED)
                  </button>
                  <button
                    type="button"
                    disabled={savingRoleId === '__all__'}
                    onClick={() => handleBulkTeamPreset('low')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ⚡ เร็วทั้งหมด (All LOW)
                  </button>
                  <button
                    type="button"
                    disabled={savingRoleId === '__all__'}
                    onClick={() => handleBulkTeamPreset('medium')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ⚖️ มาตรฐานทั้งหมด (All MED)
                  </button>
                  <button
                    type="button"
                    disabled={savingRoleId === '__all__'}
                    onClick={() => handleBulkTeamPreset('high')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    🧠 คิดลึกทั้งหมด (All HIGH)
                  </button>
                </div>

                {savedToast && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    {savedToast}
                  </span>
                )}
              </div>
            </div>

            {/* 10 Agents Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">พนักงาน (Agent & Role)</th>
                      <th className="py-2.5 px-3">AI Model ประจำตำแหน่ง (--model)</th>
                      <th className="py-2.5 px-3">Reasoning Effort ประจำตำแหน่ง (--effort)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 text-xs">
                    {activeRolesList.map((role) => {
                      const roleModel = role.model || 'default';
                      const roleEffort = role.effort || 'medium';
                      return (
                        <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                                style={{ backgroundColor: role.color || '#2563eb' }}
                              >
                                <RoleIcon name={role.id} className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{role.name}</span>
                                  {savingRoleId === role.id && (
                                    <span className="text-[10px] text-blue-600 font-normal animate-pulse">
                                      กำลังบันทึก...
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{role.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={roleModel}
                              onChange={(e) => handleQuickUpdateRole(role, { model: e.target.value })}
                              disabled={!onSaveAgent || savingRoleId === '__all__'}
                              className="w-full max-w-[230px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="default">Default CLI Model (มาตรฐาน agy)</option>
                              {availableModels
                                .filter((m) => m.id !== 'default')
                                .map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name || m.id}
                                  </option>
                                ))}
                              {roleModel !== 'default' &&
                                !availableModels.some((m) => m.id === roleModel) && (
                                  <option value={roleModel}>{roleModel} (Custom)</option>
                                )}
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                              {(['low', 'medium', 'high', 'max'] as const).map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  disabled={!onSaveAgent || savingRoleId === '__all__'}
                                  onClick={() => handleQuickUpdateRole(role, { effort: lvl })}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                    roleEffort === lvl
                                      ? lvl === 'high' || lvl === 'max'
                                        ? 'bg-purple-600 text-white shadow-2xs'
                                        : lvl === 'low'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'bg-blue-600 text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                  }`}
                                >
                                  {lvl === 'medium' ? 'MED' : lvl}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                💡 ทิป: หากต้องการพิมพ์ชื่อ Custom Model เอง หรือแก้ System Prompt เฉพาะคน สามารถคลิกที่ตัวละครแมว 3D ด้านบนได้โดยตรง
              </span>
              <button
                type="button"
                onClick={() => setShowTeamAiModal(false)}
                className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-blue-600" />
              Create Project Workspace
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All source code files generated by David (Developer) and verified by Elena (QA) will reside in this dedicated workspace.
            </p>

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. markdown-notes-app or inventory-api"
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-medium shadow-xs disabled:opacity-50"
                >
                  {isCreatingProject ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
