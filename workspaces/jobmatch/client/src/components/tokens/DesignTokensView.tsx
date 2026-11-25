import React, { useState } from 'react';
import { Check, Inbox, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DesignTokensView: React.FC = () => {
  const { showToast } = useToast();
  const [activeInput, setActiveInput] = useState('React & TypeScript Developer (พิมพ์ทดสอบ...)');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. COLOR PALETTE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Jobmatch Color Palette & Semantic Tokens (Approved Theme: Royal Blue #2563EB)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ชุดสีมาตรฐานตามข้อกำหนดของ Maya Lin (Lead UI/UX) และมติที่ประชุมสถาปัตยกรรมระบบ
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Brand Primary */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-brand-600 flex items-end p-2 text-white font-mono text-[10px] font-bold shadow-inner">
              #2563EB
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Primary Brand</div>
              <div className="text-[10px] text-slate-400">Royal Cobalt Blue</div>
            </div>
          </div>

          {/* Deep Navy */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-slate-900 flex items-end p-2 text-white font-mono text-[10px] font-bold shadow-inner">
              #0F172A
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Deep Navy</div>
              <div className="text-[10px] text-slate-400">High-Contrast Header</div>
            </div>
          </div>

          {/* Growth Emerald */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-growth-500 flex items-end p-2 text-white font-mono text-[10px] font-bold shadow-inner">
              #10B981
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Growth Emerald</div>
              <div className="text-[10px] text-slate-400">1-Click Apply & Verified</div>
            </div>
          </div>

          {/* University Violet */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-uni-600 flex items-end p-2 text-white font-mono text-[10px] font-bold shadow-inner">
              #7C3AED
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">University Violet</div>
              <div className="text-[10px] text-slate-400">Accreditation & Cohorts</div>
            </div>
          </div>

          {/* Admin Amber */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-admin-600 flex items-end p-2 text-white font-mono text-[10px] font-bold shadow-inner">
              #D97706
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Admin Amber</div>
              <div className="text-[10px] text-slate-400">Moderation & Warnings</div>
            </div>
          </div>

          {/* Canvas Slate */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-end p-2 text-slate-700 font-mono text-[10px] font-bold">
              #F8FAFC
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Canvas Surface</div>
              <div className="text-[10px] text-slate-400">Anti-Glare App BG</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE UI STATES MATRIX */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Core UX Component States Matrix (Active, Loading, Empty, Error)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รองรับการตอบสนองทุกสถานะการใช้งานตามแนวคิด Accessible Ergonomics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STATE A: ACTIVE */}
          <div className="bg-white p-4 rounded-xl border-2 border-brand-500 space-y-3 relative shadow-xs">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
              Active State
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">ระบบทำงานปกติ (Interactive)</h4>
                <p className="text-[10px] text-slate-400">ปุ่มและฟอร์มตอบสนองทันที</p>
              </div>
            </div>
            <input
              type="text"
              value={activeInput}
              onChange={(e) => setActiveInput(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-brand-500 ring-2 ring-brand-100 outline-none"
            />
            <button
              onClick={() => showToast('ทดสอบการกดปุ่ม Active State สำเร็จ!', 'success')}
              className="w-full py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-all flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ทดสอบส่งข้อมูล</span>
            </button>
          </div>

          {/* STATE B: LOADING SKELETON */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-400 text-white">
              Loading State
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-2 bg-slate-100 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-7 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          {/* STATE C: EMPTY STATE */}
          <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2 relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-600 text-white">
              Empty State
            </span>
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mt-2">
              <Inbox className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">ยังไม่มีประวัติการสมัครงาน</h4>
            <p className="text-[10px] text-slate-400">
              ค้นหาตำแหน่งงานที่เปิดรับ และเริ่มยื่นใบสมัครครั้งแรกของคุณได้ทันที
            </p>
            <button
              onClick={() => showToast('คลิก CTA ของ Empty State', 'info')}
              className="px-3 py-1 bg-brand-50 text-brand-600 rounded-md text-xs font-bold hover:bg-brand-100 transition-all"
            >
              ค้นหางานเดี๋ยวนี้
            </button>
          </div>

          {/* STATE D: ERROR STATE */}
          <div className="bg-white p-4 rounded-xl border border-red-300 space-y-3 relative bg-red-50/20">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
              Error State
            </span>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-xs font-bold">ไม่สามารถอัปโหลดไฟล์เรซูเม่ได้</div>
            </div>
            <p className="text-[10px] text-red-500 leading-relaxed">
              ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 5MB) และต้องเป็นไฟล์นามสกุล .PDF เท่านั้น
            </p>
            <button
              onClick={() => showToast('คลิกเลือกไฟล์ใหม่ (Error Recovery CTA)', 'warning')}
              className="w-full py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-all"
            >
              เลือกไฟล์ใหม่
            </button>
          </div>
        </div>
      </div>

      {/* 3. TYPOGRAPHY SCALE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          3. Typography Hierarchy Scale (Plus Jakarta Sans / Prompt)
        </h2>
        <div className="space-y-2 text-slate-800">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
            <span className="text-2xl font-extrabold">H1 / Heading Bold (28px - 32px)</span>
            <span className="text-xs font-mono text-slate-400">Hero Headlines & Page Titles</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
            <span className="text-xl font-bold">H2 / Section Title (20px - 24px)</span>
            <span className="text-xs font-mono text-slate-400">Dashboard Cards & Modules</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
            <span className="text-base font-semibold">H3 / Subheading (16px - 18px)</span>
            <span className="text-xs font-mono text-slate-400">Job Titles & Roster Names</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
            <span className="text-sm font-normal text-slate-600">Body Regular (14px - 15px)</span>
            <span className="text-xs font-mono text-slate-400">Job Descriptions & Paragraphs</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">Caption / Meta (11px - 12px)</span>
            <span className="text-xs font-mono text-slate-400">Tags, Timestamps, Helper Notes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
