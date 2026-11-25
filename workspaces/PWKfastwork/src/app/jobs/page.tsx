'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Flame,
  Star,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import JobCard from '@/components/JobCard';

const CATEGORIES = [
  'ALL',
  'Web & Programming',
  'Design & Creative',
  'Marketing',
  'Data & AI',
  'Engineering',
  'Business',
];

const JOB_TYPES = [
  { value: 'ALL', label: 'ทุกรูปแบบ' },
  { value: 'Full-time', label: 'งานประจำ (Full-time)' },
  { value: 'Internship', label: 'นักศึกษาฝึกงาน (Internship)' },
  { value: 'Part-time', label: 'พาร์ทไทม์ (Part-time)' },
  { value: 'Freelance', label: 'ฟรีแลนซ์ / สัญญาจ้าง' },
  { value: 'Remote', label: 'ทำงานจากบ้าน (Remote)' },
];

function JobSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'ALL');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [urgentOnly, setUrgentOnly] = useState(searchParams.get('urgent') === 'true');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'ALL') params.set('category', category);
      if (jobType && jobType !== 'ALL') params.set('jobType', jobType);
      if (location) params.set('location', location);
      if (urgentOnly) params.set('urgent', 'true');
      if (featuredOnly) params.set('featured', 'true');
      params.set('page', String(targetPage));
      params.set('limit', '8');

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      if (data.pagination) {
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalJobs(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [category, jobType, urgentOnly, featuredOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setJobType('ALL');
    setLocation('');
    setUrgentOnly(false);
    setFeaturedOnly(false);
    setPage(1);
    router.push('/jobs');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่องาน, ทักษะ, หรือชื่อบริษัท..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="สถานที่ เช่น กรุงเทพฯ, BTS, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              title="ตัวกรอง"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">ตัวกรองการค้นหา</h3>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> รีเซ็ต
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              หมวดหมู่งาน
            </h4>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    category === cat
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'ALL' ? 'ทุกหมวดหมู่' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Job Types */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              รูปแบบการทำงาน
            </h4>
            <div className="space-y-1">
              {JOB_TYPES.map((jt) => (
                <button
                  key={jt.value}
                  onClick={() => setJobType(jt.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    jobType === jt.value
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {jt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Options */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ตัวเลือกพิเศษ
            </h4>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-rose-500" /> รับสมัครด่วน
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> งานแนะนำ
              </span>
            </label>
          </div>
        </aside>

        {/* Job Listings Column */}
        <main className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              พบตำแหน่งงานว่างทั้งหมด <span className="text-blue-600 font-bold">{jobs.length}</span> ตำแหน่ง
            </p>

            {(category !== 'ALL' || jobType !== 'ALL' || urgentOnly || featuredOnly) && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">กรองโดย:</span>
                {category !== 'ALL' && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                    {category}
                  </span>
                )}
                {jobType !== 'ALL' && (
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {jobType}
                  </span>
                )}
                {urgentOnly && (
                  <span className="text-[11px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-medium">
                    งานด่วน
                  </span>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">ไม่พบตำแหน่งงานที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ลองปรับเปลี่ยนคำค้นหา หรือกดรีเซ็ตตัวกรองเพื่อดูตำแหน่งงานทั้งหมดในระบบ
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                  <span className="text-xs text-slate-500 font-medium">
                    แสดงหน้า {page} จาก {totalPages} (ทั้งหมด {totalJobs} ตำแหน่ง)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => fetchJobs(page - 1)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="text-xs font-bold px-2.5 py-1 text-blue-600 bg-blue-50 rounded">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => fetchJobs(page + 1)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto space-y-6 animate-slide-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">ตัวกรอง</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">หมวดหมู่งาน</h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      category === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {cat === 'ALL' ? 'ทุกหมวดหมู่' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">รูปแบบการทำงาน</h4>
              <div className="space-y-1">
                {JOB_TYPES.map((jt) => (
                  <button
                    key={jt.value}
                    onClick={() => {
                      setJobType(jt.value);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      jobType === jt.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {jt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setMobileFilterOpen(false);
              }}
              className="w-full py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">กำลังโหลดรายการงาน...</div>}>
      <JobSearchContent />
    </Suspense>
  );
}
