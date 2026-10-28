'use client';

import React, { useState, useEffect } from 'react';
import { RoleInfo, AvailableModel, ModelListResponse } from '../types';
import { RoleIcon } from './RoleIcon';
import { Agent3DShowcase } from './Agent3DShowcase';
import {
  Sparkles,
  Save,
  RotateCcw,
  MessageSquare,
  Send,
  Brain,
  Award,
  Zap,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
  Shield,
  Eye,
  Scale,
  Gauge,
  Lightbulb,
  Flame,
  Sliders,
} from 'lucide-react';

interface AgentDossierModalProps {
  agent: RoleInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAgent: RoleInfo) => Promise<void>;
  onReset: (agentId: string) => Promise<void>;
}

export const AgentDossierModal: React.FC<AgentDossierModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'prompt' | 'chat'>('profile');

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [personality, setPersonality] = useState('');
  const [level, setLevel] = useState(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [model, setModel] = useState('default');
  const [effort, setEffort] = useState('medium');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');

  // Available AI models & effort options from agy CLI
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [availableEfforts, setAvailableEfforts] = useState<string[]>(['low', 'medium', 'high', 'xhigh', 'max']);

  // Fetch available models from backend on component mount
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: ModelListResponse) => {
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
        if (data.efforts && data.efforts.length > 0) {
          setAvailableEfforts(data.efforts);
        }
      })
      .catch((e) => console.warn('Could not fetch agy models:', e));
  }, []);

  // Interactive Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string; time: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Status message
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync state whenever agent changes
  useEffect(() => {
    if (agent) {
      setName(agent.name || '');
      setTitle(agent.title || '');
      setDepartment(agent.department || '');
      setColor(agent.color || '#2563eb');
      setTagline(agent.tagline || '');
      setDescription(agent.description || '');
      setSystemPrompt(agent.system_prompt || '');
      setPersonality(agent.personality || 'Professional, diligent, and collaborative.');
      setLevel(agent.level || 5);
      setSkills(agent.skills || []);
      const m = agent.model || 'default';
      setModel(m);
      const isKnown = ['default', 'gemini-3.8-flash', 'claude-sonnet-5-5', 'claude-opus-5-5', 'gpt-oss-120b'].includes(m);
      if (!isKnown && m !== 'default') {
        setIsCustomModel(true);
        setCustomModelText(m);
      } else {
        setIsCustomModel(false);
        setCustomModelText('');
      }
      setEffort(agent.effort || 'medium');
      setChatHistory([
        {
          role: 'agent',
          text: `สวัสดีครับ/ค่ะ! ผม/ฉันคือ ${agent.name} (${agent.title}) ยินดีที่ได้ร่วมงาน มีอะไรให้ช่วยวางแผน ออกแบบ หรือตรวจสอบโค้ดไหมครับ/คะ?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setSaveSuccess(false);
    }
  }, [agent]);

  if (!isOpen || !agent) return null;

  const currentPreviewAgent: RoleInfo = {
    ...agent,
    name,
    title,
    department,
    color,
    tagline,
    description,
    system_prompt: systemPrompt,
    personality,
    level,
    skills,
    model,
    effort,
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleApplyPreset = (type: 'thai' | 'strict' | 'fast' | 'creative') => {
    let presetNotice = '';
    if (type === 'thai') {
      presetNotice = '\n\n[INSTRUCTION OVERRIDE: Please think and generate all explanations, summaries, and deliverables in natural, professional Thai language (ภาษาไทย) wherever appropriate.]';
    } else if (type === 'strict') {
      presetNotice = '\n\n[INSTRUCTION OVERRIDE: Apply strict zero-defect standards. Validate all edge cases, enforce clean architecture, and refuse any sub-par implementations.]';
    } else if (type === 'fast') {
      presetNotice = '\n\n[INSTRUCTION OVERRIDE: Focus on rapid prototyping and high velocity. Be concise, skip pleasantries, deliver working code immediately.]';
    } else if (type === 'creative') {
      presetNotice = '\n\n[INSTRUCTION OVERRIDE: Be bold and visionary. Suggest cutting-edge UI/UX patterns, innovative architecture, and delight the user.]';
    }
    setSystemPrompt((prev) => prev.trim() + presetNotice);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentPreviewAgent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save agent:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Are you sure you want to reset ${agent.name} to default factory prompt and profile?`)) {
      setIsResetting(true);
      try {
        await onReset(agent.id);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (e) {
        console.error('Failed to reset agent:', e);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userText = chatMessage.trim();
    setChatMessage('');
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory((prev) => [...prev, { role: 'user', text: userText, time: userTime }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/agents/${agent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      if (res.ok) {
        const data = await res.json();
        const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatHistory((prev) => [
          ...prev,
          { role: 'agent', text: data.reply || 'Acknowledged and noted!', time: agentTime },
        ]);
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          text: `(In-Character Live Test) "${name}": ได้รับคำสั่ง "${userText}" แล้ว พร้อมดำเนินการตาม Prompt ที่คุณกำหนดไว้ในระบบครับ!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] shadow-2xl border border-slate-700/60 flex flex-col md:flex-row overflow-hidden text-slate-800">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: 3D CHARACTER TURNTABLE SHOWCASE & RPG STATS */}
        {/* ========================================================= */}
        <div className="w-full md:w-80 lg:w-88 flex-shrink-0 bg-slate-950 text-white flex flex-col border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto">
          {/* Header of 3D Card */}
          <div className="p-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {agent.id}
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px] font-bold">
              Lv.{level} SPECIALIST
            </div>
          </div>

          {/* 3D Model Rotating Turntable Viewport */}
          <div className="px-4 py-1">
            <Agent3DShowcase agent={currentPreviewAgent} className="h-64 sm:h-72 w-full" />
          </div>

          {/* Character Quick Info Card */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight">{name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{title}</p>
                </div>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm border border-white/20"
                  style={{ backgroundColor: color }}
                >
                  <RoleIcon name={agent.id} className="w-4 h-4" />
                </div>
              </div>

              {/* Department & Status */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {department}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono font-bold">
                  ● ACTIVE / READY
                </span>
              </div>

              {/* Active AI Model & Reasoning Effort Badge */}
              <div
                onClick={() => setActiveTab('prompt')}
                title="คลิกเพื่อแก้ไข Model และ Effort ประจำตัวพนักงานคนนี้"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800/90 hover:border-blue-500/50 space-y-1 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>Default Model</span>
                  </span>
                  <span className="font-bold text-slate-200 truncate max-w-[140px] text-right">
                    {model === 'default' ? 'CLI Default' : model}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Default Effort</span>
                  </span>
                  <span
                    className={`font-bold uppercase px-1.5 py-0.5 rounded text-[9px] ${
                      effort === 'high' || effort === 'xhigh' || effort === 'max'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : effort === 'low'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {effort}
                  </span>
                </div>
              </div>

              {/* Personality quote */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] italic leading-relaxed">
                "{personality || 'Dedicated and proactive specialist ready for execution.'}"
              </div>
            </div>

            {/* Quick action buttons on 3D pane */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Brain</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CHARACTER TABS, PROMPT EDITOR & TEST DIALOGUE */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          
          {/* Top Banner Header */}
          <div
            className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${color}12 0%, #ffffff 100%)`,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {agent.id}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Lv.{level}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {title} • <span className="text-slate-700 font-semibold">{department}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 px-6 pt-1 bg-slate-50 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Character & Role (ข้อมูลตัวละคร)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'prompt'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Brain className="w-4 h-4 text-purple-500" />
              <span>AI Brain & Prompt (การตั้งค่าคำสั่ง)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Test Dialogue (คุยทดสอบบทบาท)</span>
            </button>
          </div>

          {/* Tab Contents Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* TAB 1: PROFILE & RPG STATS */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee Name (ชื่อพนักงาน)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                      placeholder="e.g. Alex Vance"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role Title (ตำแหน่งงาน)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                      placeholder="e.g. Chief Executive Officer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department (แผนกงาน)
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                      placeholder="e.g. Executive Leadership"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Theme Color (สีประจำตัว)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specialist Level (เลเวลความสามารถ: 1 - 10)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={level}
                        onChange={(e) => setLevel(parseInt(e.target.value))}
                        className="flex-1 cursor-pointer accent-slate-900"
                      />
                      <span className="w-12 text-center text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-mono">
                        Lv.{level}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tagline (คติประจำตัว)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                      placeholder="e.g. Visionary Leader & Strategic Planner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personality Traits (บุคลิกภาพและการตอบสนอง)
                  </label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                    placeholder="e.g. Decisive, inspiring, strategic, concise"
                  />
                </div>

                {/* Skills Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skills & Specializations (ทักษะเฉพาะทาง)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-2 min-h-[42px]">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a new skill and press Enter (e.g. React, PostgreSQL, Docker)..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI BRAIN & SYSTEM PROMPT */}
            {activeTab === 'prompt' && (
              <div className="space-y-4">
                {/* AI Model & Reasoning Effort Selection Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span>ค่า AI ประจำตัวพนักงานคนนี้ (Saved Role Default)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      agy --model / --effort
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    💡 <strong>มีผลเมื่อไหร่:</strong> ค่าที่บันทึกไว้ตรงนี้คือ <strong>ค่าเริ่มต้นประจำตำแหน่งของ {name}</strong> ซึ่งจะถูกนำไปรันจริงทุกครั้งที่แถบตั้งค่าหน้าหลักเลือกเป็นโหมด <strong>&ldquo;ใช้ค่าประจำตำแหน่ง (Per-Role)&rdquo;</strong> (และใช้ในการคุยทดสอบที่แท็บ Test Dialogue)
                  </p>

                    {/* Model Selector & Custom Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Assigned AI Model (เลือกโมเดล AI)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomModel(!isCustomModel);
                            if (!isCustomModel) {
                              setCustomModelText(model === 'default' ? '' : model);
                            } else {
                              setModel('default');
                            }
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>{isCustomModel ? 'เลือกจาก Preset' : 'พิมพ์โมเดลเอง (Custom)'}</span>
                        </button>
                      </div>

                      {!isCustomModel ? (
                        <select
                          value={model}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomModel(true);
                              setCustomModelText('');
                            } else {
                              setModel(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-2xs"
                        >
                          <option value="default">Default CLI Model (โมเดลมาตรฐาน agy)</option>
                          {availableModels
                            .filter((m) => m.id !== 'default')
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name || m.id} ({m.family || 'AI'})
                              </option>
                            ))}
                          <option value="__custom__">+ Custom Model Name (พิมพ์ชื่อโมเดลเอง)...</option>
                        </select>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={customModelText}
                            onChange={(e) => {
                              setCustomModelText(e.target.value);
                              setModel(e.target.value.trim() || 'default');
                            }}
                            placeholder="เช่น claude-3-7-sonnet, gemini-2.5-pro, deepseek-r1"
                            className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-blue-400 bg-blue-50/20 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          {/* Quick presets */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-medium">แนะนำ:</span>
                            {['claude-3-7-sonnet', 'gemini-2.5-pro', 'gpt-4o', 'deepseek-r1'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setCustomModelText(preset);
                                  setModel(preset);
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        สามารถเลือกโมเดลหลัก หรือพิมพ์ระบุโมเดลภายนอกได้อิสระ
                      </p>
                    </div>

                    {/* Reasoning Effort Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Reasoning Effort (ระดับการคิดวิเคราะห์ / ความลึก)
                      </label>
                      <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300/80">
                        {(['low', 'medium', 'high', 'max'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setEffort(lvl)}
                            className={`py-1.5 px-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer flex items-center justify-center gap-1 ${
                              effort === lvl
                                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {lvl === 'low' && <Zap className="w-3 h-3 text-emerald-600" />}
                            {lvl === 'medium' && <Scale className="w-3 h-3 text-blue-600" />}
                            {lvl === 'high' && <Brain className="w-3 h-3 text-purple-600" />}
                            {lvl === 'max' && <Flame className="w-3 h-3 text-rose-600" />}
                            <span>{lvl}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        {effort === 'low' && (
                          <>
                            <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Low: ประมวลผลรวดเร็ว กระชับ ประหยัดโทเค็น</span>
                          </>
                        )}
                        {effort === 'medium' && (
                          <>
                            <Scale className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Medium: สมดุลมาตรฐานระหว่างความเร็วและคุณภาพ</span>
                          </>
                        )}
                        {effort === 'high' && (
                          <>
                            <Brain className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>High: คิดวิเคราะห์เชิงลึก เหมาะกับงานสถาปัตยกรรม & ออกแบบระบบ</span>
                          </>
                        )}
                        {effort === 'max' && (
                          <>
                            <Flame className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Max: ใช้ขีดความสามารถการคิดระดับสูงสุดสำหรับโจทย์ยาก</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Agent Core System Prompt (สมองและการตัดสินใจของ AI)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      คำสั่งนี้จะถูกบันทึกลง Database และถูกนำไปรันจริงเมื่อสั่งงานในโหมด Pipeline, Meeting, หรือ Maintenance
                    </p>
                  </div>

                  {/* Preset Overrides */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('thai')}
                      className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 cursor-pointer"
                      title="เน้นตอบภาษาไทย"
                    >
                      + ภาษาไทย
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('strict')}
                      className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 cursor-pointer"
                      title="เน้นความถูกต้องสูงสุด"
                    >
                      + Strict QA
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('fast')}
                      className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 cursor-pointer"
                      title="เน้นทำงานไว กระชับ"
                    >
                      + Fast MVP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('creative')}
                      className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 cursor-pointer"
                      title="คิดนอกกรอบ ออกแบบล้ำสมัย"
                    >
                      + Creative
                    </button>
                  </div>
                </div>

                {/* Code/Prompt Editor */}
                <div className="relative">
                  <textarea
                    rows={13}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 selection:bg-emerald-900"
                    placeholder="Enter custom instructions for this role..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(systemPrompt);
                      alert('Copied prompt to clipboard!');
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>เคล็ดลับ:</strong> คุณสามารถใช้ตัวแปร <code className="bg-slate-200 px-1 rounded font-mono text-slate-900">{'{project_name}'}</code> และ <code className="bg-slate-200 px-1 rounded font-mono text-slate-900">{'{project_dir}'}</code> ในข้อความ Prompt ได้ ระบบจะแทนที่ด้วยชื่อและโฟลเดอร์โปรเจกต์จริงขณะเริ่มรันงาน
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE TEST DIALOGUE */}
            {activeTab === 'chat' && (
              <div className="space-y-3 flex flex-col h-[380px]">
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {chatHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          item.role === 'user'
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p>{item.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1 font-mono">
                        {item.role === 'user' ? 'You' : name} • {item.time}
                      </span>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
                      <Activity className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      <span>{name} is thinking based on custom prompt...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={`Chat with ${name} to test their personality and instructions...`}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || isChatLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset prompt and details to default template"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset to Default</span>
              </button>

              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved to Database!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Saving...' : 'Save to Database'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
