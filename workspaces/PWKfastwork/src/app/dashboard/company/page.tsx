'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Users,
  PlusCircle,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  GraduationCap,
} from 'lucide-react';
import {
  formatSalary,
  formatThaiDate,
  formatThaiDateTime,
  APPLICATION_STATUS_MAP,
} from '@/lib/utils';

export default function CompanyDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab: 'JOBS' or 'APPLICANTS'
  const [activeTab, setActiveTab] = useState<'JOBS' | 'APPLICANTS'>('JOBS');

  // Job creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    category: 'Web & Programming',
    jobType: 'Full-time',
    location: 'กรุงเทพฯ',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'MONTHLY',
    description: '',
    requirements: '',
    benefits: '',
    urgent: false,
    featured: false,
  });

  // Application Status Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [appNotes, setAppNotes] = useState('');

  // Filtering applicants
  const [filterJobId, setFilterJobId] = useState('ALL');
  const [filterAppStatus, setFilterAppStatus] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user) {
        router.push('/login');
        return;
      }

      if (userData.user.role !== 'COMPANY' && userData.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setCurrentUser(userData.user);

      // Fetch company's posted jobs
      const jobsRes = await fetch(`/api/jobs?companyId=${userData.user.id}&status=ALL`);
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      // Fetch applications to company's jobs
      const appRes = await fetch('/api/applications');
      const appData = await appRes.json();
      setApplications(appData.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการลงประกาศงาน');

      setIsCreateModalOpen(false);
      setNewJob({
        title: '',
        category: 'Web & Programming',
        jobType: 'Full-time',
        location: 'กรุงเทพฯ',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'MONTHLY',
        description: '',
        requirements: '',
        benefits: '',
        urgent: false,
        featured: false,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่งงานนี้?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openStatusModal = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setInterviewDate(app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : '');
    setAppNotes(app.notes || '');
  };

  const handleUpdateAppStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          interviewDate: interviewDate ? new Date(interviewDate).toISOString() : null,
          notes: appNotes,
        }),
      });

      if (res.ok) {
        setSelectedApp(null);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredApplicants = applications.filter((app) => {
    if (filterJobId !== 'ALL' && app.jobId !== filterJobId) return false;
    if (filterAppStatus !== 'ALL' && app.status !== filterAppStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดแดชบอร์ดบริษัท...</p>
      </div>
    );
  }

  const companyProfile = currentUser?.companyProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}`}
            alt={currentUser?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser?.name}</h1>
              <span className="text-[11px] font-bold bg-emerald-500/30 border border-emerald-400 text-emerald-100 px-2.5 py-0.5 rounded-full">
                บริษัท / นายจ้าง
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100">
              {companyProfile?.industry || 'หมวดหมู่ทั่วไป'} • {companyProfile?.location || 'กรุงเทพมหานคร'}
            </p>
            <p className="text-xs text-teal-200">
              {companyProfile?.description || 'ศูนย์จัดการตำแหน่งงานและการสรรหาบุคลากร'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-xs font-bold transition border border-white/20"
          >
            แก้ไขโปรไฟล์บริษัท
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>ลงประกาศงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ตำแหน่งงานที่เปิดรับ</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            {jobs.filter((j) => j.status === 'ACTIVE').length} / {jobs.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">เปิดรับสมัครอยู่</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ใบสมัครทั้งหมด</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {applications.length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">จากผู้สมัครทุกตำแหน่ง</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">นัดสัมภาษณ์งาน</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
            {applications.filter((a) => a.status === 'INTERVIEW').length}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">รอการสัมภาษณ์</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ผ่านการคัดเลือก (รับเข้าทำงาน)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {applications.filter((a) => a.status === 'ACCEPTED').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">ตอบรับเข้าทำงานแล้ว</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 relative ${
            activeTab === 'JOBS'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>จัดการตำแหน่งงานที่ลงประกาศ ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPLICANTS')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 relative ${
            activeTab === 'APPLICANTS'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการใบสมัครและผู้สมัคร ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: JOBS MANAGEMENT */}
      {activeTab === 'JOBS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">รายการประกาศงานทั้งหมดของบริษัท</h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างประกาศงานใหม่</span>
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">คุณยังไม่ได้ลงประกาศงาน</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เริ่มต้นลงประกาศงานแรกเพื่อเปิดรับสมัครนักศึกษาและผู้หางานที่มีศักยภาพ
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                ลงประกาศงานทันที
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">ตำแหน่งงาน</th>
                      <th className="px-5 py-3.5">หมวดหมู่ & รูปแบบ</th>
                      <th className="px-5 py-3.5">เงินเดือน</th>
                      <th className="px-5 py-3.5">ผู้สมัคร</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4">
                          <Link href={`/jobs/${job.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm">
                            {job.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ลงเมื่อ: {formatThaiDate(job.createdAt)} • ผู้เข้าชม: {job.views}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium text-[11px] mb-1">
                            {job.category}
                          </span>
                          <span className="block text-slate-500">{job.jobType}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => {
                              setFilterJobId(job.id);
                              setActiveTab('APPLICANTS');
                            }}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{job._count?.applications || 0} คน</span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleJobStatus(job.id, job.status)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              job.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {job.status === 'ACTIVE' ? 'เปิดรับสมัคร' : 'ปิดรับแล้ว'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 inline-block"
                            title="ดูหน้ารับสมัคร"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="ลบประกาศงาน"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* TAB 2: APPLICANTS MANAGEMENT */}
      {activeTab === 'APPLICANTS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">กรองตามตำแหน่งงาน</label>
                <select
                  value={filterJobId}
                  onChange={(e) => setFilterJobId(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="ALL">ตำแหน่งงานทั้งหมด ({jobs.length})</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">สถานะใบสมัคร</label>
                <select
                  value={filterAppStatus}
                  onChange={(e) => setFilterAppStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="PENDING">รอการพิจารณา</option>
                  <option value="REVIEWED">เปิดดูแล้ว</option>
                  <option value="INTERVIEW">นัดสัมภาษณ์งาน</option>
                  <option value="ACCEPTED">ผ่านการคัดเลือก (รับเข้าทำงาน)</option>
                  <option value="REJECTED">ไม่ผ่านการคัดเลือก</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              พบ {filteredApplicants.length} ใบสมัคร
            </span>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">ไม่พบใบสมัครตามเงื่อนไขที่เลือก</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เมื่อมีผู้หางานหรือนักศึกษากดสมัครงาน รายชื่อและเรซูเมจะปรากฏที่นี่ทันที
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplicants.map((app) => {
                const statusMeta = APPLICATION_STATUS_MAP[app.status] || APPLICATION_STATUS_MAP.PENDING;
                const profile = app.applicant.jobSeekerProfile;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <Link href={`/dashboard/company/applications/${app.id}`} className="shrink-0 hover:opacity-90 transition">
                        <img
                          src={app.applicant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${app.applicant.name}`}
                          alt={app.applicant.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 hover:ring-2 hover:ring-emerald-400 transition"
                        />
                      </Link>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/company/applications/${app.id}`}
                            className="font-bold text-slate-900 text-base hover:text-emerald-700 transition"
                          >
                            {app.applicant.name}
                          </Link>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusMeta.badge}`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          สมัครตำแหน่ง:{' '}
                          <span className="font-bold text-blue-600">{app.job.title}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          {profile?.university && (
                            <span className="flex items-center gap-1 text-purple-700 font-semibold">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {profile.university.name}
                            </span>
                          )}
                          {profile?.faculty && <span>{profile.faculty}</span>}
                          {profile?.major && <span>สาขา: {profile.major}</span>}
                          <span>อีเมล: {app.applicant.email}</span>
                          {app.applicant.phone && <span>โทร: {app.applicant.phone}</span>}
                        </div>

                        {app.expectedSalary && (
                          <p className="text-[11px] text-slate-600">
                            เงินเดือนที่คาดหวัง:{' '}
                            <span className="font-bold text-emerald-600">
                              ฿{app.expectedSalary.toLocaleString()}
                            </span>
                          </p>
                        )}

                        {app.coverLetter && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                            "{app.coverLetter}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions on Applicant */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูเรซูเม</span>
                          </a>
                        )}

                        <Link
                          href={`/dashboard/company/applications/${app.id}`}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>ดูโปรไฟล์ & นัดสัมภาษณ์</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => openStatusModal(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold transition"
                          title="ปรับสถานะด่วน"
                        >
                          <span>ปรับสถานะด่วน</span>
                        </button>
                      </div>

                      {app.interviewDate && (
                        <Link
                          href={`/dashboard/company/applications/${app.id}`}
                          className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
                        >
                          <Calendar className="w-3 h-3 text-purple-600" />
                          <span>นัดสัมภาษณ์: {formatThaiDateTime(app.interviewDate)}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: POST JOB */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">ลงประกาศรับสมัครงานใหม่</h3>
                <p className="text-xs text-slate-500">กรอกรายละเอียดเพื่อเผยแพร่ให้ผู้หางานและนักศึกษาได้สมัคร</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อตำแหน่งงาน (Job Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Full Stack Developer, Junior UX Designer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่งาน</label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Web & Programming">Web & Programming</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Marketing">Marketing & Social</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business & Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รูปแบบการทำงาน</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Full-time">งานประจำ (Full-time)</option>
                    <option value="Internship">นักศึกษาฝึกงาน (Internship)</option>
                    <option value="Part-time">พาร์ทไทม์ (Part-time)</option>
                    <option value="Freelance">ฟรีแลนซ์ / สัญญาจ้าง</option>
                    <option value="Remote">ทำงานจากบ้าน (Remote 100%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เงินเดือนต่ำสุด (฿)</label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={newJob.salaryMin}
                    onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เงินเดือนสูงสุด (฿)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newJob.salaryMax}
                    onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่ทำงาน</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น กรุงเทพฯ (BTS พร้อมพงษ์)"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดหน้าที่ความรับผิดชอบ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="อธิบายลักษณะงาน โครงการที่ต้องดูแล และภารกิจประจำวัน..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คุณสมบัติที่ต้องการ (Qualifications) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="- วุฒิการศึกษา ป.ตรี หรือเทียบเท่า&#10;- ทักษะที่ต้องการ...&#10;- ประสบการณ์ทำงาน..."
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สวัสดิการ (Benefits)</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ประกันสุขภาพกลุ่ม, โบนัสประจำปี, ค่าเดินทาง, ขนมและกาแฟฟรี..."
                  value={newJob.benefits}
                  onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newJob.urgent}
                    onChange={(e) => setNewJob({ ...newJob, urgent: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>ติดป้าย รับสมัครด่วน (Urgent)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newJob.featured}
                    onChange={(e) => setNewJob({ ...newJob, featured: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>แนะนำบนหน้าแรก (Featured)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {createLoading ? 'กำลังบันทึก...' : 'เผยแพร่ประกาศงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE APPLICANT STATUS & SCHEDULE INTERVIEW */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">จัดการสถานะใบสมัคร</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{selectedApp.applicant.name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpdateAppStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เปลี่ยนสถานะ</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="PENDING">รอการพิจารณา (Pending)</option>
                  <option value="REVIEWED">เปิดดูประวัติแล้ว (Reviewed)</option>
                  <option value="INTERVIEW">นัดสัมภาษณ์งาน (Interview)</option>
                  <option value="ACCEPTED">ผ่านการคัดเลือก / รับเข้าทำงาน (Accepted)</option>
                  <option value="REJECTED">ไม่ผ่านการคัดเลือก (Rejected)</option>
                </select>
              </div>

              {newStatus === 'INTERVIEW' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันและเวลานัดสัมภาษณ์
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อความหรือบันทึกถึงผู้สมัคร (Notes)
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น นัดสัมภาษณ์ผ่าน Google Meet ลิงก์... หรือ เหตุผลในการคัดเลือก"
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {updatingStatus ? 'กำลังบันทึก...' : 'อัปเดตสถานะ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
