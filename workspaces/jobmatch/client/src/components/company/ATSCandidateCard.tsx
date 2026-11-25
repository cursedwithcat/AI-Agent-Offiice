import React from 'react';
import { FileText, ArrowRight, Award, Check } from 'lucide-react';
import { Application, ApplicationStage } from '../../types';

interface ATSCandidateCardProps {
  application: Application;
  onAdvanceStage: (app: Application) => void;
  onViewDetail: (app: Application) => void;
}

export const ATSCandidateCard: React.FC<ATSCandidateCardProps> = ({
  application,
  onAdvanceStage,
  onViewDetail,
}) => {
  const isHired = application.stage === 'HIRED';

  const skillsList = Array.isArray(application.candidate_skills)
    ? application.candidate_skills
    : typeof application.candidate_skills === 'string'
    ? application.candidate_skills.split(',').map((s) => s.trim())
    : ['React', 'TypeScript'];

  return (
    <div
      className={`p-3.5 rounded-xl border shadow-sm hover:shadow-md transition-all ${
        isHired
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4
            onClick={() => onViewDetail(application)}
            className="text-xs font-bold text-slate-900 hover:text-brand-600 cursor-pointer transition-colors"
          >
            {application.candidate_name || 'ผู้สมัคร'}
          </h4>
          <p className="text-[11px] text-slate-500">
            {application.candidate_faculty || 'วิทยาการคอมพิวเตอร์'} •{' '}
            {application.candidate_university || 'จุฬาฯ'}
          </p>
        </div>
        {application.candidate_gpa && (
          <span className="text-[10px] font-bold text-growth-700 bg-growth-50 border border-growth-200 px-1.5 py-0.5 rounded">
            GPA {application.candidate_gpa.toFixed(2)}
          </span>
        )}
      </div>

      {application.cover_note && (
        <div className="mt-2 text-[11px] text-slate-500 italic line-clamp-1">
          "{application.cover_note}"
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1">
        {skillsList.slice(0, 3).map((skill, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 bg-slate-100 text-[10px] rounded text-slate-600 font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {isHired ? (
        <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-growth-800 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-growth-600" />
            <span>Sync กับมหาวิทยาลัยแล้ว</span>
          </span>
          <button
            onClick={() => onViewDetail(application)}
            className="text-xs text-brand-600 hover:underline font-semibold"
          >
            รายละเอียด
          </button>
        </div>
      ) : (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <button
            onClick={() => onViewDetail(application)}
            className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ดูประวัติ</span>
          </button>
          <button
            onClick={() => onAdvanceStage(application)}
            className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium flex items-center gap-1 transition-all"
          >
            <span>ขยับขั้น</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
