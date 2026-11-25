import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Ban, Loader2 } from 'lucide-react';
import { Job } from '../../types';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';

interface FlaggedJobsTableProps {
  jobs: Job[];
  onReload: () => void;
}

export const FlaggedJobsTable: React.FC<FlaggedJobsTableProps> = ({ jobs, onReload }) => {
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleModerate = async (
    jobId: number,
    status: 'PUBLISHED' | 'SUSPENDED',
    note: string
  ) => {
    setProcessingId(jobId);
    try {
      await adminApi.moderateJob(jobId, status, note);
      showToast(
        status === 'SUSPENDED'
          ? 'สั่งระงับประกาศงานเรียบร้อยแล้ว'
          : 'อนุมัติการเผยแพร่ประกาศงานเรียบร้อยแล้ว',
        status === 'SUSPENDED' ? 'warning' : 'success'
      );
      onReload();
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถดำเนินการได้', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            ระบบกำกับดูแลประกาศงาน (Content Moderation & Flagged Posts)
          </h3>
          <p className="text-xs text-slate-400">
            ตรวจสอบตำแหน่งงานที่เปิดรับ เพื่อป้องกันการหลอกลวงหรือข้อมูลเท็จ
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
          {jobs.length} ประกาศงาน
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
            <tr>
              <th className="p-3">รหัส</th>
              <th className="p-3">ชื่อตำแหน่งงาน</th>
              <th className="p-3">บริษัทผู้ลงประกาศ</th>
              <th className="p-3">ประเภท / สถานที่</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">ดำเนินการกำกับดูแล</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono text-slate-400">#{job.id}</td>
                <td className="p-3 font-bold text-slate-900">{job.title}</td>
                <td className="p-3 text-slate-700">{job.company_name || 'SCG Digital Ventures'}</td>
                <td className="p-3 text-slate-500">
                  {job.job_type} • {job.location}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-growth-800'
                        : job.status === 'SUSPENDED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1.5">
                  {job.status === 'SUSPENDED' ? (
                    <button
                      onClick={() => handleModerate(job.id, 'PUBLISHED', 'Admin re-activated post')}
                      disabled={processingId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                    >
                      {processingId === job.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'คืนสถานะ (Restore)'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(job.id, 'SUSPENDED', 'Admin moderation audit')}
                      disabled={processingId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                    >
                      {processingId === job.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'สั่งระงับ (Suspend)'
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
