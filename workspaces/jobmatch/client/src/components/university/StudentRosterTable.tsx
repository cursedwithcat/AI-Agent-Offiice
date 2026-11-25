import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { StudentEmployabilityRecord } from '../../types';
import { EmployabilityBadge } from '../common/Badge';

interface StudentRosterTableProps {
  students: StudentEmployabilityRecord[];
  onOpenReportModal: () => void;
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  students,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = students.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id?.includes(searchTerm) ||
      s.major?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            ทะเบียนนิสิตและสถานะการทำงาน (Student Roster)
          </h3>
          <p className="text-xs text-slate-400">
            รุ่นปีการศึกษา 2026 • ติดตามผลแบบเรียลไทม์ ({filtered.length} รายการ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อนิสิต หรือเลขทะเบียน..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-uni-500 w-48 shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-uni-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">ทุกสถานะ (All)</option>
            <option value="EMPLOYED_IN_FIELD">ทำงานตรงสาย (In-Field)</option>
            <option value="EMPLOYED_OUT_OF_FIELD">ทำงานต่างสาขา</option>
            <option value="CONTINUING_ED">ศึกษาต่อระดับสูง</option>
            <option value="SEEKING">กำลังหางาน (Seeking)</option>
          </select>

          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-uni-50 hover:bg-uni-100 text-uni-700 border border-uni-200 flex items-center gap-1 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงาน</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
            <tr>
              <th className="p-3">รหัสนิสิต / ชื่อ-สกุล</th>
              <th className="p-3">ภาควิชา / คณะ</th>
              <th className="p-3">เกรดเฉลี่ย</th>
              <th className="p-3">สถานะการทำงาน</th>
              <th className="p-3">สถานที่ทำงาน / บริษัท</th>
              <th className="p-3">ตำแหน่งงาน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-slate-900">{student.full_name || 'นิสิต'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {student.student_id || '6530281921'}
                  </div>
                </td>
                <td className="p-3 text-slate-600">
                  <div>{student.major || 'วิทยาการคอมพิวเตอร์'}</div>
                  <div className="text-[10px] text-slate-400">{student.faculty || 'วิทยาศาสตร์'}</div>
                </td>
                <td className="p-3 font-semibold text-slate-800">
                  {student.gpa ? student.gpa.toFixed(2) : '-'}
                </td>
                <td className="p-3">
                  <EmployabilityBadge status={student.status} />
                </td>
                <td className="p-3">
                  {student.placed_company_name ? (
                    <span className="font-semibold text-slate-800">
                      {student.placed_company_name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">อยู่ระหว่างคัดเลือก</span>
                  )}
                </td>
                <td className="p-3 text-slate-600">
                  {student.placed_job_title || '-'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 text-xs italic">
                  ไม่พบข้อมูลนิสิตที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
