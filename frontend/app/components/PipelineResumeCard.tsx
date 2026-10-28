'use client';

import React, { useState } from 'react';
import { AgentRoleId, RoleInfo, PipelineCheckpoint } from '../types';
import { RoleIcon } from './RoleIcon';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

interface PipelineResumeCardProps {
  checkpoint: PipelineCheckpoint;
  roles: RoleInfo[];
  onResume: (correctionNotes?: string) => void;
  onDiscard?: () => void;
}

const PIPELINE_ROLES: AgentRoleId[] = [
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

export const PipelineResumeCard: React.FC<PipelineResumeCardProps> = ({
  checkpoint,
  roles,
  onResume,
  onDiscard,
}) => {
  const [correctionNote, setCorrectionNote] = useState('');

  const resumeRoleInfo = roles.find((r) => r.id === checkpoint.resumeFromRole) || {
    id: checkpoint.resumeFromRole,
    name: checkpoint.resumeFromRole,
    title: 'Next Specialist',
    color: '#2563EB',
  };

  const completedCount = checkpoint.completedRoles.length;
  const remainingCount = Math.max(0, PIPELINE_ROLES.length - completedCount);

  return (
    <div className="my-3.5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-blue-50/60 border-2 border-amber-300 shadow-md space-y-3.5 transition-all animate-fadeIn select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-amber-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Pipeline Interruption Checkpoint Saved
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>CAN RESUME FROM HERE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              กระบวนการค้างหรือเกิดข้อผิดพลาด ระบบบันทึกผลงานของขั้นตอนก่อนหน้าไว้แล้ว สามารถรันต่อได้ทันทีโดยไม่ต้องเริ่มใหม่
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-mono self-start sm:self-auto">
          {checkpoint.timestamp}
        </span>
      </div>

      {/* Progress & Milestone Badges */}
      <div className="p-3 bg-white/95 rounded-xl border border-amber-200/70 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-700">
            Milestones Completed: <span className="text-emerald-600 font-bold">{completedCount} of {PIPELINE_ROLES.length}</span>
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            {remainingCount} phases remaining
          </span>
        </div>

        {/* Mini Role Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {PIPELINE_ROLES.map((rId) => {
            const isCompleted = checkpoint.completedRoles.includes(rId);
            const isNext = rId === checkpoint.resumeFromRole;
            const rInfo = roles.find((r) => r.id === rId);

            return (
              <div
                key={rId}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                    : isNext
                    ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-bold shadow-2xs scale-105'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : isNext ? (
                  <Play className="w-3 h-3 text-amber-600 fill-amber-600 shrink-0" />
                ) : (
                  <RoleIcon name={rId} className="w-3 h-3 opacity-40 shrink-0" />
                )}
                <span>{rInfo?.name.split(' ')[0] || rId}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Resume Info */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <RoleIcon name={checkpoint.resumeFromRole} className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 text-[11px]">
          <span>Will resume with: </span>
          <strong className="text-blue-950 font-bold">
            {resumeRoleInfo.name} ({resumeRoleInfo.title})
          </strong>
          <span className="text-blue-700/80"> — All previous deliverables will be forwarded automatically.</span>
        </div>
      </div>

      {/* Optional Guidance / Correction Notes */}
      <div className="space-y-1.5">
        <input
          type="text"
          value={correctionNote}
          onChange={(e) => setCorrectionNote(e.target.value)}
          placeholder="คำแนะนำเพิ่มเติมหรือวิธีแก้ error (เช่น ลองใช้ SQLite แทน, ข้ามการเทสพอร์ต 8000, แก้ชื่อไฟล์)..."
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-slate-400 shadow-2xs"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            ยกเลิก (เริ่มใหม่จากศูนย์)
          </button>
        )}

        <button
          type="button"
          onClick={() => onResume(correctionNote)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Resume Process (รันต่อจากจุดที่ค้าง)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
