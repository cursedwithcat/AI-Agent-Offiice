import React, { useState } from 'react';
import { ShieldCheck, Check, X, Building, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';

interface KYBVerificationQueueProps {
  users: User[];
  onReload: () => void;
}

export const KYBVerificationQueue: React.FC<KYBVerificationQueueProps> = ({
  users,
  onReload,
}) => {
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const pendingCompanies = users.filter((u) => u.role === 'COMPANY');

  const handleKYBAction = async (userId: number, decision: 'VERIFIED' | 'REJECTED') => {
    setProcessingId(userId);
    try {
      await adminApi.updateKYB(userId, decision);
      showToast(
        decision === 'VERIFIED'
          ? 'อนุมัติการตรวจสอบตัวตนบริษัท (KYB Verified) สำเร็จเรียบร้อย!'
          : 'ปฏิเสธเอกสารนิติบุคคลของบริษัทเรียบร้อย',
        decision === 'VERIFIED' ? 'success' : 'info'
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
            คิวตรวจสอบเอกสารนิติบุคคลบริษัท (KYB Verification Queue)
          </h3>
          <p className="text-xs text-slate-400">
            ตรวจสอบเลข 13 หลักและหนังสือรับรองบริษัท เพื่อความปลอดภัยของผู้หางาน
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
          {pendingCompanies.length} องค์กรในระบบ
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
            <tr>
              <th className="p-3">รหัสผู้ใช้</th>
              <th className="p-3">อีเมลนิติบุคคล</th>
              <th className="p-3">บทบาท</th>
              <th className="p-3">สถานะบัญชี</th>
              <th className="p-3">วันที่ลงทะเบียน</th>
              <th className="p-3 text-right">คำสั่งอนุมัติ (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {pendingCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono text-slate-500">#{company.id}</td>
                <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{company.email}</span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-800">
                    {company.role}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      company.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-growth-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {company.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-slate-500">
                  {new Date(company.created_at).toLocaleDateString('th-TH')}
                </td>
                <td className="p-3 text-right space-x-1.5">
                  <button
                    onClick={() => handleKYBAction(company.id, 'VERIFIED')}
                    disabled={processingId === company.id}
                    className="px-3 py-1 rounded-lg bg-growth-600 hover:bg-growth-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    {processingId === company.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'อนุมัติ (Verify)'
                    )}
                  </button>
                  <button
                    onClick={() => handleKYBAction(company.id, 'REJECTED')}
                    disabled={processingId === company.id}
                    className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition-all disabled:opacity-50"
                  >
                    ปฏิเสธ
                  </button>
                </td>
              </tr>
            ))}
            {pendingCompanies.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 text-xs italic">
                  ไม่มีบริษัทที่รอการตรวจสอบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
