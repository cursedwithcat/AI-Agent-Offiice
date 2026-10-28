'use client';

import React from 'react';
import { RoleInfo, AgentRoleId } from '../types';
import { Sparkles, Terminal, Code2, ShieldAlert, Cpu } from 'lucide-react';

interface AgentBoardProps {
  roles: RoleInfo[];
  activeAgentId?: string;
  activePhase?: string;
  isRunning: boolean;
}

export const AgentBoard: React.FC<AgentBoardProps> = ({
  roles,
  activeAgentId,
  activePhase,
  isRunning,
}) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Executive Boardroom & Engineering Team</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {roles.length} Agents
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Cross-functional collaborative roles consulting and building software together
          </p>
        </div>

        {isRunning && activePhase && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium truncate max-w-xs">{activePhase}</span>
          </div>
        )}
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {roles.map((role) => {
          const isActive = activeAgentId === role.id && isRunning;

          return (
            <div
              key={role.id}
              className={`relative rounded-xl p-3.5 transition-all duration-300 border flex flex-col justify-between ${
                isActive
                  ? 'bg-zinc-800/90 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02] ring-1 ring-indigo-500'
                  : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/80'
              }`}
            >
              {/* Active Pulse Glow */}
              {isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Turn
                </div>
              )}

              <div>
                {/* Avatar and Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10"
                    style={{ backgroundColor: `${role.color}25` }}
                  >
                    <span>{role.avatar}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-sm text-zinc-100 truncate">
                      {role.name}
                    </h3>
                    <p
                      className="text-[11px] font-medium truncate"
                      style={{ color: role.color }}
                    >
                      {role.title.split('(')[0]}
                    </p>
                  </div>
                </div>

                {/* Department & Tagline */}
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {role.tagline}
                </p>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 font-medium">{role.department}</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-zinc-800/60 text-zinc-400'
                  }`}
                >
                  {isActive ? 'Processing...' : 'Ready'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
