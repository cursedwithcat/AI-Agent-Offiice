import React, { useState } from 'react';
import {
  Columns3,
  Table as TableIcon,
  PlusCircle,
  Filter,
  Download,
  Award,
} from 'lucide-react';
import { Application, Job } from '../../types';
import { ATSCandidateCard } from './ATSCandidateCard';
import { ApplicationStageBadge } from '../common/Badge';

interface ATSKanbanBoardProps {
  jobs: Job[];
  selectedJobId: number | null;
  onSelectJob: (jobId: number) => void;
  applications: Application[];
  onAdvanceStage: (app: Application) => void;
  onViewCandidate: (app: Application) => void;
  onOpenCreateJob: () => void;
}

export const ATSKanbanBoard: React.FC<ATSKanbanBoardProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  applications,
  onAdvanceStage,
  onViewCandidate,
  onOpenCreateJob,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [universityFilter, setUniversityFilter] = useState('ALL');

  const filteredApplications = applications.filter((app) => {
    if (universityFilter === 'ALL') return true;
    return app.candidate_university?.includes(universityFilter);
  });

  const appliedList = filteredApplications.filter((a) => a.stage === 'APPLIED');
  const reviewList = filteredApplications.filter((a) => a.stage === 'UNDER_REVIEW');
  const interviewList = filteredApplications.filter((a) => a.stage === 'SHORTLISTED');
  const hiredList = filteredApplications.filter((a) => a.stage === 'HIRED' || a.stage === 'OFFERED');

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleExportCSV = () => {
    const headers = 'ID,Candidate,University,GPA,Stage,AppliedAt\n';
    const rows = filteredApplications
      .map(
        (a) =>
          `"${a.id}","${a.candidate_name || ''}","${a.candidate_university || ''}","${
            a.candidate_gpa || ''
          }","${a.stage}","${a.applied_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Jobmatch_Candidates_${selectedJob?.title || 'ATS'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* ACTIVE REQUISITION SELECTOR BAR */}
      <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700">ตำแหน่งที่เลือก:</span>
          <select
            value={selectedJobId || ''}
            onChange={(e) => onSelectJob(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 shadow-sm outline-none cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.applicant_count || applications.length} ผู้สมัคร)
              </option>
            ))}
          </select>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-growth-800 font-bold text-[11px] border border-emerald-200">
            สถานะ: {selectedJob?.status || 'PUBLISHED'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>กรองสถาบัน:</span>
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs cursor-pointer"
            >
              <option value="ALL">ทุกมหาวิทยาลัย (All)</option>
              <option value="จุฬา">จุฬาลงกรณ์มหาวิทยาลัย</option>
              <option value="เกษตร">มหาวิทยาลัยเกษตรศาสตร์</option>
              <option value="ลาดกระบัง">สจล. (KMITL)</option>
              <option value="มหิดล">มหาวิทยาลัยมหิดล</option>
              <option value="ธรรมศาสตร์">มหาวิทยาลัยธรรมศาสตร์</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* COLUMN 1: APPLIED */}
          <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 flex flex-col space-y-3 min-h-[350px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-bold text-slate-800">ยื่นสมัครใหม่ (Applied)</h3>
              </div>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs border border-slate-200">
                {appliedList.length}
              </span>
            </div>
            <div className="space-y-2.5 flex-1">
              {appliedList.map((app) => (
                <ATSCandidateCard
                  key={app.id}
                  application={app}
                  onAdvanceStage={onAdvanceStage}
                  onViewDetail={onViewCandidate}
                />
              ))}
              {appliedList.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  ไม่มีผู้สมัครใหม่ในขั้นตอนนี้
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: REVIEWING */}
          <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 flex flex-col space-y-3 min-h-[350px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-xs font-bold text-slate-800">กำลังคัดกรอง (Reviewing)</h3>
              </div>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs border border-slate-200">
                {reviewList.length}
              </span>
            </div>
            <div className="space-y-2.5 flex-1">
              {reviewList.map((app) => (
                <ATSCandidateCard
                  key={app.id}
                  application={app}
                  onAdvanceStage={onAdvanceStage}
                  onViewDetail={onViewCandidate}
                />
              ))}
              {reviewList.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  ยังไม่มีผู้สมัครที่กำลังคัดกรอง
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: INTERVIEW */}
          <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 flex flex-col space-y-3 min-h-[350px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-uni-500"></span>
                <h3 className="text-xs font-bold text-slate-800">นัดสัมภาษณ์ (Interview)</h3>
              </div>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs border border-slate-200">
                {interviewList.length}
              </span>
            </div>
            <div className="space-y-2.5 flex-1">
              {interviewList.map((app) => (
                <ATSCandidateCard
                  key={app.id}
                  application={app}
                  onAdvanceStage={onAdvanceStage}
                  onViewDetail={onViewCandidate}
                />
              ))}
              {interviewList.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  ยังไม่มีผู้สมัครในรอบสัมภาษณ์
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 4: HIRED */}
          <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 flex flex-col space-y-3 min-h-[350px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-growth-500"></span>
                <h3 className="text-xs font-bold text-slate-800">รับเข้าทำงาน (Hired)</h3>
              </div>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full text-growth-700 shadow-xs border border-slate-200">
                {hiredList.length}
              </span>
            </div>
            <div className="space-y-2.5 flex-1">
              {hiredList.map((app) => (
                <ATSCandidateCard
                  key={app.id}
                  application={app}
                  onAdvanceStage={onAdvanceStage}
                  onViewDetail={onViewCandidate}
                />
              ))}
              {hiredList.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  ยังไม่มีผู้สมัครที่ยืนยันการจ้าง
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* HIGH DENSITY TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-700">
              รายชื่อผู้สมัครทั้งหมดแบบตาราง (High-Density Candidate Roster) • {filteredApplications.length} คน
            </span>
            <button
              onClick={handleExportCSV}
              className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Candidate CSV</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">ชื่อ-นามสกุล</th>
                  <th className="p-3">มหาวิทยาลัย / คณะ</th>
                  <th className="p-3">เกรดเฉลี่ย</th>
                  <th className="p-3">วันที่สมัคร</th>
                  <th className="p-3">สถานะปัจจุบัน</th>
                  <th className="p-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {app.candidate_name || 'ผู้สมัคร'}
                    </td>
                    <td className="p-3 text-slate-600">
                      {app.candidate_university} ({app.candidate_faculty})
                    </td>
                    <td className="p-3 font-bold text-growth-700">
                      {app.candidate_gpa?.toFixed(2) || '-'}
                    </td>
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(app.applied_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-3">
                      <ApplicationStageBadge stage={app.stage} />
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onViewCandidate(app)}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        ดูประวัติ
                      </button>
                      <button
                        onClick={() => onAdvanceStage(app)}
                        className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[11px]"
                      >
                        ขยับขั้น ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
