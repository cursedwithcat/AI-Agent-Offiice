'use client';

import React from 'react';
import { Bot, Terminal, FolderGit2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

interface HeaderProps {
  backendOnline: boolean;
  activeProjectName?: string;
  onRefreshProjects?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ backendOnline, activeProjectName }) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Agent Office
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono font-medium">
                  Autonomous v1.0
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              Multi-Agent Software Engineering Venture on Antigravity CLI
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          {/* Active Workspace Pill */}
          {activeProjectName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] text-slate-500">Workspace:</span>
              <strong className="text-slate-900 font-mono text-[11px]">{activeProjectName}</strong>
            </div>
          )}

          {/* Antigravity CLI Engine Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-slate-500">Core:</span>
            <span className="text-emerald-700 font-semibold font-mono text-[11px]">agy CLI</span>
          </div>

          {/* Server Connection Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium font-mono ${
              backendOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {backendOnline ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>Backend Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
