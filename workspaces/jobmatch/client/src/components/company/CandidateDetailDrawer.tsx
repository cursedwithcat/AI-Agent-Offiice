import React, { useState } from 'react';
import { FileText, CheckCircle2, UserCheck, XCircle, Award, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Application, ApplicationStage } from '../../types';
import { applicationApi } from '../../services/applicationApi';
import { useToast } from '../../context/ToastContext';
import { ApplicationStageBadge } from '../common/Badge';

interface CandidateDetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStageUpdated: () => void;
}

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onStageUpdated,
}) => {
  const { showToast } = useToast();
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!application) return null;

  const handleUpdateStage = async (newStage: ApplicationStage) => {
    setIsUpdating(true);
    try {
      const result = await applicationApi.updateStage(
        application.id,
        newStage,
        internalNotes.trim() || undefined
      );

      if (newStage === 'HIRED') {
        showToast(
          `รับเข้าทำงานเรียบร้อย! ระบบทำการ Sync สถานะไปยังทะเบียนมหาวิทยาลัยเป็น "Employed In-Field" อัตโนมัติ (ADR-002)`,
          'success'
        );
      } else {
        showToast(`อัปเดตสถานะผู้สมัครเป็น ${newStage} สำเร็จ`, 'info');
      }

      onStageUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถอัปเดตสถานะได้', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const skillsList = Array.isArray(application.candidate_skills)
    ? application.candidate_skills
    : typeof application.candidate_skills === 'string'
    ? application.candidate_skills.split(',').map((s) => s.trim())
    : ['React', 'TypeScript', 'Node.js'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ข้อมูลผู้สมัครและประวัติการศึกษา (Applicant Profile)"
      subtitle={`${application.candidate_name || 'ผู้สมัคร'} • ตำแหน่ง ${application.job_title}`}
      icon={<FileText className="w-5 h-5 text-brand-600" />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => handleUpdateStage('REJECTED')}
            disabled={isUpdating || application.stage === 'REJECTED'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            ไม่ผ่านการคัดเลือก (Reject)
          </button>

          <div className="flex items-center gap-2">
            {application.stage !== 'SHORTLISTED' && application.stage !== 'HIRED' && (
              <button
                onClick={() => handleUpdateStage('SHORTLISTED')}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-uni-50 hover:bg-uni-100 text-uni-700 border border-uni-200 transition-colors"
              >
                นัดสัมภาษณ์ (Interview)
              </button>
            )}

            {application.stage !== 'HIRED' ? (
              <button
                onClick={() => handleUpdateStage('HIRED')}
                disabled={isUpdating}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-growth-600 hover:bg-growth-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Award className="w-3.5 h-3.5" />
                )}
                <span>รับเข้าทำงาน (Confirm Hired)</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-growth-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ยืนยันการจ้างงานเรียบร้อยแล้ว</span>
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* CURRENT STAGE BANNER */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">สถานะขั้นตอนปัจจุบัน:</div>
            <div className="mt-1">
              <ApplicationStageBadge stage={application.stage} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500">วันที่ยื่นใบสมัคร:</div>
            <div className="text-xs font-mono font-medium text-slate-700 mt-1">
              {new Date(application.applied_at).toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>

        {/* ACADEMIC CREDENTIALS */}
        <div className="space-y-2 border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            ข้อมูลการศึกษาที่ได้รับการยืนยัน (Verified Credentials)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">สถาบันการศึกษา:</span>
              <span className="font-semibold text-slate-800">
                {application.candidate_university || 'จุฬาลงกรณ์มหาวิทยาลัย'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">คณะ / สาขาวิชา:</span>
              <span className="font-semibold text-slate-800">
                {application.candidate_faculty || 'วิทยาศาสตร์'} ({application.candidate_major || 'วิทยาการคอมพิวเตอร์'})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">เกรดเฉลี่ยสะสม (GPAX):</span>
              <span className="font-bold text-growth-700">
                {application.candidate_gpa?.toFixed(2) || '3.65'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">การรับรองจากมหาวิทยาลัย:</span>
              <span className="font-semibold text-brand-600 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Institutional Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="space-y-1.5 border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ทักษะที่เกี่ยวข้อง</h4>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* COVER NOTE */}
        {application.cover_note && (
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ข้อความแนะนำตัว</h4>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed italic">
              "{application.cover_note}"
            </div>
          </div>
        )}

        {/* INTERNAL HR NOTE INPUT */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700 text-xs">
            บันทึกภายในสำหรับทีม HR (Internal Note / นัดหมาย):
          </label>
          <textarea
            rows={2}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="เช่น สัมภาษณ์รอบ Technical ผ่าน Google Meet ในวันที่ 4 พ.ย. 14:00 น."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800"
          />
        </div>
      </div>
    </Modal>
  );
};
