import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Activity,
  PlusCircle,
  FileSpreadsheet,
  UserPlus,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Job, Application, StudentEmployabilityRecord, UniversityAnalytics, AdminStats, AuditLog, User } from '../types';

// API Services
import { jobApi, JobFilterParams } from '../services/jobApi';
import { applicationApi } from '../services/applicationApi';
import { universityApi } from '../services/universityApi';
import { adminApi } from '../services/adminApi';

// Components
import { JobCard } from '../components/seeker/JobCard';
import { JobSearchFilters } from '../components/seeker/JobSearchFilters';
import { OneClickApplyModal } from '../components/seeker/OneClickApplyModal';
import { ApplicationStepper } from '../components/seeker/ApplicationStepper';
import { ResumeUploadModal } from '../components/seeker/ResumeUploadModal';

import { ATSKanbanBoard } from '../components/company/ATSKanbanBoard';
import { JobRequisitionModal } from '../components/company/JobRequisitionModal';
import { CandidateDetailDrawer } from '../components/company/CandidateDetailDrawer';

import { KPICard } from '../components/university/KPICard';
import { PlacementBreakdownChart } from '../components/university/PlacementBreakdownChart';
import { StudentRosterTable } from '../components/university/StudentRosterTable';
import { MHESIReportModal } from '../components/university/MHESIReportModal';

import { KYBVerificationQueue } from '../components/admin/KYBVerificationQueue';
import { FlaggedJobsTable } from '../components/admin/FlaggedJobsTable';
import { AuditLogsTable } from '../components/admin/AuditLogsTable';

import { DesignTokensView } from '../components/tokens/DesignTokensView';
import { JobCardSkeleton } from '../components/common/Skeleton';

export const HomePage: React.FC = () => {
  const { activeRole, user, profile } = useAuth();
  const { showToast } = useToast();

  // Seeker State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<JobFilterParams>({
    keyword: '',
    location: 'ALL',
    type: 'ALL',
  });

  // Company State
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [selectedCompanyJobId, setSelectedCompanyJobId] = useState<number | null>(null);
  const [atsApplications, setAtsApplications] = useState<Application[]>([]);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Application | null>(null);
  const [isCandidateDrawerOpen, setIsCandidateDrawerOpen] = useState(false);

  // University State
  const [universityAnalytics, setUniversityAnalytics] = useState<UniversityAnalytics | null>(null);
  const [universityStudents, setUniversityStudents] = useState<StudentEmployabilityRecord[]>([]);
  const [isMhesiModalOpen, setIsMhesiModalOpen] = useState(false);

  // Admin State
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminJobs, setAdminJobs] = useState<Job[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AuditLog[]>([]);

  // 1. Fetch Seeker Data
  const loadSeekerData = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const jobRes = await jobApi.getJobs(searchFilter);
      setJobs(Array.isArray(jobRes?.jobs) ? jobRes.jobs : []);

      if (user) {
        try {
          const appRes = await applicationApi.getMyApplications();
          setApplications(Array.isArray(appRes) ? appRes : []);
        } catch {
          // Unauthenticated or different role
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดข้อมูลประกาศงานได้', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [searchFilter, user, showToast]);

  // 2. Fetch Company Data
  const loadCompanyData = useCallback(async () => {
    try {
      const myJobs = await jobApi.getMyCompanyJobs();
      const safeJobs = Array.isArray(myJobs) ? myJobs : [];
      setCompanyJobs(safeJobs);

      const targetJobId = selectedCompanyJobId || safeJobs[0]?.id;
      if (targetJobId) {
        setSelectedCompanyJobId(targetJobId);
        const apps = await applicationApi.getJobApplications(targetJobId);
        setAtsApplications(Array.isArray(apps) ? apps : []);
      } else {
        setAtsApplications([]);
      }
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดข้อมูลผู้สมัคร ATS ได้', 'error');
    }
  }, [selectedCompanyJobId, showToast]);

  // 3. Fetch University Data
  const loadUniversityData = useCallback(async () => {
    try {
      const [analytics, studentsRes] = await Promise.all([
        universityApi.getAnalytics(),
        universityApi.getStudents(),
      ]);
      setUniversityAnalytics(analytics);
      setUniversityStudents(Array.isArray(studentsRes?.students) ? studentsRes.students : []);
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดข้อมูลสถิติมหาวิทยาลัยได้', 'error');
    }
  }, [showToast]);

  // 4. Fetch Admin Data
  const loadAdminData = useCallback(async () => {
    try {
      const [stats, users, allJobs, logs] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getJobs(),
        adminApi.getAuditLogs(50),
      ]);
      setAdminStats(stats);
      setAdminUsers(Array.isArray(users) ? users : []);
      setAdminJobs(Array.isArray(allJobs) ? allJobs : []);
      setAdminAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดข้อมูลแอดมินได้', 'error');
    }
  }, [showToast]);

  // Load data according to active role tab
  useEffect(() => {
    if (activeRole === 'SEEKER') {
      loadSeekerData();
    } else if (activeRole === 'COMPANY') {
      loadCompanyData();
    } else if (activeRole === 'UNIVERSITY') {
      loadUniversityData();
    } else if (activeRole === 'ADMIN') {
      loadAdminData();
    }
  }, [activeRole, loadSeekerData, loadCompanyData, loadUniversityData, loadAdminData]);

  // Handle Seeker Apply click
  const handleOpenApply = (job: Job) => {
    setSelectedJobToApply(job);
    setIsApplyModalOpen(true);
  };

  // Handle ATS Requisition change
  const handleSelectCompanyJob = async (jobId: number) => {
    setSelectedCompanyJobId(jobId);
    try {
      const apps = await applicationApi.getJobApplications(jobId);
      setAtsApplications(apps);
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดข้อมูลผู้สมัครได้', 'error');
    }
  };

  // Handle ATS Stage Advance Quick Action
  const handleAdvanceStage = async (app: Application) => {
    const nextStageMap: Record<string, any> = {
      APPLIED: 'UNDER_REVIEW',
      UNDER_REVIEW: 'SHORTLISTED',
      SHORTLISTED: 'HIRED',
    };
    const nextStage = nextStageMap[app.stage];
    if (!nextStage) return;

    try {
      await applicationApi.updateStage(app.id, nextStage);
      if (nextStage === 'HIRED') {
        showToast(
          `รับเข้าทำงานเรียบร้อย! ข้อมูลเชื่อมโยงสู่ทะเบียนมหาวิทยาลัยอัตโนมัติ (ADR-002 Atomic Sync)`,
          'success'
        );
      } else {
        showToast(`ขยับขั้นผู้สมัคร ${app.candidate_name || ''} เป็น ${nextStage} สำเร็จ`, 'info');
      }
      loadCompanyData();
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถขยับขั้นได้', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* VIEW 1: SEEKER PORTAL (MOBILE-FIRST DISCOVERY & TRACKER)  */}
      {/* ========================================================= */}
      {activeRole === 'SEEKER' && (
        <section className="space-y-6 animate-in fade-in duration-300">
          {/* HERO BANNER */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-growth-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-growth-300 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-growth-400 animate-pulse" />
                  Verified Talent Ecosystem for Chulalongkorn & Thai Universities
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ค้นพบโอกาสงานที่ใช่ และติดตามผลสมัครงานได้แบบโปร่งใส 100%
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed">
                  เชื่อมต่อประวัตินิสิตที่ได้รับการยืนยันวุฒิการศึกษาโดยตรงสู่บริษัทชั้นนำ ยื่นใบสมัครเพียงคลิกเดียว (1-Click Apply) พร้อมอัปเดตสถานะแบบเรียลไทม์
                </p>
              </div>

              {/* PROFILE COMPLETION WIDGET */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl min-w-[260px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-200">ความสมบูรณ์ของโปรไฟล์</span>
                  <span className="font-bold text-growth-400">85% Complete</span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-growth-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: '85%' }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-growth-400" />
                  <span>
                    {profile?.university_name || 'จุฬาลงกรณ์มหาวิทยาลัย'} • ผ่านการรับรองวุฒิแล้ว
                  </span>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <JobSearchFilters
              keyword={searchFilter.keyword || ''}
              location={searchFilter.location || 'ALL'}
              jobType={searchFilter.type || 'ALL'}
              onKeywordChange={(keyword) => setSearchFilter((prev) => ({ ...prev, keyword }))}
              onLocationChange={(location) => setSearchFilter((prev) => ({ ...prev, location }))}
              onJobTypeChange={(type) => setSearchFilter((prev) => ({ ...prev, type }))}
              onSearch={loadSeekerData}
            />
          </div>

          {/* DUAL COLUMN: JOBS FEED (LEFT) + APPLICATION TIMELINE (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: JOB LISTINGS CATALOG */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>ตำแหน่งงานแนะนำสำหรับคุณ (Recommended Positions)</span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  พบ {jobs.length} ตำแหน่งเปิดรับ
                </span>
              </div>

              {isLoadingJobs ? (
                <div className="space-y-3">
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-dashed border-slate-300 text-center space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800">ไม่พบตำแหน่งงานตามเงื่อนไข</h4>
                  <p className="text-xs text-slate-400">
                    ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานที่และประเภทงานใหม่
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const hasApplied = Array.isArray(applications) && applications.some((a) => a.job_id === job.id);
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        hasApplied={hasApplied}
                        onApply={handleOpenApply}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: APPLICATION TRACKING TIMELINE */}
            <div className="lg:col-span-5 space-y-4">
              <ApplicationStepper
                applications={applications}
                onOpenResumeUpload={() => setIsResumeModalOpen(true)}
              />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: COMPANY WORKSPACE (ATS KANBAN & REQUISITIONS)     */}
      {/* ========================================================= */}
      {activeRole === 'COMPANY' && (
        <section className="space-y-6 animate-in fade-in duration-300">
          {/* COMPANY HEADER */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center font-extrabold text-2xl text-brand-700 shadow-xs">
                {profile?.company_name?.slice(0, 3).toUpperCase() || 'SCG'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    {profile?.company_name || 'SCG Digital Ventures'} (ATS Portal)
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-growth-700 border border-emerald-200">
                    Corporate Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  กำลังจัดการ {companyJobs.length} ตำแหน่งงาน • ผู้สมัครรวม {atsApplications.length} คน • อัตราการคัดเลือกเฉลี่ย 4.2 วัน
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateJobOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างประกาศรับสมัครงานใหม่</span>
            </button>
          </div>

          {/* KANBAN BOARD & TABLE VIEW */}
          <ATSKanbanBoard
            jobs={companyJobs}
            selectedJobId={selectedCompanyJobId}
            onSelectJob={handleSelectCompanyJob}
            applications={atsApplications}
            onAdvanceStage={handleAdvanceStage}
            onViewCandidate={(app) => {
              setSelectedCandidateDetail(app);
              setIsCandidateDrawerOpen(true);
            }}
            onOpenCreateJob={() => setIsCreateJobOpen(true)}
          />
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: UNIVERSITY WORKSPACE (MHESI ANALYTICS & ROSTER)   */}
      {/* ========================================================= */}
      {activeRole === 'UNIVERSITY' && (
        <section className="space-y-6 animate-in fade-in duration-300">
          {/* UNIVERSITY HEADER */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-uni-50 border border-uni-200 flex items-center justify-center font-extrabold text-2xl text-uni-700 shadow-xs">
                CU
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    {profile?.university_name || 'Chulalongkorn University'} Career Center
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-uni-100 text-uni-800 border border-uni-200">
                    Institutional Partner
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ระบบวิเคราะห์อัตราการมีงานทำของบัณฑิต (Graduate Employability Analytics) • ประจำปีการศึกษา 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMhesiModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-growth-600" />
                <span>ส่งออกรายงาน สกอ. (MHESI Report)</span>
              </button>
            </div>
          </div>

          {/* 4 KPI METRIC CARDS */}
          <KPICard analytics={universityAnalytics} />

          {/* CHARTS & STUDENT ROSTER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <PlacementBreakdownChart analytics={universityAnalytics} />
            </div>
            <div className="lg:col-span-7">
              <StudentRosterTable
                students={universityStudents}
                onOpenReportModal={() => setIsMhesiModalOpen(true)}
              />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: ADMIN COMMAND CENTER (GOVERNANCE & AUDIT)         */}
      {/* ========================================================= */}
      {activeRole === 'ADMIN' && (
        <section className="space-y-6 animate-in fade-in duration-300">
          {/* ADMIN HEADER */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-admin-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-inner">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Platform Governance Command Center</h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-admin-600/30 text-amber-300 border border-admin-600/50">
                    Root Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  กำกับดูแลความปลอดภัย, ตรวจสอบตัวตนบริษัท (KYB), และจัดการเนื้อหาประกาศรับสมัครงาน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Thai PDPA & RBAC Active
              </span>
              <button
                onClick={loadAdminData}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AUDIT STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">บริษัทในระบบ (Total Companies)</div>
              <div className="text-xl font-bold text-amber-600 mt-1 flex items-center justify-between">
                <span>{adminStats?.users.companies || 3} บริษัท</span>
                <span className="text-xs font-semibold text-brand-600">KYB Controlled</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">ประกาศงานในระบบ (Job Requisitions)</div>
              <div className="text-xl font-bold text-slate-900 mt-1 flex items-center justify-between">
                <span>{adminStats?.jobs.total || adminJobs.length} รายการ</span>
                <span className="text-xs font-semibold text-growth-600">
                  {adminStats?.jobs.published || adminJobs.length} Published
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">การจ้างงานสำเร็จ (Total Hires)</div>
              <div className="text-xl font-bold text-growth-600 mt-1 flex items-center justify-between">
                <span>{adminStats?.applications.hired || 4} บัณฑิต</span>
                <span className="text-xs text-growth-600 font-medium">Sync 100%</span>
              </div>
            </div>
          </div>

          {/* KYB VERIFICATION QUEUE */}
          <KYBVerificationQueue users={adminUsers} onReload={loadAdminData} />

          {/* CONTENT MODERATION TABLE */}
          <FlaggedJobsTable jobs={adminJobs} onReload={loadAdminData} />

          {/* SECURITY AUDIT TRAIL LOG */}
          <AuditLogsTable logs={adminAuditLogs} />
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 5: DESIGN TOKENS & UI STATES (APPROVED DESIGN SPEC)  */}
      {/* ========================================================= */}
      {activeRole === 'TOKENS' && <DesignTokensView />}

      {/* MODALS */}
      <OneClickApplyModal
        job={selectedJobToApply}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          loadSeekerData();
        }}
      />

      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onSuccess={() => {
          loadSeekerData();
        }}
      />

      <JobRequisitionModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onSuccess={() => {
          loadCompanyData();
        }}
      />

      <CandidateDetailDrawer
        application={selectedCandidateDetail}
        isOpen={isCandidateDrawerOpen}
        onClose={() => setIsCandidateDrawerOpen(false)}
        onStageUpdated={() => {
          loadCompanyData();
        }}
      />

      <MHESIReportModal
        isOpen={isMhesiModalOpen}
        onClose={() => setIsMhesiModalOpen(false)}
      />
    </div>
  );
};
