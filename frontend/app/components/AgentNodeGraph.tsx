'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RoleInfo } from '../types';
import { RoleIcon } from './RoleIcon';
import {
  Activity,
  CheckCircle2,
  Zap,
  Cpu,
  GitBranch,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import { CatOffice3D } from './CatOffice3D';

interface AgentNodeGraphProps {
  roles: RoleInfo[];
  activeAgentId?: string;
  activePhase?: string;
  isRunning: boolean;
  completedAgents?: string[];
  lastAction?: string;
  onTestFlow?: () => void;
  onInspectAgent?: (agent: RoleInfo) => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  col: number;
  row: number;
  department: string;
  roleCode: string;
  subLabel: string;
}

const NODE_LAYOUT: Record<string, NodePosition> = {
  ceo: {
    id: 'ceo',
    x: 16,
    y: 16,
    col: 1,
    row: 1,
    department: 'Leadership',
    roleCode: 'EXEC_01',
    subLabel: 'Vision & Scope',
  },
  pm: {
    id: 'pm',
    x: 16,
    y: 196,
    col: 1,
    row: 2,
    department: 'Product',
    roleCode: 'SPEC_02',
    subLabel: 'User Stories',
  },
  designer: {
    id: 'designer',
    x: 204,
    y: 106,
    col: 2,
    row: 1,
    department: 'Design',
    roleCode: 'UXUI_03',
    subLabel: 'Design System & Gate',
  },
  architect: {
    id: 'architect',
    x: 430,
    y: 16,
    col: 3,
    row: 1,
    department: 'Architecture',
    roleCode: 'ARCH_04',
    subLabel: 'System Blueprint',
  },
  database: {
    id: 'database',
    x: 430,
    y: 196,
    col: 3,
    row: 2,
    department: 'Data',
    roleCode: 'DATA_05',
    subLabel: 'Schema & ORM Models',
  },
  backend: {
    id: 'backend',
    x: 620,
    y: 16,
    col: 4,
    row: 1,
    department: 'Backend',
    roleCode: 'BACK_06',
    subLabel: 'REST API & Logic',
  },
  frontend: {
    id: 'frontend',
    x: 620,
    y: 196,
    col: 4,
    row: 2,
    department: 'Frontend',
    roleCode: 'FRNT_07',
    subLabel: 'Client Interactivity',
  },
  security: {
    id: 'security',
    x: 810,
    y: 16,
    col: 5,
    row: 1,
    department: 'Security',
    roleCode: 'SECU_08',
    subLabel: 'DevSecOps Audit',
  },
  qa: {
    id: 'qa',
    x: 810,
    y: 196,
    col: 5,
    row: 2,
    department: 'Quality',
    roleCode: 'VERF_09',
    subLabel: 'Release Gate',
  },
  maintenance: {
    id: 'maintenance',
    x: 1000,
    y: 106,
    col: 6,
    row: 1,
    department: 'Operations',
    roleCode: 'MAIN_10',
    subLabel: 'Support & Dispatch',
  },
};

// Interconnected dependency wires ("โยงไปโยงมา")
interface DependencyWire {
  id: string;
  from: string;
  to: string;
  path: string;
  label?: string;
  isCrossCutting?: boolean;
}

const TOPOLOGY_WIRES: DependencyWire[] = [
  // 1. CEO -> PM (Leadership feeds product specs)
  {
    id: 'wire-ceo-pm',
    from: 'ceo',
    to: 'pm',
    path: 'M 92 130 L 92 196',
    label: 'Vision Handoff',
  },
  // 2. CEO -> Architect (High-level tech governance)
  {
    id: 'wire-ceo-arch',
    from: 'ceo',
    to: 'architect',
    path: 'M 168 50 C 275 8, 325 8, 430 50',
    label: 'Governance',
  },
  // 3. PM -> Designer (User stories feed UX design)
  {
    id: 'wire-pm-designer',
    from: 'pm',
    to: 'designer',
    path: 'M 168 253 C 186 253, 186 163, 204 163',
    label: 'Specs',
  },
  // 4. Designer -> Approval Gate
  {
    id: 'wire-designer-gate',
    from: 'designer',
    to: 'designer', // Gate is tied to designer
    path: 'M 356 163 L 372 163',
  },
  // 5. Gate -> Architect (Approved design feeds technical architecture)
  {
    id: 'wire-gate-arch',
    from: 'designer',
    to: 'architect',
    path: 'M 416 155 C 423 155, 423 73, 430 73',
    label: 'Approved Spec',
  },
  // 6. Gate -> Frontend (CROSS-CUTTING: UI Wireframes feed Frontend directly!)
  {
    id: 'wire-gate-frontend',
    from: 'designer',
    to: 'frontend',
    path: 'M 416 171 C 480 185, 540 253, 620 253',
    label: 'Direct UI Specs',
    isCrossCutting: true,
  },
  // 7. Architect -> Database (Data storage design)
  {
    id: 'wire-arch-db',
    from: 'architect',
    to: 'database',
    path: 'M 506 130 L 506 196',
    label: 'Data Model',
  },
  // 8. Architect -> Backend (API structure & architecture)
  {
    id: 'wire-arch-backend',
    from: 'architect',
    to: 'backend',
    path: 'M 582 73 L 620 73',
    label: 'Contracts',
  },
  // 9. Database -> Backend (CROSS-TIER: DB Schema feeds API endpoints)
  {
    id: 'wire-db-backend',
    from: 'database',
    to: 'backend',
    path: 'M 582 253 C 601 253, 601 88, 620 88',
    label: 'Schema -> API',
    isCrossCutting: true,
  },
  // 10. Backend -> Frontend (API endpoints feed Client UI state)
  {
    id: 'wire-backend-frontend',
    from: 'backend',
    to: 'frontend',
    path: 'M 696 130 L 696 196',
    label: 'API Feed',
  },
  // 11. Backend -> Security (Server security & SQLi defense)
  {
    id: 'wire-backend-security',
    from: 'backend',
    to: 'security',
    path: 'M 772 73 L 810 73',
    label: 'API Audit',
  },
  // 12. Frontend -> Security (CROSS-TIER: Client XSS & DOM sanitization audit)
  {
    id: 'wire-frontend-security',
    from: 'frontend',
    to: 'security',
    path: 'M 772 253 C 791 253, 791 88, 810 88',
    label: 'XSS Audit',
    isCrossCutting: true,
  },
  // 13. Security -> QA (Security certificate feeds final release gate)
  {
    id: 'wire-security-qa',
    from: 'security',
    to: 'qa',
    path: 'M 886 130 L 886 196',
    label: 'Sign-Off',
  },
  // 14. QA -> Maintenance (Release handover for active support)
  {
    id: 'wire-qa-maintenance',
    from: 'qa',
    to: 'maintenance',
    path: 'M 962 253 C 981 253, 981 163, 1000 163',
    label: 'Handover',
  },
  // 15. Maintenance -> Backend (Cross-Cutting Maintenance Dispatch)
  {
    id: 'wire-maintenance-backend',
    from: 'maintenance',
    to: 'backend',
    path: 'M 1000 135 C 850 8, 730 8, 696 16',
    label: 'API Dispatch',
    isCrossCutting: true,
  },
  // 16. Maintenance -> Frontend (Cross-Cutting UI Patch Dispatch)
  {
    id: 'wire-maintenance-frontend',
    from: 'maintenance',
    to: 'frontend',
    path: 'M 1000 191 C 850 324, 730 324, 696 310',
    label: 'UI Dispatch',
    isCrossCutting: true,
  },
];

export const AgentNodeGraph: React.FC<AgentNodeGraphProps> = ({
  roles,
  activeAgentId,
  activePhase,
  isRunning,
  completedAgents = [],
  onTestFlow,
  onInspectAgent,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Esc to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Compute responsive scale for 2D matrix so it NEVER overflows any screen
  useEffect(() => {
    const updateScale = () => {
      const BASE_W = 1168;
      const BASE_H = 340;
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      if (isFullscreen) {
        // Fullscreen: fill the maximum screen area while preserving aspect ratio and healthy margins
        const availW = Math.max(300, (w > 0 ? w : window.innerWidth) - 48);
        const availH = Math.max(200, (h > 0 ? h : window.innerHeight) - 48);
        const sX = availW / BASE_W;
        const sY = availH / BASE_H;
        const best = Math.min(sX, sY);
        setScale(Math.max(0.55, Math.min(best, 1.55)));
      } else {
        const availW = Math.max(300, (w > 0 ? w : window.innerWidth) - 32);
        const availH = Math.max(200, (h > 0 ? h : 400) - 32);
        const sX = availW / BASE_W;
        const sY = availH / BASE_H;
        const best = Math.min(sX, sY);
        setScale(Math.max(0.55, Math.min(best, 1.0)));
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isFullscreen, viewMode]);

  // Filter out legacy developer alias if frontend exists
  const hasFrontend = roles.some((r) => r.id === 'frontend');
  const validRoles = roles.filter((r) => {
    if (hasFrontend && r.id === 'developer') return false;
    return true;
  });

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col w-screen h-screen overflow-hidden text-slate-100 select-none animate-in fade-in duration-150'
          : 'bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm shadow-slate-100 transition-all'
      }
    >
      {/* Topology Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
          isFullscreen
            ? 'px-4 py-2.5 bg-slate-900/95 border-b border-slate-800'
            : 'pb-3.5 mb-3 border-b border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isFullscreen
                ? 'bg-slate-900 border-slate-700 text-blue-400'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-xs font-bold uppercase tracking-wider ${
                  isFullscreen ? 'text-white' : 'text-slate-800'
                }`}
              >
                Enterprise Company Topology Matrix
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                {viewMode === '3d' ? '3D LULU PIG SIMULATION' : 'INTERCONNECTED DAG'}
              </span>
              {isFullscreen && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-900/80 text-blue-300 border border-blue-700 animate-pulse">
                  FULLSCREEN (กด ESC เพื่อออก)
                </span>
              )}
            </div>
            <p className={`text-[11px] ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
              {viewMode === '3d'
                ? 'LuLu Piggy Software Corp 3D Studio: Click any piglet/desk to inspect character dossier & customize system prompt'
                : 'Cross-functional dependencies: Click any node to inspect RPG character sheet & customize system prompt'}
            </p>
          </div>
        </div>

        {/* Global Pipeline Status Pill, 2D/3D Switcher & Test Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div
            className={`flex items-center gap-1 p-0.5 rounded-xl border text-xs font-mono font-medium ${
              isFullscreen
                ? 'bg-slate-900 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? isFullscreen
                    ? 'bg-slate-800 text-white font-bold shadow-2xs border border-slate-700'
                    : 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/60'
                  : isFullscreen
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>3D LuLu Pig Office</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-100 text-rose-800">
                LULU
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === '2d'
                  ? isFullscreen
                    ? 'bg-slate-800 text-white font-bold shadow-2xs border border-slate-700'
                    : 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/60'
                  : isFullscreen
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-600" />
              <span>2D DAG Matrix</span>
            </button>
          </div>

          {onTestFlow && (
            <button
              type="button"
              onClick={onTestFlow}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-2xs ${
                isFullscreen
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Simulate all department nodes, cross-connections, and animated laser pulses"
            >
              <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
              <span>Test Flow</span>
            </button>
          )}

          {isRunning ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="font-semibold">ACTIVE</span>
              {activePhase && (
                <span className="text-[11px] text-blue-600/80 truncate max-w-[140px]">
                  ({activePhase.split(':')[0]})
                </span>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono ${
                isFullscreen
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>STANDBY</span>
            </div>
          )}
        </div>
      </div>

      {/* View Mode Switching: 3D Cat Office Studio vs 2D DAG Matrix */}
      {viewMode === '3d' ? (
        <div className="w-full flex-1 min-h-0 relative flex flex-col overflow-hidden">
          <CatOffice3D
            roles={roles}
            activeAgentId={activeAgentId}
            activePhase={activePhase}
            isRunning={isRunning}
            completedAgents={completedAgents}
            onTestFlow={onTestFlow}
            onInspectAgent={onInspectAgent}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Main 2D Interactive Canvas */}
          <div
            ref={containerRef}
            className="w-full flex-1 min-h-0 flex items-center justify-center overflow-auto p-4"
          >
            <div
              style={{
                width: `${Math.round(1168 * scale)}px`,
                height: `${Math.round(340 * scale)}px`,
              }}
              className="relative shrink-0 m-auto"
            >
              <div
                style={{
                  width: '1168px',
                  height: '340px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
                className={`absolute top-0 left-0 rounded-2xl border p-2 selection:bg-none transition-transform duration-75 ${
                  isFullscreen
                    ? 'bg-slate-900/95 border-slate-700/80 shadow-2xl'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                {/* SVG Dependency Cable Layer */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  viewBox="0 0 1168 340"
                  preserveAspectRatio="none"
                >
            <defs>
              {/* Laser glow filter for active cables */}
              <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Marker heads */}
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#3b82f6" />
              </marker>
              <marker
                id="arrow-completed"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Render all 13 dependency cables */}
            {TOPOLOGY_WIRES.map((wire) => {
              const isTargetActive = activeAgentId === wire.to && isRunning;
              const isTargetDone = completedAgents.includes(wire.to);
              const isSourceDone = completedAgents.includes(wire.from);
              const isHighlighted =
                hoveredNode === wire.from || hoveredNode === wire.to;

              // Color logic
              let strokeColor = '#cbd5e1'; // Slate 300
              let strokeWidth = 1.8;
              let isAnimated = false;
              let marker = 'url(#arrow-default)';

              if (isTargetActive) {
                strokeColor = wire.isCrossCutting ? '#e11d48' : '#3b82f6';
                strokeWidth = 2.8;
                isAnimated = true;
                marker = 'url(#arrow-active)';
              } else if (isTargetDone && isSourceDone) {
                strokeColor = '#10b981'; // Emerald 500
                strokeWidth = 2;
                marker = 'url(#arrow-completed)';
              } else if (isHighlighted) {
                strokeColor = '#64748b';
                strokeWidth = 2.2;
              }

              return (
                <g key={wire.id}>
                  {/* Background shadow path */}
                  <path
                    d={wire.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={strokeWidth + 2}
                  />

                  {/* Main Wire Path */}
                  <path
                    d={wire.path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={wire.isCrossCutting && !isAnimated ? '5 4' : undefined}
                    className={isAnimated ? 'animate-flow-fast' : undefined}
                    filter={isAnimated ? 'url(#laser-glow)' : undefined}
                    markerEnd={marker}
                  />

                  {/* Wire Label if cross-cutting or special */}
                  {wire.label && (
                    <text
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-400 select-none pointer-events-none"
                    >
                      <textPath
                        href={`#path-${wire.id}`}
                        startOffset="50%"
                      >
                        {/* fallback to clean text rendering below */}
                      </textPath>
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Foreground HTML Cards Layer */}
          {validRoles.map((role) => {
            const layout = NODE_LAYOUT[role.id];
            if (!layout) return null;

            const isActive = isRunning && activeAgentId === role.id;
            const isCompleted = completedAgents.includes(role.id) && !isActive;
            const isHovered = hoveredNode === role.id;

            return (
              <div
                key={role.id}
                onClick={() => onInspectAgent?.(role)}
                onMouseEnter={() => setHoveredNode(role.id)}
                onMouseLeave={() => setHoveredNode(null)}
                title="Click to inspect RPG character sheet & customize system prompt"
                style={{
                  left: `${layout.x}px`,
                  top: `${layout.y}px`,
                  width: '152px',
                  height: '114px',
                }}
                className={`absolute rounded-xl p-2.5 border transition-all duration-300 bg-white flex flex-col justify-between shadow-xs select-none z-10 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10 scale-[1.03] z-20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/25'
                    : isHovered
                    ? 'border-slate-400 shadow-md scale-[1.03] ring-2 ring-slate-900/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Port Pins on Card Edges */}
                {/* Input port pin (left) */}
                <div
                  className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-blue-600 border-white ring-2 ring-blue-400'
                      : isCompleted
                      ? 'bg-emerald-500 border-white'
                      : 'bg-white border-slate-300'
                  }`}
                  title="Input Port"
                />
                {/* Output port pin (right) */}
                <div
                  className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-blue-600 border-white ring-2 ring-blue-400'
                      : isCompleted
                      ? 'bg-emerald-500 border-white'
                      : 'bg-white border-slate-300'
                  }`}
                  title="Output Port"
                />

                {/* Card Header: Node Code & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[8.5px] font-bold text-slate-400 tracking-wider">
                      {layout.roleCode}
                    </span>
                    <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Lv.{role.level || 5}
                    </span>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold bg-blue-100 text-blue-700 animate-pulse border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      ACTIVE
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1 px-1 py-0.2 rounded-full text-[8.5px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      DONE
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-mono text-slate-400">
                      READY
                    </span>
                  )}
                </div>

                {/* Card Center: Avatar & Info */}
                <div className="flex items-center gap-2 my-0.5">
                  <div className="relative shrink-0">
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-xl animate-pulse-ring"
                        style={{ backgroundColor: `${role.color}40` }}
                      />
                    )}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
                      style={{
                        backgroundColor: isActive ? `${role.color}15` : '#f8fafc',
                        borderColor: isActive ? role.color : '#e2e8f0',
                        color: role.color,
                      }}
                    >
                      <RoleIcon name={role.id} className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-[10.5px] text-slate-900 truncate">
                      {role.name}
                    </h3>
                    <p
                      className="text-[9.5px] font-medium truncate"
                      style={{ color: role.color }}
                    >
                      {role.title.split('(')[0].replace('Senior ', '').replace('Lead ', '')}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Role Sub-Label & Dept */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[8.5px] font-mono">
                  <span className="text-slate-500 truncate max-w-[85px]">{layout.subLabel}</span>
                  <span className="text-slate-400 shrink-0 font-medium">{layout.department}</span>
                </div>
              </div>
            );
          })}

          {/* The Central Interactive Client Approval Gate Node */}
          <div
            style={{
              left: '372px',
              top: '141px',
              width: '44px',
              height: '44px',
            }}
            className="absolute rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-300 shadow-sm flex flex-col items-center justify-center z-15 hover:scale-110 transition-transform cursor-pointer"
            title="UI/UX Client Approval Gate (Maya Lin reviews wireframes with you before engineering starts)"
          >
            <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="text-[7px] font-mono font-bold text-rose-700 tracking-tighter">
              GATE
            </span>
          </div>
          </div>
        </div>
      </div>

      {/* Topology Legend & Workflow Architecture Bar */}
      <div
        className={`flex flex-wrap items-center justify-between text-[10px] font-mono gap-2 shrink-0 ${
          isFullscreen
            ? 'px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-slate-400'
            : 'mt-3 pt-2.5 border-t border-slate-100 text-slate-500'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className={`font-semibold flex items-center gap-1 ${isFullscreen ? 'text-slate-200' : 'text-slate-700'}`}>
            <GitBranch className="w-3 h-3 text-blue-600" />
            Workflow Layers:
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            1. Strategy (CEO, PM)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            2. Design & Gate (Maya)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            3. Foundation (Arch, DB)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            4. Core Eng (Backend, Frontend)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            5. Assurance (Security, QA)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            6. Operations (Maintenance - Lucas)
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isFullscreen ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-b border-rose-400 border-dashed inline-block" />
            Cross-Cutting UI Wire
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
            Verified Handover
          </span>
        </div>
      </div>
    </div>
  )}
</div>
  );
};
