import React from 'react';
import { Clock, MapPin, Building2, ChevronRight, Check, Bookmark } from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
  onApply: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  hasApplied = false,
  onApply,
  onViewDetails,
}) => {
  const formatSalary = (min?: number | null, max?: number | null, currency = 'THB') => {
    if (!min && !max) return 'ตามตกลง (Negotiable)';
    const sym = currency === 'THB' ? '฿' : currency;
    if (min && max) return `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()} / เดือน`;
    if (min) return `เริ่มต้น ${sym}${min.toLocaleString()} / เดือน`;
    return `สูงสุด ${sym}${max?.toLocaleString()} / เดือน`;
  };

  const skillsList: string[] = Array.isArray(job.skills_required)
    ? job.skills_required
    : typeof job.skills_required === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(job.skills_required);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // not JSON, fallback to comma separated
        }
        return job.skills_required.split(',').map((s) => s.trim()).filter(Boolean);
      })()
    : [];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-500/60 hover:shadow-md transition-all group relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-brand-700 text-base shrink-0 shadow-xs">
            {job.company_name?.slice(0, 3).toUpperCase() || 'ORG'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                onClick={() => onViewDetails?.(job)}
                className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer"
              >
                {job.title}
              </h3>
              {job.kyb_status === 'VERIFIED' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-brand-700 border border-blue-200">
                  Verified Partner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{job.company_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {job.location} ({job.workplace_type})
              </span>
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-amber-500 transition-colors p-1" title="บันทึกงานนี้">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* SKILLS & SALARY PILLS */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {skillsList.slice(0, 4).map((skill, i) => (
          <span
            key={i}
            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
          >
            {skill}
          </span>
        ))}
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-growth-700 border border-emerald-100 font-semibold">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          <span>ประเภท: {job.job_type}</span>
        </span>

        {hasApplied ? (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-growth-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>ส่งใบสมัครแล้ว (Applied)</span>
          </span>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>สมัครงานทันที (1-Click Apply)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
