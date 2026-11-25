'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, FileText, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    companyName: string;
  };
  defaultResumeUrl?: string;
  onSuccess?: () => void;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  job,
  defaultResumeUrl = '',
  onSuccess,
}: Props) {
  const router = useRouter();
  const [expectedSalary, setExpectedSalary] = useState('');
  const [resumeUrl, setResumeUrl] = useState(defaultResumeUrl || 'https://example.com/my-resume.pdf');
  const [coverLetter, setCoverLetter] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [availableUnis, setAvailableUnis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => {
        if (data.universities) setAvailableUnis(data.universities);
      })
      .catch((err) => console.error('Error fetching universities:', err));

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.jobSeekerProfile?.university) {
          setUniversityName(
            data.user.jobSeekerProfile.university.universityProfile?.universityName ||
              data.user.jobSeekerProfile.university.name ||
              ''
          );
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
          resumeUrl,
          coverLetter,
          universityName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">สมัครงานตำแหน่งนี้</h3>
            <p className="text-xs text-blue-100 truncate max-w-sm mt-0.5">
              {job.title} — {job.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">ส่งใบสมัครงานเรียบร้อยแล้ว!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                ระบบได้ส่งใบสมัครของคุณไปยังบริษัทเรียบร้อย คุณสามารถติดตามความคืบหน้าได้ในแดชบอร์ด
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  router.push('/dashboard/seeker');
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
              >
                ดูสถานะในแดชบอร์ด
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มหาวิทยาลัย / สถาบันการศึกษา (ถ้าเป็นนักศึกษา)
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="app-modal-universities"
                  placeholder="เช่น มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <datalist id="app-modal-universities">
                {availableUnis.map((u: any) => (
                  <option key={u.id} value={u.name}>
                    {u.campus ? `${u.name} (${u.campus})` : u.name}
                  </option>
                ))}
              </datalist>
              <p className="text-[11px] text-slate-400 mt-1">
                * ระบุชื่อสถาบันเพื่อเชื่อมโยงประวัติการสมัครงานไปยังระบบของมหาวิทยาลัยโดยอัตโนมัติ
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เงินเดือนที่คาดหวัง (บาท/เดือน)
              </label>
              <input
                type="number"
                placeholder="เช่น 35000"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์เรซูเม / CV / Portfolio (URL) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... หรือ ลิงก์เรซูเม"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จดหมายแนะนำตัว (Cover Letter / แนะนำทักษะของคุณสั้นๆ)
              </label>
              <textarea
                rows={4}
                placeholder="แนะนำจุดเด่น ประสบการณ์ และเหตุผลที่สนใจร่วมงานกับบริษัทนี้..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'กำลังส่งใบสมัคร...' : 'ยืนยันการส่งใบสมัคร'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
