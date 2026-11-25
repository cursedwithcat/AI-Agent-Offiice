import React, { useState } from 'react';
import { Send, FileCheck2, Check, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../services/applicationApi';
import { useToast } from '../../context/ToastContext';

interface OneClickApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OneClickApplyModal: React.FC<OneClickApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await applicationApi.apply({
        jobId: job.id,
        coverNote: coverNote.trim() || undefined,
        resumeUrl: profile?.resume_url || '/uploads/resumes/Resume_Somchai_2026.pdf',
      });
      showToast('ส่งใบสมัครสำเร็จ! อัปเดตเข้าระบบและเริ่มติดตามสถานะได้ทันที', 'success');
      setCoverNote('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถส่งใบสมัครได้', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const universityBadge = profile?.university_name
    ? `${profile.university_name.includes('จุฬา') ? 'CU' : 'Uni'} Verified`
    : 'CU Verified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ยืนยันการยื่นใบสมัคร (1-Click Application)"
      subtitle={`${job.title} @ ${job.company_name}`}
      icon={<Send className="w-5 h-5 text-growth-600" />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-growth-600 hover:bg-growth-500 text-white shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>ยืนยันการส่งใบสมัคร</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* ATTACHED RESUME & VERIFICATION BADGE */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span>เอกสารเรซูเม่และข้อมูลที่จะส่งมอบ:</span>
            <span className="text-[10px] text-growth-700 bg-growth-50 border border-growth-200 px-2 py-0.5 rounded font-mono">
              {universityBadge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <FileCheck2 className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="font-medium">
              {profile?.full_name || 'นายสมชาย มั่นคง'} (
              {profile?.faculty || 'คณะวิทยาศาสตร์'} {profile?.university_name || 'จุฬาลงกรณ์มหาวิทยาลัย'}
              {profile?.gpa ? ` • เกรดเฉลี่ย ${profile.gpa}` : ''})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            * สอดคล้องตามข้อกำหนด PDPA: ข้อมูลการศึกษาและผลการเรียนจะถูกเปิดเผยต่อบริษัท {job.company_name} เพื่อการพิจารณาคัดเลือกเท่านั้น
          </p>
        </div>

        {/* OPTIONAL COVER NOTE */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            ข้อความแนะนำตัวเพิ่มเติม (Cover Note - ตัวเลือกเสริม):
          </label>
          <textarea
            rows={3}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="ระบุเหตุผลที่คุณสนใจตำแหน่งนี้ หรือแนะนำผลงานเด่นของคุณ..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800"
          />
        </div>
      </div>
    </Modal>
  );
};
