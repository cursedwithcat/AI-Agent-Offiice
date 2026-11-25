import React from 'react';
import { Users, TrendingUp, Target, BadgeDollarSign } from 'lucide-react';
import { UniversityAnalytics } from '../../types';

interface KPICardProps {
  analytics: UniversityAnalytics | null;
}

export const KPICard: React.FC<KPICardProps> = ({ analytics }) => {
  const total = analytics?.totalMonitoredStudents || 352;
  const rate = analytics?.employmentRate || 82.7;
  const inFieldPct = analytics?.outcomes?.employedInField || 64.2;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* METRIC 1: TOTAL MONITORED STUDENTS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            นิสิตในรุ่นทั้งหมด (Monitored)
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-brand-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{total.toLocaleString()}</span>
          <span className="text-xs font-bold text-growth-600 flex items-center">
            ↑ 100% Verified
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">นิสิตชั้นปีที่ 4 และบัณฑิตจบใหม่</p>
      </div>

      {/* METRIC 2: EMPLOYMENT RATE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            อัตราการมีงานทำ (Rate)
          </span>
          <div className="p-2 rounded-xl bg-growth-50 text-growth-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-growth-600">{rate.toFixed(1)}%</span>
          <span className="text-xs font-bold text-growth-600">+6.8% YoY</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">เกณฑ์เป้าหมาย สกอ.: 80.0%</p>
      </div>

      {/* METRIC 3: IN-FIELD PLACEMENT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ทำงานตรงสาย (In-Field)
          </span>
          <div className="p-2 rounded-xl bg-purple-50 text-uni-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-uni-700">{inFieldPct.toFixed(1)}%</span>
          <span className="text-xs font-bold text-slate-500">ตรงตามหลักสูตร</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">วัดผลความสอดคล้องของหลักสูตร</p>
      </div>

      {/* METRIC 4: AVERAGE SALARY */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            เงินเดือนเฉลี่ยเริ่มต้น
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <BadgeDollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">฿32,450</span>
          <span className="text-xs font-bold text-growth-600">+8.4%</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">เทียบกับเกณฑ์สำรวจปีก่อนหน้า</p>
      </div>
    </div>
  );
};
