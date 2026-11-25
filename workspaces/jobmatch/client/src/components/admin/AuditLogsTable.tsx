import React from 'react';
import { Shield, Clock } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsTableProps {
  logs: AuditLog[];
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ logs }) => {
  const formatPayload = (details: any): string => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    try {
      return JSON.stringify(details);
    } catch {
      return String(details);
    }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <span>บันทึกความปลอดภัยและข้อกำหนด PDPA (Security & Audit Trail)</span>
          </h3>
          <p className="text-xs text-slate-400">
            ระบบบันทึกธุรกรรมความปลอดภัยและประวัติการเปลี่ยนแปลงข้อมูลสำคัญอย่างถาวร
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {logs.length} Audit Events
        </span>
      </div>

      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold sticky top-0">
            <tr>
              <th className="p-3">เวลา (Timestamp)</th>
              <th className="p-3">บทบาทผู้กระทำ (Actor)</th>
              <th className="p-3">การกระทำ (Action)</th>
              <th className="p-3">ประเภทเป้าหมาย</th>
              <th className="p-3">รายละเอียด (Payload)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(log.created_at).toLocaleString('th-TH')}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 font-bold text-[10px]">
                    {log.actor_role} #{log.actor_id}
                  </span>
                </td>
                <td className="p-3 font-semibold text-brand-700">
                  {log.action}
                </td>
                <td className="p-3 text-slate-600">
                  {log.target_type} #{log.target_id || '-'}
                </td>
                <td className="p-3 text-slate-500 max-w-xs truncate" title={formatPayload(log.details)}>
                  {formatPayload(log.details)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400 text-xs italic">
                  ไม่มีบันทึกกิจกรรมล่าสุด
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
