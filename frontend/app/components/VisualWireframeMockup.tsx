'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Palette,
  ExternalLink,
  Layers,
  Sliders,
  Check,
  Search,
  Plus,
  SlidersHorizontal,
  FolderKanban,
  CheckSquare,
  Square,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface VisualWireframeMockupProps {
  designDeliverable?: string;
  onApprove?: (feedback: string) => void;
  onRequestRevision?: (feedback: string) => void;
  isPendingApproval?: boolean;
  wireframeHtmlUrl?: string;
  projectId?: string;
}

interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  accent: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'blue',
    name: 'Royal Blue (Corporate Modern)',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    accent: '#38BDF8',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
  },
  {
    id: 'rose',
    name: 'Rose Crimson (Vibrant & Warm)',
    primary: '#E11D48',
    primaryHover: '#BE123C',
    accent: '#FB7185',
    bg: '#FFF1F2',
    surface: '#FFFFFF',
    border: '#FFE4E6',
    text: '#881337',
  },
  {
    id: 'emerald',
    name: 'Emerald Clean (Fresh & Productive)',
    primary: '#059669',
    primaryHover: '#047857',
    accent: '#34D399',
    bg: '#F0FDF4',
    surface: '#FFFFFF',
    border: '#DCFCE7',
    text: '#064E3B',
  },
  {
    id: 'violet',
    name: 'Cyber Violet (Creative Studio)',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    accent: '#A78BFA',
    bg: '#FAF5FF',
    surface: '#FFFFFF',
    border: '#F3E8FF',
    text: '#581C87',
  },
  {
    id: 'amber',
    name: 'Sunset Amber (Cozy & Focused)',
    primary: '#D97706',
    primaryHover: '#B45309',
    accent: '#FBBF24',
    bg: '#FFFBEB',
    surface: '#FFFFFF',
    border: '#FEF3C7',
    text: '#78350F',
  },
];

export const VisualWireframeMockup: React.FC<VisualWireframeMockupProps> = ({
  designDeliverable = '',
  onApprove,
  onRequestRevision,
  isPendingApproval = true,
  wireframeHtmlUrl,
  projectId,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEME_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'live_html' | 'mockup' | 'specs'>('mockup');
  const [liveHtmlContent, setLiveHtmlContent] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [mockCheckedItems, setMockCheckedItems] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  // Automatically load wireframe_preview.html from the project workspace if Maya Lin created it
  React.useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    fetch(`/api/projects/${encodeURIComponent(projectId)}/file-content?path=wireframe_preview.html`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.content && typeof data.content === 'string' && data.content.includes('<')) {
          setLiveHtmlContent(data.content);
          setActiveTab('live_html');
        }
      })
      .catch(() => {
        // Fallback to built-in visual mockup if file doesn't exist yet
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const toggleMockCheck = (id: number) => {
    setMockCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const containerWidthClass =
    deviceView === 'desktop' ? 'w-full' : deviceView === 'tablet' ? 'max-w-[680px]' : 'max-w-[360px]';

  return (
    <div className="bg-white border-2 border-rose-300 rounded-2xl overflow-hidden shadow-md my-4 space-y-0 transition-all">
      {/* 1. Header Banner & Viewport Switcher */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-slate-50 px-4 py-3 border-b border-rose-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Interactive UI/UX Visual Wireframe & Mockup Sandbox
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                CLIENT REVIEW GATE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive preview rendered from Maya Lin&apos;s design system and layout specs
            </p>
          </div>
        </div>

        {/* View Switchers & Device Controls */}
        <div className="flex items-center gap-2">
          {/* Live HTML vs Mockup vs Specs Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            {liveHtmlContent && (
              <button
                type="button"
                onClick={() => setActiveTab('live_html')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'live_html'
                    ? 'bg-white text-rose-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Live HTML (wireframe_preview.html)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('mockup')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'mockup'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Mockup (เห็นภาพ)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Design Tokens & Specs
            </button>
          </div>

          {/* Viewport Width Controls */}
          {(activeTab === 'mockup' || activeTab === 'live_html') && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  deviceView === 'desktop' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  deviceView === 'tablet' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Tablet View (680px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  deviceView === 'mobile' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Mobile View (360px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Theme Customizer Strip */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 text-[11px] flex items-center gap-1">
            <Sliders className="w-3 h-3 text-rose-500" />
            <span>Theme Preset:</span>
          </span>
          <div className="flex items-center gap-1.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedTheme(preset)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
                  selectedTheme.id === preset.id
                    ? 'bg-white border-slate-400 font-bold shadow-2xs text-slate-900 scale-105'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                <span>{preset.id.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Hex Chips */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span>Primary:</span>
          <span
            className="px-1.5 py-0.5 rounded font-bold text-white shadow-2xs"
            style={{ backgroundColor: selectedTheme.primary }}
          >
            {selectedTheme.primary}
          </span>
        </div>
      </div>

      {/* 3. Main Body: Live HTML Wireframe OR Live Mockup Canvas OR Raw Design Specs */}
      <div className="p-4 bg-slate-100/60 min-h-[360px] flex justify-center items-center">
        {activeTab === 'live_html' && liveHtmlContent ? (
          <div
            className={`${containerWidthClass} bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden transition-all duration-300`}
          >
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200 rounded-md px-2.5 py-0.5 text-[10px] text-slate-500 font-mono text-center truncate">
                workspace://{projectId}/wireframe_preview.html
              </div>
            </div>
            <iframe
              title="Maya Lin Live HTML Wireframe Preview"
              srcDoc={liveHtmlContent}
              sandbox="allow-scripts"
              className="w-full h-[420px] border-0 bg-white"
            />
          </div>
        ) : activeTab === 'mockup' ? (
          /* Simulated Browser Frame */
          <div
            className={`${containerWidthClass} bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden transition-all duration-300`}
          >
            {/* Browser Top Bar */}
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200 rounded-md px-2.5 py-0.5 text-[10px] text-slate-500 font-mono text-center truncate">
                https://app.preview.local/dashboard
              </div>
            </div>

            {/* Application Mockup UI Canvas */}
            <div className="p-4 sm:p-5 space-y-4" style={{ backgroundColor: selectedTheme.bg }}>
              {/* App Navbar */}
              <div
                className="p-3 rounded-xl border flex items-center justify-between shadow-2xs"
                style={{ backgroundColor: selectedTheme.surface, borderColor: selectedTheme.border }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: selectedTheme.primary }}
                  >
                    AO
                  </div>
                  <span className="text-xs font-bold text-slate-900 tracking-tight">App Workspace</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span
                    className="px-2.5 py-1 rounded-md font-semibold text-[11px]"
                    style={{ backgroundColor: `${selectedTheme.primary}15`, color: selectedTheme.primary }}
                  >
                    Dashboard
                  </span>
                  <span className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-[11px]">Tasks</span>
                  <span className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-[11px]">Analytics</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white shadow-2xs flex items-center gap-1 transition-all"
                    style={{ backgroundColor: selectedTheme.primary }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Item</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Active Projects', val: '12', trend: '+18.4%', up: true },
                  { label: 'Completed Deliverables', val: '86', trend: '+94.2%', up: true },
                  { label: 'System Health', val: '99.8%', trend: 'Operational', up: true },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border shadow-2xs space-y-1"
                    style={{ backgroundColor: selectedTheme.surface, borderColor: selectedTheme.border }}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{stat.label}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {stat.trend}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{stat.val}</div>
                  </div>
                ))}
              </div>

              {/* Interactive Task / Content Card */}
              <div
                className="p-4 rounded-xl border shadow-2xs space-y-3"
                style={{ backgroundColor: selectedTheme.surface, borderColor: selectedTheme.border }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900">Sprint Features & Components</h4>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: `${selectedTheme.primary}15`, color: selectedTheme.primary }}
                  >
                    3 COMPONENTS
                  </span>
                </div>

                {/* Interactive Checkbox Items */}
                <div className="space-y-2 text-xs">
                  {[
                    { id: 1, title: 'Responsive Client Layout & Design Tokens', tag: 'UI/UX Gate', done: mockCheckedItems[1] },
                    { id: 2, title: 'Backend REST API Routes & Database Schema', tag: 'Engineering', done: mockCheckedItems[2] },
                    { id: 3, title: 'DevSecOps Vulnerability Audit & Hardening', tag: 'Security', done: mockCheckedItems[3] },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleMockCheck(item.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        item.done ? 'bg-slate-50/80 border-slate-200 text-slate-400 line-through' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-medium text-[11px]">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Form Input Sample Row */}
                <div className="pt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Interactive search & filter prototype..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-700 pointer-events-none"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs"
                    style={{ backgroundColor: selectedTheme.primary }}
                  >
                    Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Raw Markdown Specs View */
          <div className="w-full max-h-[380px] overflow-y-auto bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
            {designDeliverable || 'No explicit design markdown deliverable found.'}
          </div>
        )}
      </div>

      {/* 4. Interactive Client Action Approval Bar (ALWAYS VISIBLE!) */}
      <div className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/50 p-4 border-t-2 border-rose-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-900">
              Ready to Dispatch Engineering Team?
            </span>
            <span className="text-slate-500 text-[11px]">
              (Architect, Database, Backend, Frontend, Security, QA)
            </span>
          </div>
        </div>

        {/* Client Notes / Modifications Input */}
        <div className="space-y-1.5">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional modifications or design feedback (e.g. ขอปุ่มสีโทนสว่าง, อยากได้ Sidebar สีเทาเข้ม, เพิ่ม Dark Mode)..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-slate-400 shadow-2xs"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
          {onRequestRevision && (
            <button
              type="button"
              onClick={() => onRequestRevision(feedback || `Selected Theme: ${selectedTheme.name}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Maya to Revise Wireframes</span>
            </button>
          )}

          {onApprove && (
            <button
              type="button"
              onClick={() =>
                onApprove(
                  feedback
                    ? `${feedback} (Approved Theme: ${selectedTheme.name}, Primary Hex: ${selectedTheme.primary})`
                    : `Approved Theme: ${selectedTheme.name} (Primary Hex: ${selectedTheme.primary})`
                )
              }
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Dispatch Engineering Team</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
