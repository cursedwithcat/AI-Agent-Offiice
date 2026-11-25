import React from 'react';
import { Activity, ShieldCheck, Download, Calendar, Upload } from 'lucide-react';
import { Application, ApplicationStage } from '../../types';
import { ApplicationStageBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface ApplicationStepperProps {
  applications: Application[];
  onOpenResumeUpload: () => void;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({
  applications,
  onOpenResumeUpload,
}) => {
  const { profile } = useAuth();

  const getStepStatus = (currentStage: ApplicationStage, stepIndex: number) => {
    const stageOrder: Record<ApplicationStage, number> = {
      APPLIED: 1,
      UNDER_REVIEW: 2,
      SHORTLISTED: 3,
      OFFERED: 4,
      HIRED: 4,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    const currentOrder = stageOrder[currentStage] || 1;

    if (currentStage === 'REJECTED') {
      return stepIndex === 1 ? 'completed' : 'rejected';
    }

    if (currentOrder > stepIndex) return 'completed';
    if (currentOrder === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-growth-600" />
          <span>ติดตามสถานะใบสมัครของฉัน (My Applications)</span>
        </h2>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700">
          {applications.length} รายการ
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <p className="text-xs">ยังไม่มีประวัติการยื่นใบสมัคร</p>
          <p className="text-[11px] text-slate-400">เลือกตำแหน่งงานที่สนใจและกด 1-Click Apply ได้เลย!</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => {
            const step1 = getStepStatus(app.stage, 1);
            const step2 = getStepStatus(app.stage, 2);
            const step3 = getStepStatus(app.stage, 3);
            const step4 = getStepStatus(app.stage, 4);

            return (
              <div
                key={app.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{app.job_title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {app.company_name} • ยื่นเมื่อ {new Date(app.applied_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <ApplicationStageBadge stage={app.stage} />
                </div>

                {/* PROGRESSION STEPPER */}
                <div className="relative flex items-center justify-between pt-1 text-[10px] font-medium text-slate-500">
                  {/* Step 1: Applied */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-5 h-5 rounded-full bg-growth-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                    <span className="mt-1 text-growth-700 font-semibold">ยื่นแล้ว</span>
                  </div>
                  <div
                    className={`flex-1 h-0.5 -mt-3 ${
                      step2 === 'completed' || step2 === 'current' ? 'bg-growth-500' : 'bg-slate-200'
                    }`}
                  />

                  {/* Step 2: Under Review */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        step2 === 'completed'
                          ? 'bg-growth-600 text-white'
                          : step2 === 'current'
                          ? 'bg-brand-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step2 === 'completed' ? '✓' : '2'}
                    </div>
                    <span
                      className={`mt-1 ${
                        step2 === 'completed'
                          ? 'text-growth-700 font-semibold'
                          : step2 === 'current'
                          ? 'text-brand-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      HR ตรวจ
                    </span>
                  </div>
                  <div
                    className={`flex-1 h-0.5 -mt-3 ${
                      step3 === 'completed' || step3 === 'current' ? 'bg-growth-500' : 'bg-slate-200'
                    }`}
                  />

                  {/* Step 3: Interview */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        step3 === 'completed'
                          ? 'bg-growth-600 text-white'
                          : step3 === 'current'
                          ? 'bg-uni-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step3 === 'completed' ? '✓' : '3'}
                    </div>
                    <span
                      className={`mt-1 ${
                        step3 === 'completed'
                          ? 'text-growth-700 font-semibold'
                          : step3 === 'current'
                          ? 'text-uni-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      สัมภาษณ์
                    </span>
                  </div>
                  <div
                    className={`flex-1 h-0.5 -mt-3 ${
                      step4 === 'completed' || step4 === 'current' ? 'bg-growth-500' : 'bg-slate-200'
                    }`}
                  />

                  {/* Step 4: Offer / Hired */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        step4 === 'completed' || step4 === 'current'
                          ? 'bg-growth-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step4 === 'completed' || step4 === 'current' ? '✓' : '4'}
                    </div>
                    <span
                      className={`mt-1 ${
                        step4 === 'completed' || step4 === 'current'
                          ? 'text-growth-700 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      จ้างงาน
                    </span>
                  </div>
                </div>

                {/* STATUS NOTE */}
                {app.stage === 'SHORTLISTED' && (
                  <div className="bg-blue-50/70 p-2.5 rounded-lg text-[11px] text-brand-900 flex items-start gap-2 border border-blue-100">
                    <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>HR แจ้งนัดสัมภาษณ์:</strong> {app.internal_notes || 'สัมภาษณ์ Technical ผ่าน Google Meet'}
                    </div>
                  </div>
                )}

                {app.stage === 'HIRED' && (
                  <div className="bg-emerald-50 p-2.5 rounded-lg text-[11px] text-growth-900 flex items-start gap-2 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-growth-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>ยินดีด้วย! คุณได้รับการตอบรับเข้าทำงาน:</strong> ระบบทำการ Sync ข้อมูลการจ้างงานไปยังทะเบียนมหาวิทยาลัยเรียบร้อยแล้ว
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RESUME & UNIVERSITY VERIFICATION BADGE CARD */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-brand-950 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5 text-growth-300">
            <ShieldCheck className="w-4 h-4 text-growth-400" />
            <span>{profile?.university_name || 'Chulalongkorn University'} Verified</span>
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
            {profile?.major || 'B.Sc. Computer Science'}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          เกรดเฉลี่ย (GPA {profile?.gpa || '3.65'}) และสถานะนิสิตผ่านการรับรองตรงจากสำนักทะเบียนมหาวิทยาลัย ไม่ต้องแนบเอกสารรับรองซ้ำซ้อน
        </p>
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
            {profile?.resume_url?.split('/').pop() || 'Resume_Somchai_2026.pdf'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenResumeUpload}
              className="text-xs text-brand-300 hover:text-white underline flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>อัปเดตเรซูเม่</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
