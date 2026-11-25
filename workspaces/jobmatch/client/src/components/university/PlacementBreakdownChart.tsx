import React from 'react';
import { UniversityAnalytics } from '../../types';

interface PlacementBreakdownChartProps {
  analytics: UniversityAnalytics | null;
}

export const PlacementBreakdownChart: React.FC<PlacementBreakdownChartProps> = ({
  analytics,
}) => {
  const outcomes = analytics?.outcomes || {
    employedInField: 64.2,
    employedOutOfField: 18.2,
    continuingEd: 9.4,
    seeking: 8.2,
  };

  const sectors = analytics?.topHiringSectors || [
    { sector: 'Information Technology', percentage: 42.5 },
    { sector: 'Banking & Fintech', percentage: 28.0 },
    { sector: 'Logistics & Supply Chain', percentage: 15.5 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          สัดส่วนสถานะการมีงานทำ (KPI Breakdown)
        </h3>
        <span className="text-[10px] text-growth-700 bg-growth-50 px-2 py-0.5 rounded-full font-semibold border border-growth-200">
          ● Real-Time Sync
        </span>
      </div>

      {/* PROGRESS BARS */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-growth-500"></span>
              <span>ทำงานตรงสาขาวิชา (Employed In-Field)</span>
            </span>
            <span className="font-bold text-slate-800">
              {outcomes.employedInField.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-growth-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, outcomes.employedInField)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>ทำงานต่างสาขา (Employed Out-of-Field)</span>
            </span>
            <span className="font-bold text-slate-800">
              {outcomes.employedOutOfField.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, outcomes.employedOutOfField)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>ศึกษาต่อระดับสูง (Continuing Studies)</span>
            </span>
            <span className="font-bold text-slate-800">
              {outcomes.continuingEd.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, outcomes.continuingEd)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>กำลังหางาน (Actively Seeking)</span>
            </span>
            <span className="font-bold text-slate-800">
              {outcomes.seeking.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, outcomes.seeking)}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOP HIRING SECTORS */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          กลุ่มธุรกิจหลักที่รับบัณฑิตเข้าทำงาน
        </h4>
        <div className="space-y-1.5">
          {sectors.map((sec, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
              <span>{sec.sector}</span>
              <span className="font-semibold text-slate-800">{sec.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ARCHITECTURE HIGHLIGHT NOTE */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-bold text-slate-800 flex items-center gap-1">
          <span>💡 ข้อได้เปรียบของระบบ Jobmatch:</span>
        </span>
        <p className="text-[11px] leading-relaxed">
          เมื่อบริษัทในระบบกดยืนยันการจ้างงาน (Hired) ใน ATS ข้อมูลจะเชื่อมโยงเป็นสถานะ "ได้งานทำตรงสาย" ทันที โดยที่สำนักทะเบียนไม่ต้องเสียเวลาทำแบบสอบถามติดตามผลหลังจบการศึกษา
        </p>
      </div>
    </div>
  );
};
