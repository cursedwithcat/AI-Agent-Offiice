'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DialogueMessage, PipelineCheckpoint, RoleInfo } from '../types';
import { RoleIcon } from './RoleIcon';
import { VisualWireframeMockup } from './VisualWireframeMockup';
import { PipelineResumeCard } from './PipelineResumeCard';
import {
  Wrench,
  Clock,
  ArrowDown,
  RotateCcw,
  GitBranch,
  Terminal,
  Activity,
  CheckCircle2,
  FileCode,
  AlertTriangle,
  Brain,
  Sparkles,
  ShieldCheck,
  Cpu,
  Zap,
  Trash2,
} from 'lucide-react';

interface LiveStreamProps {
  messages: DialogueMessage[];
  isRunning: boolean;
  onClearMessages: () => void;
  onApproveDesign?: (feedback?: string) => void;
  onRequestDesignRevision?: (feedback: string) => void;
  isPendingApproval?: boolean;
  checkpoint?: PipelineCheckpoint | null;
  roles?: RoleInfo[];
  onResumePipeline?: (notes?: string) => void;
  onDiscardCheckpoint?: () => void;
  projectId?: string;
}

export const LiveStream: React.FC<LiveStreamProps> = ({
  messages,
  isRunning,
  onClearMessages,
  onApproveDesign,
  onRequestDesignRevision,
  isPendingApproval = false,
  checkpoint,
  roles,
  onResumePipeline,
  onDiscardCheckpoint,
  projectId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col h-[650px] shadow-sm shadow-slate-100 overflow-hidden">
      {/* Stream Header */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
              }`}
            />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Collaboration Stream
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            ({messages.length} events)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              autoScroll
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-scroll</span>
          </button>

          {/* Clear / Delete Logs */}
          <button
            type="button"
            onClick={onClearMessages}
            disabled={isRunning || messages.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            title="ลบประวัติ Log ทั้งหมดของ Workspace นี้"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>ลบ Log</span>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs bg-slate-50/30"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Awaiting Company Instructions
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                Launch the company pipeline to watch leadership, UX/UI, dev, and QA departments consult and create software.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          // 1. Phase change milestone banner
          if (msg.type === 'phase') {
            return (
              <div
                key={`${msg.id}_${idx}`}
                className="my-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs border border-blue-200 bg-white shrink-0"
                    style={{ color: msg.color || '#2563eb' }}
                  >
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
                      Workflow Milestone Handover
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      {msg.phase}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(msg.model || msg.effort) && (
                    <div className="flex items-center gap-1.5">
                      {msg.model && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[10px] font-mono font-semibold text-blue-700"
                          title="โมเดล AI ที่ใช้รันขั้นตอนนี้"
                        >
                          <Cpu className="w-2.5 h-2.5 text-blue-500" />
                          {msg.model === 'default' ? 'CLI Default' : msg.model}
                        </span>
                      )}
                      {msg.effort && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-mono font-bold uppercase text-amber-700"
                          title="ระดับการใช้ความคิด (Reasoning Effort) ในขั้นตอนนี้"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                          {msg.effort}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          }

          // 2. Interactive UI/UX Design Review & Approval Gate with Visual Wireframe Mockup
          if (msg.type === 'approval') {
            return (
              <VisualWireframeMockup
                key={`${msg.id}_${idx}`}
                designDeliverable={msg.design_deliverable || msg.content}
                onApprove={onApproveDesign}
                onRequestRevision={onRequestDesignRevision}
                isPendingApproval={true}
                projectId={projectId}
              />
            );
          }

          // 3. Tool execution card
          if (msg.type === 'tool') {
            const isDone = msg.toolState === 'DONE';
            return (
              <div
                key={`${msg.id}_${idx}`}
                className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/80 font-mono text-[11px] shadow-2xs hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {msg.toolName}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      }`}
                    >
                      {msg.toolState}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    {msg.toolDuration && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {msg.toolDuration}s
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.toolParams && Object.keys(msg.toolParams).length > 0 && (
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60 overflow-x-auto text-[10px] text-slate-600">
                    <pre className="font-mono">
                      {JSON.stringify(msg.toolParams, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          }

          // 4. System Message Card
          if (msg.type === 'system') {
            return (
              <div
                key={`${msg.id}_${idx}`}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 font-mono text-[11px] shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>System Runtime Event</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="prose prose-xs max-w-none text-slate-600">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            );
          }

          // 5. Regular Agent Message Bubble
          return (
            <div
              key={`${msg.id}_${idx}`}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors"
            >
              {/* Agent Badge Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${msg.color || '#2563eb'}10`,
                      borderColor: `${msg.color || '#2563eb'}30`,
                      color: msg.color || '#2563eb',
                    }}
                  >
                    <RoleIcon name={msg.agent_id} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {msg.agent_name || 'Agent'}
                      </span>
                      <span
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${msg.color || '#2563eb'}10`,
                          color: msg.color || '#2563eb',
                          border: `1px solid ${msg.color || '#2563eb'}30`,
                        }}
                      >
                        {msg.role_title || msg.agent_id}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {/* Thinking Box if available */}
              {msg.thinking && (
                <div className="mb-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-700 text-[11px] flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{msg.thinking}</span>
                </div>
              )}

              {/* Formatted Markdown Content */}
              <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed space-y-2">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xs font-bold text-slate-900 mt-2 mb-1">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs font-semibold text-slate-800 mt-1.5 mb-1">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {children}
                      </p>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono font-semibold">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto my-2">
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 space-y-1 my-1 text-slate-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 space-y-1 my-1 text-slate-700">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-3 border-blue-500 pl-3 italic text-slate-600 my-1 bg-slate-50 py-1">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {/* If this is Maya Lin's message requesting approval or containing design specs, render VisualWireframeMockup directly */}
              {msg.agent_id === 'designer' &&
                (msg.content.includes('Design Approval') ||
                  msg.content.includes('approve') ||
                  msg.content.includes('Approve') ||
                  msg.content.includes('Client Action Requested') ||
                  msg.content.includes('Revision v1')) && (
                  <div className="mt-3">
                    <VisualWireframeMockup
                      designDeliverable={msg.content}
                      onApprove={onApproveDesign}
                      onRequestRevision={onRequestDesignRevision}
                      isPendingApproval={true}
                      projectId={projectId}
                    />
                  </div>
                )}
            </div>
          );
        })}

        {/* Fallback bottom card: If isPendingApproval is true and no inline approval card was matched */}
        {isPendingApproval &&
          onApproveDesign &&
          !messages.some(
            (m) =>
              m.type === 'approval' ||
              (m.agent_id === 'designer' &&
                (m.content.includes('Design Approval') ||
                  m.content.includes('approve') ||
                  m.content.includes('Approve') ||
                  m.content.includes('Client Action Requested')))
          ) && (
            <div className="mt-3">
              <VisualWireframeMockup
                onApprove={onApproveDesign}
                onRequestRevision={onRequestDesignRevision}
                isPendingApproval={true}
                projectId={projectId}
              />
            </div>
          )}

        {/* Checkpoint Resume Card when execution was interrupted, errored, or halted */}
        {checkpoint && !isRunning && onResumePipeline && (
          <div className="mt-3">
            <PipelineResumeCard
              checkpoint={checkpoint}
              roles={roles || []}
              onResume={onResumePipeline}
              onDiscard={onDiscardCheckpoint}
            />
          </div>
        )}
      </div>
    </div>
  );
};
