'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  MapPin,
  DollarSign,
  Video,
  Send,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';
import {
  formatSalary,
  formatThaiDate,
  formatThaiDateTime,
  APPLICATION_STATUS_MAP,
  EMPLOYMENT_STATUS_MAP,
} from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for scheduling interview & status updates
  const [status, setStatus] = useState('INTERVIEW');
  const [interviewDate, setInterviewDate] = useState('');
  const [meetingType, setMeetingType] = useState('ONLINE'); // ONLINE, ONSITE, PHONE
  const [meetingLocation, setMeetingLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Check user
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

      // Fetch application details
      const appRes = await fetch(`/api/applications/${id}`);
      const appData = await appRes.json();

      if (!appRes.ok || !appData.application) {
        throw new Error(appData.error || 'ไม่พบข้อมูลใบสมัครงาน');
      }

      const app = appData.application;
      setApplication(app);
      setStatus(app.status || 'PENDING');
      setInterviewDate(
        app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : ''
      );
      setNotes(app.notes || '');

      // Parse existing notes to prefill meeting location if it matches pattern
      if (app.notes && app.notes.includes('ลิงก์ / สถานที่:')) {
        const parts = app.notes.split('ลิงก์ / สถานที่:');
        if (parts[1]) {
          const loc = parts[1].split('\n')[0].trim();
          setMeetingLocation(loc);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper for interview date
  const setQuickDate = (daysAhead: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setInterviewDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    setStatus('INTERVIEW');
  };

  // Schedule Interview action
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      alert('กรุณาระบุวันและเวลานัดสัมภาษณ์');
      return;
    }

    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      let typeLabel = 'วิดีโอคอลออนไลน์ (Online)';
      if (meetingType === 'ONSITE') typeLabel = 'สัมภาษณ์ ณ บริษัท (On-site)';
      if (meetingType === 'PHONE') typeLabel = 'โทรศัพท์สัมภาษณ์ (Phone Call)';

      let fullNotes = `รูปแบบการสัมภาษณ์: ${typeLabel}`;
      if (meetingLocation.trim()) {
        fullNotes += `\nลิงก์ / สถานที่: ${meetingLocation.trim()}`;
      }
      if (notes.trim()) {
        fullNotes += `\nข้อความเพิ่มเติม: ${notes.trim()}`;
      }

      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'INTERVIEW',
          interviewDate: new Date(interviewDate).toISOString(),
          notes: fullNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถนัดสัมภาษณ์ได้');

      setApplication(data.application || { ...application, status: 'INTERVIEW', interviewDate, notes: fullNotes });
      setStatus('INTERVIEW');
      setSuccessMsg('บันทึกการนัดสัมภาษณ์เรียบร้อยแล้ว! สถานะเปลี่ยนเป็น "นัดสัมภาษณ์งาน"');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setUpdating(false);
    }
  };

  // General Status Update action
  const handleUpdateStatusOnly = async (newStatus: string) => {
    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || application.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถอัปเดตสถานะได้');

      setApplication(data.application || { ...application, status: newStatus });
      setStatus(newStatus);
      setSuccessMsg(`อัปเดตสถานะเป็น "${APPLICATION_STATUS_MAP[newStatus]?.label || newStatus}" เรียบร้อยแล้ว`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดโปรไฟล์ผู้สมัครและข้อมูลใบสมัคร...</p>
      </div>
    );
  }

  if (errorMsg && !application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">ไม่สามารถเปิดข้อมูลใบสมัครได้</h2>
        <p className="text-sm text-slate-500">{errorMsg}</p>
        <Link
          href="/dashboard/company"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าจัดการผู้สมัคร</span>
        </Link>
      </div>
    );
  }

  const applicant = application.applicant;
  const profile = applicant?.jobSeekerProfile;
  const job = application.job;
  const statusMeta = APPLICATION_STATUS_MAP[application.status] || APPLICATION_STATUS_MAP.PENDING;
  const empStatusMeta = profile?.employmentStatus ? EMPLOYMENT_STATUS_MAP[profile.employmentStatus] : null;

  // Split skills
  const skillsList = profile?.skills
    ? profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/company"
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่แดชบอร์ดบริษัท</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>/</span>
            <Link href="/dashboard/company" className="hover:text-slate-600">ผู้สมัครงาน</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 truncate max-w-xs">{applicant.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusMeta.badge}`}>
            สถานะ: {statusMeta.label}
          </span>
          <Link
            href={`/jobs/${job.id}`}
            target="_blank"
            className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>ดูหน้าประกาศงาน</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Main Grid: Left Column (Profile & Application) + Right Column (Interview & Action) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: CANDIDATE PROFILE DETAILS (2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Candidate Primary Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={applicant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${applicant.name}`}
                alt={applicant.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-md border border-slate-100"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{applicant.name}</h1>
                  {empStatusMeta && (
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${empStatusMeta.badge}`}>
                      {empStatusMeta.label}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-emerald-700">
                  {profile?.title || 'ผู้สมัครงาน / นักศึกษา'}
                </p>

                {profile?.university && (
                  <p className="text-xs text-purple-700 font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>{profile.university.name}</span>
                    {profile.faculty && <span>• {profile.faculty}</span>}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <a
                    href={`mailto:${applicant.email}`}
                    className="flex items-center gap-1 hover:text-blue-600 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{applicant.email}</span>
                  </a>
                  {applicant.phone && (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="flex items-center gap-1 hover:text-blue-600 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{applicant.phone}</span>
                    </a>
                  )}
                  <span className="text-slate-400">
                    ยื่นใบสมัครเมื่อ: {formatThaiDate(application.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Applicant Bio */}
            {applicant.bio && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  เกี่ยวกับผู้สมัคร (Bio)
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {applicant.bio}
                </p>
              </div>
            )}

            {/* External Links: Resume & Portfolio */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>เปิดดูไฟล์เรซูเม (Resume / CV)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </a>
              )}

              {profile?.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ดูพอร์ตโฟลิโอออนไลน์ (Portfolio)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                </a>
              )}
            </div>
          </div>

          {/* 2. Job Application Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลการสมัครตำแหน่งงานนี้</span>
            </h3>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">ตำแหน่งงานที่สมัคร</span>
                  <h4 className="text-base font-extrabold text-slate-900">{job.title}</h4>
                  <p className="text-xs text-slate-500">
                    {job.category} • {job.jobType} • {job.location}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-semibold text-slate-400">เงินเดือนที่บริษัทเสนอ</span>
                  <p className="text-sm font-bold text-slate-800">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                  </p>
                </div>
              </div>

              {application.expectedSalary && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">เงินเดือนที่ผู้สมัครคาดหวัง:</span>
                  <span className="text-sm font-black text-emerald-600 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg">
                    ฿{application.expectedSalary.toLocaleString()} /เดือน
                  </span>
                </div>
              )}
            </div>

            {/* Cover letter */}
            {application.coverLetter ? (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500">
                  จดหมายแนะนำตัวและแรงจูงใจ (Cover Letter)
                </span>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{application.coverLetter}"
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">ผู้สมัครไม่ได้แนบจดหมายแนะนำตัว</p>
            )}
          </div>

          {/* 3. Skills Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ทักษะและความสามารถ (Skills)</span>
            </h3>

            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">ยังไม่มีข้อมูลทักษะที่ระบุ</p>
            )}
          </div>

          {/* 4. Experience & Education Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>ประสบการณ์ทำงาน (Experience)</span>
              </h3>
              {profile?.experience ? (
                <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {profile.experience}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">ไม่มีข้อมูลประสบการณ์ทำงาน</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>ประวัติการศึกษา (Education)</span>
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-900">{profile?.education || 'ไม่ระบุวุฒิการศึกษา'}</p>
                {profile?.faculty && <p className="text-slate-600">คณะ: {profile.faculty}</p>}
                {profile?.major && <p className="text-slate-600">สาขาวิชา: {profile.major}</p>}
                {profile?.studentId && <p className="text-slate-500">รหัสนักศึกษา: {profile.studentId}</p>}
                {profile?.graduationYear && (
                  <p className="text-slate-500">ปีการศึกษาที่จบ: {profile.graduationYear}</p>
                )}
                {profile?.university && (
                  <p className="text-purple-700 font-semibold pt-1 border-t border-slate-200/60">
                    {profile.university.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCHEDULE INTERVIEW & APPLICATION MANAGEMENT (1 Span) */}
        <div className="space-y-6">
          {/* A. Scheduled Interview Banner (if already scheduled) */}
          {application.interviewDate && (
            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white rounded-3xl p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold bg-white/20 text-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  นัดสัมภาษณ์แล้ว
                </span>
                <Calendar className="w-5 h-5 text-purple-200" />
              </div>

              <div>
                <p className="text-xs text-purple-200 font-medium">วันและเวลานัดหมายสัมภาษณ์</p>
                <h4 className="text-lg font-black text-white mt-1">
                  {formatThaiDateTime(application.interviewDate)}
                </h4>
              </div>

              {application.notes && (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/15 text-xs text-purple-100 whitespace-pre-line leading-relaxed">
                  {application.notes}
                </div>
              )}

              <p className="text-[11px] text-purple-200/80">
                💡 คุณสามารถปรับเปลี่ยนเวลา หรือรายละเอียดการนัดหมายได้จากแบบฟอร์มด้านล่าง
              </p>
            </div>
          )}

          {/* B. Primary Action: Schedule Interview Card */}
          <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {application.interviewDate ? 'ปรับเวลา / นัดสัมภาษณ์ใหม่' : 'กดนัดสัมภาษณ์งาน'}
                </h3>
                <p className="text-xs text-slate-500">กำหนดวัน เวลา และรายละเอียดการสัมภาษณ์</p>
              </div>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  เลือกเวลานัดหมายด่วน
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(1, 10)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition"
                  >
                    พรุ่งนี้ 10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2, 14)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition"
                  >
                    อีก 2 วัน 14:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7, 10)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition"
                  >
                    สัปดาห์หน้า
                  </button>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันและเวลาสัมภาษณ์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Interview Format */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปแบบการสัมภาษณ์
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setMeetingType('ONLINE')}
                    className={`py-2 px-1 text-center font-bold rounded-xl border transition ${
                      meetingType === 'ONLINE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📹 ออนไลน์
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingType('ONSITE')}
                    className={`py-2 px-1 text-center font-bold rounded-xl border transition ${
                      meetingType === 'ONSITE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🏢 ที่บริษัท
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingType('PHONE')}
                    className={`py-2 px-1 text-center font-bold rounded-xl border transition ${
                      meetingType === 'PHONE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📞 โทรศัพท์
                  </button>
                </div>
              </div>

              {/* Location or Meeting URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {meetingType === 'ONLINE'
                    ? 'ลิงก์การประชุม (Google Meet / Zoom)'
                    : meetingType === 'ONSITE'
                    ? 'สถานที่นัดพบ / ชั้น / ห้องประชุม'
                    : 'เบอร์โทรศัพท์ที่ใช้ติดต่อ'}
                </label>
                <input
                  type="text"
                  placeholder={
                    meetingType === 'ONLINE'
                      ? 'เช่น https://meet.google.com/abc-defg-hij'
                      : meetingType === 'ONSITE'
                      ? 'เช่น อาคารสยามสแควร์ ชั้น 12 ห้องประชุม 3'
                      : 'เช่น 02-123-4567 หรือ เบอร์ผู้สมัคร'
                  }
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Notes / Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำแนะนำหรือข้อความถึงผู้สมัคร (Notes)
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น กรุณาเตรียมสไลด์หรือตัวอย่างผลงานนำเสนอ 10 นาที หรือแจ้งบุคคลที่ให้ติดต่อเมื่อเดินทางมาถึง..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{updating ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันและส่งนัดสัมภาษณ์'}</span>
              </button>
            </form>
          </div>

          {/* C. Application Status Control Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>ปรับเปลี่ยนสถานะใบสมัคร</span>
            </h3>

            <p className="text-xs text-slate-500">
              คุณสามารถเปลี่ยนผลการพิจารณาใบสมัครได้ทุกขั้นตอน:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={updating || application.status === 'REVIEWED'}
                onClick={() => handleUpdateStatusOnly('REVIEWED')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between ${
                  application.status === 'REVIEWED'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>👀 เปิดดูประวัติแล้ว (Reviewed)</span>
                {application.status === 'REVIEWED' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                disabled={updating || application.status === 'ACCEPTED'}
                onClick={() => handleUpdateStatusOnly('ACCEPTED')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between ${
                  application.status === 'ACCEPTED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-700 hover:border-emerald-200'
                }`}
              >
                <span>🎉 ผ่านการคัดเลือก / รับเข้าทำงาน (Accepted)</span>
                {application.status === 'ACCEPTED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                type="button"
                disabled={updating || application.status === 'REJECTED'}
                onClick={() => handleUpdateStatusOnly('REJECTED')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between ${
                  application.status === 'REJECTED'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white hover:bg-rose-50/50 border-slate-200 text-slate-700 hover:border-rose-200'
                }`}
              >
                <span>❌ ไม่ผ่านการคัดเลือก (Rejected)</span>
                {application.status === 'REJECTED' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
              </button>

              <button
                type="button"
                disabled={updating || application.status === 'PENDING'}
                onClick={() => handleUpdateStatusOnly('PENDING')}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium border transition text-left text-slate-500 hover:bg-slate-50 border-slate-200`}
              >
                <span>↩ รีเซ็ตกลับเป็น: รอการพิจารณา (Pending)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
