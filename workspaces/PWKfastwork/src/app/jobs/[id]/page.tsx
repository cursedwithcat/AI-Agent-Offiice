'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Flame,
  Star,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ExternalLink,
  Send,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { formatSalary, formatThaiDate } from '@/lib/utils';
import ApplicationModal from '@/components/ApplicationModal';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJob();
    fetchUserAndCheckApplication();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAndCheckApplication = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        // Check if user has already applied
        const appRes = await fetch('/api/applications');
        if (appRes.ok) {
          const appData = await appRes.json();
          const found = appData.applications?.some((a: any) => a.jobId === jobId);
          setHasApplied(Boolean(found));
        }
      }
    } catch {
      // not logged in
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลตำแหน่งงาน...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">ไม่พบตำแหน่งงานนี้</h2>
        <p className="text-xs text-slate-500 mt-2">ตำแหน่งงานนี้อาจถูกลบหรือปิดรับสมัครไปแล้ว</p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าค้นหางาน
        </Link>
      </div>
    );
  }

  const companyName = job.company.companyProfile?.companyName || job.company.name;
  const isVerified = job.company.companyProfile?.isVerified ?? true;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ย้อนกลับไปหน้าค้นหางาน</span>
      </Link>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={job.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`}
              alt={companyName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">{companyName}</span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันแล้ว
                  </span>
                )}
                {job.urgent && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5" /> ด่วน
                  </span>
                )}
                {job.featured && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> แนะนำ
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> ประกาศเมื่อ {formatThaiDate(job.createdAt)}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3.5 h-3.5" /> {job.views} ครั้ง
                </span>
              </div>
            </div>
          </div>

          {/* Salary and Apply Action */}
          <div className="flex flex-col sm:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block font-medium">อัตราเงินเดือน</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="คัดลอกลิงก์แชร์"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {hasApplied ? (
                <div className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ส่งใบสมัครแล้ว</span>
                </div>
              ) : currentUser?.role === 'JOB_SEEKER' ? (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  <span>สมัครงานทันที</span>
                </button>
              ) : !currentUser ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <span>เข้าสู่ระบบเพื่อสมัครงาน</span>
                </Link>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
                  เฉพาะผู้หางาน/นักศึกษาที่สมัครได้ (คุณเป็น {currentUser.role})
                </div>
              )}
            </div>
            {copied && <span className="text-[11px] text-emerald-600 font-medium">คัดลอกลิงก์แล้ว!</span>}
          </div>
        </div>
      </div>

      {/* Detail Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-600 rounded-full" />
                รายละเอียดงาน (Job Description)
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                {job.description}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-600 rounded-full" />
                คุณสมบัติผู้สมัคร (Qualifications & Requirements)
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>

            {job.benefits && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
                  <span className="w-2 h-5 bg-emerald-600 rounded-full" />
                  สวัสดิการและผลประโยชน์ (Benefits & Perks)
                </h3>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  {job.benefits}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Company Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">ข้อมูลบริษัทผู้ว่าจ้าง</h3>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img
                src={job.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`}
                alt={companyName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="font-bold text-slate-800 text-sm">{companyName}</p>
                <p className="text-xs text-slate-500">{job.company.companyProfile?.industry || 'ธุรกิจทั่วไป'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {job.company.companyProfile?.description || job.company.bio || 'ไม่มีข้อมูลรายละเอียดบริษัท'}
            </p>

            <div className="space-y-2 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{job.company.companyProfile?.location || job.location}</span>
              </div>
              {job.company.companyProfile?.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={job.company.companyProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {job.company.companyProfile.website}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              {hasApplied ? (
                <div className="w-full py-2.5 text-center text-xs font-bold bg-emerald-50 text-emerald-700 rounded-xl">
                  คุณได้สมัครงานนี้แล้ว
                </div>
              ) : currentUser?.role === 'JOB_SEEKER' ? (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>สมัครงานในตำแหน่งนี้</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplyModalOpen && (
        <ApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={{
            id: job.id,
            title: job.title,
            companyName: companyName,
          }}
          onSuccess={() => {
            setHasApplied(true);
          }}
        />
      )}
    </div>
  );
}
