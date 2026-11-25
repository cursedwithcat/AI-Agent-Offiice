'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  formatSalary,
  formatThaiDate,
  formatThaiDateTime,
  APPLICATION_STATUS_MAP,
  EMPLOYMENT_STATUS_MAP,
} from '@/lib/utils';

export default function SeekerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

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

      if (userData.user.role !== 'JOB_SEEKER' && userData.user.role !== 'ADMIN') {
        // Redirect to appropriate dashboard
        if (userData.user.role === 'COMPANY') router.push('/dashboard/company');
        else if (userData.user.role === 'UNIVERSITY') router.push('/dashboard/university');
        return;
      }

      setCurrentUser(userData.user);

      const appRes = await fetch('/api/applications');
      const appData = await appRes.json();
      setApplications(appData.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  const getStepActiveIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'REVIEWED':
        return 2;
      case 'INTERVIEW':
        return 3;
      case 'ACCEPTED':
        return 4;
      case 'REJECTED':
        return -1;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดแดชบอร์ดผู้หางาน...</p>
      </div>
    );
  }

  const profile = currentUser?.jobSeekerProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}`}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser?.name}</h1>
                <span className="text-[11px] font-bold bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full">
                  ผู้หางาน & นิสิต/นักศึกษา
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                {profile?.title || 'ยังไม่ได้ระบุตำแหน่งที่สนใจ'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 pt-1">
                {profile?.university && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.university.name}
                  </span>
                )}
                {profile?.studentId && (
                  <span>รหัสนักศึกษา: {profile.studentId}</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  profile?.employmentStatus === 'EMPLOYED'
                    ? 'bg-emerald-500 text-white'
                    : profile?.employmentStatus === 'INTERNING'
                    ? 'bg-purple-500 text-white'
                    : 'bg-amber-400 text-slate-900'
                }`}>
                  {EMPLOYMENT_STATUS_MAP[profile?.employmentStatus || 'UNEMPLOYED']?.label || 'กำลังมองหางาน'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-xs font-bold transition border border-white/20"
            >
              แก้ไขโปรไฟล์ & เรซูเม
            </Link>
            <Link
              href="/jobs"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-sm"
            >
              ค้นหางานใหม่
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Profile Summary & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">ข้อมูลการศึกษาและทักษะ</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">คณะ / สาขาวิชา</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {profile?.faculty ? `${profile.faculty} - ${profile.major || ''}` : 'ยังไม่ได้ระบุ'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ทักษะสำคัญ (Skills)</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {profile?.skills
                    ? profile.skills.split(',').map((s: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {s.trim()}
                        </span>
                      ))
                    : <span className="text-slate-400">ยังไม่ได้ระบุทักษะ</span>}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">เรซูเม / CV</span>
                {profile?.resumeUrl ? (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>เปิดดูเรซูเมของคุณ</span>
                  </a>
                ) : (
                  <span className="text-slate-400">ยังไม่ได้อัปโหลดเรซูเม</span>
                )}
              </div>

              {profile?.companyEmployed && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                  <span className="font-bold block text-[11px]">สถานะการทำงานปัจจุบัน</span>
                  <p className="text-xs font-semibold mt-0.5">ทำงานที่: {profile.companyEmployed}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">ภาพรวมการสมัคร</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl font-extrabold text-blue-600">{applications.length}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5 font-medium">สมัครไปแล้ว</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <span className="text-2xl font-extrabold text-purple-600">
                  {applications.filter((a) => a.status === 'INTERVIEW').length}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 font-medium">นัดสัมภาษณ์</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-2xl font-extrabold text-emerald-600">
                  {applications.filter((a) => a.status === 'ACCEPTED').length}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 font-medium">ผ่านคัดเลือก</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-2xl font-extrabold text-amber-600">
                  {applications.filter((a) => a.status === 'PENDING').length}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 font-medium">รอพิจารณา</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Submitted Applications with Real-time Status Tracker */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ประวัติการส่งใบสมัครงานของคุณ ({applications.length})
              </h2>
              <p className="text-xs text-slate-500">ติดตามสถานะการเปิดดู นัดสัมภาษณ์ และผลการพิจารณา</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium self-start">
              {['ALL', 'PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL'
                    ? 'ทั้งหมด'
                    : APPLICATION_STATUS_MAP[st]?.label || st}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">ยังไม่มีประวัติการสมัครงานในหมวดหมู่นี้</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เริ่มต้นค้นหาตำแหน่งงานที่ตรงกับทักษะของคุณ แล้วส่งใบสมัครเพื่อเปิดโอกาสใหม่ๆ
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <span>ค้นหางานว่างตอนนี้</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => {
                const statusMeta = APPLICATION_STATUS_MAP[app.status] || APPLICATION_STATUS_MAP.PENDING;
                const companyName = app.job.company.companyProfile?.companyName || app.job.company.name;
                const step = getStepActiveIndex(app.status);

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-blue-300 transition space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={app.job.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`}
                          alt={companyName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <Link href={`/jobs/${app.job.id}`}>
                            <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition">
                              {app.job.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {companyName} • {app.job.location} • {app.job.jobType}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            ส่งใบสมัครเมื่อ: {formatThaiDate(app.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                        {app.expectedSalary && (
                          <span className="text-xs text-slate-500 mt-1">
                            เงินเดือนที่คาดหวัง: ฿{app.expectedSalary.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Status Progress Pipeline */}
                    {app.status !== 'REJECTED' ? (
                      <div className="py-2 px-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className={`space-y-1 ${step >= 1 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full mx-auto ${step >= 1 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            <span className="text-[10px] block">1. ส่งใบสมัคร</span>
                          </div>
                          <div className={`space-y-1 ${step >= 2 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full mx-auto ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            <span className="text-[10px] block">2. เปิดตรวจดู</span>
                          </div>
                          <div className={`space-y-1 ${step >= 3 ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full mx-auto ${step >= 3 ? 'bg-purple-600' : 'bg-slate-300'}`} />
                            <span className="text-[10px] block">3. นัดสัมภาษณ์</span>
                          </div>
                          <div className={`space-y-1 ${step >= 4 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full mx-auto ${step >= 4 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            <span className="text-[10px] block">4. ผ่านคัดเลือก</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>บริษัทขอเก็บประวัติของคุณไว้สำหรับตำแหน่งที่เหมาะสมในโอกาสถัดไป</span>
                      </div>
                    )}

                    {/* Interview / Employer feedback banner */}
                    {app.interviewDate && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <span className="font-bold">วันและเวลานัดสัมภาษณ์:</span>{' '}
                          <span>{formatThaiDateTime(app.interviewDate)}</span>
                        </div>
                      </div>
                    )}

                    {app.notes && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">ข้อความจากผู้ว่าจ้าง:</span>
                        <p>{app.notes}</p>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="text-xs text-slate-500 pt-1">
                        <span className="font-medium text-slate-600">จดหมายแนะนำตัวของคุณ: </span>
                        <span>"{app.coverLetter}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
