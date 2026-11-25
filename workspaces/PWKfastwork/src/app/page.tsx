'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Briefcase,
  Building2,
  GraduationCap,
  ShieldCheck,
  Code,
  Palette,
  TrendingUp,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import JobCard from '@/components/JobCard';
import RoleSwitcherModal from '@/components/RoleSwitcherModal';

const CATEGORIES = [
  { name: 'Web & Programming', count: '120+ ตำแหน่ง', icon: Code, color: 'text-blue-500 bg-blue-50' },
  { name: 'Design & Creative', count: '85+ ตำแหน่ง', icon: Palette, color: 'text-purple-500 bg-purple-50' },
  { name: 'Marketing', count: '64+ ตำแหน่ง', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
  { name: 'Data & AI', count: '45+ ตำแหน่ง', icon: Database, color: 'text-amber-500 bg-amber-50' },
  { name: 'Engineering', count: '38+ ตำแหน่ง', icon: Cpu, color: 'text-rose-500 bg-rose-50' },
  { name: 'Business', count: '50+ ตำแหน่ง', icon: Layers, color: 'text-indigo-500 bg-indigo-50' },
];

const POPULAR_TAGS = ['Next.js', 'UI/UX', 'นักศึกษาฝึกงาน', 'Remote 100%', 'Data Analyst', 'React'];

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'URGENT' | 'FEATURED' | 'INTERNSHIP'>('ALL');
  const [loading, setLoading] = useState(true);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.set('search', searchTerm);
    if (selectedCategory) query.set('category', selectedCategory);
    router.push(`/jobs?${query.toString()}`);
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterTab === 'URGENT') return job.urgent;
    if (filterTab === 'FEATURED') return job.featured;
    if (filterTab === 'INTERNSHIP') return job.jobType === 'Internship';
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Fastwork Vibrant Gradient) */}
      <section className="relative overflow-hidden fastwork-gradient text-white py-16 md:py-24">
        {/* Decorative blur shapes */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-cyan-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>PWKfastwork — แพลตฟอร์มหางานที่เชื่อมโยง 4 บทบาทครบวงจร</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              ค้นหางานคุณภาพ <br className="hidden sm:inline" />
              <span className="text-cyan-300">กับบริษัทชั้นนำ</span> และก้าวสู่อนาคตที่ใช่
            </h1>

            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              ตอบโจทย์ทั้งผู้หางาน นักศึกษา บริษัท มหาวิทยาลัย และผู้ดูแลระบบ
              ด้วยระบบจัดการใบสมัครและรายงานสถิติการได้งานทำแบบเรียลไทม์
            </p>

            {/* Fastwork-Style Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mt-8 bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto text-slate-800"
            >
              <div className="flex-1 flex items-center px-3 py-2">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อตำแหน่ง, ทักษะ เช่น React, UI/UX, การตลาด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>

              <div className="sm:border-l border-slate-200 px-3 py-2 flex items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs text-slate-600 bg-transparent focus:outline-none font-medium cursor-pointer"
                >
                  <option value="">ทุกหมวดหมู่</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>ค้นหางาน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-blue-100">
              <span className="text-blue-200 font-medium">คำค้นหายอดนิยม:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => router.push(`/jobs?search=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition text-xs font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick Demo Switcher CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-lg transition-transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>คลิกที่นี่เพื่อทดลองเข้าสู่ระบบ 4 บทบาท (1-Click Demo)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4 ROLES HIGHLIGHT SECTION */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Role-Based Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              หนึ่งแพลตฟอร์ม ครอบคลุม 4 บทบาทหลัก
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              ออกแบบระบบจัดการสิทธิ์เฉพาะตัวสำหรับแต่ละบทบาท เพื่อขับเคลื่อนการเติบโตในสายอาชีพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Job Seeker */}
            <div className="bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 transition duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">ผู้หางาน & นักศึกษา</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Seeker
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>ค้นหาและกรองงานตรงใจในคลิกเดียว</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>ส่งใบสมัครพร้อมแนบ Resume & Portfolio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>ติดตามสถานะสัมภาษณ์แบบเรียลไทม์</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/seeker"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>เข้าสู่แดชบอร์ดผู้หางาน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Company */}
            <div className="bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 transition duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">บริษัท & นายจ้าง</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Company
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ลงประกาศรับสมัครงานไม่จำกัดตำแหน่ง</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>คัดกรองใบสมัครและดูเรซูเมผู้สมัคร</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>นัดสัมภาษณ์และแจ้งผลการคัดเลือกทันที</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/company"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>เข้าสู่แดชบอร์ดบริษัท</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. University */}
            <div className="bg-slate-50 hover:bg-purple-50/50 rounded-2xl p-6 border border-slate-200/80 hover:border-purple-300 transition duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">มหาวิทยาลัย & สถาบัน</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    University
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>จัดการข้อมูลนิสิต/นักศึกษาและประวัติ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>ติดตามอัตราการมีงานทำ (Employment Rate)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>สร้างเครือข่ายพันธมิตรกับบริษัทชั้นนำ</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/university"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                <span>เข้าสู่แดชบอร์ดมหาวิทยาลัย</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Admin */}
            <div className="bg-slate-50 hover:bg-rose-50/50 rounded-2xl p-6 border border-slate-200/80 hover:border-rose-300 transition duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">ผู้ดูแลระบบ</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Admin
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>จัดการบัญชีผู้ใช้ 4 บทบาทในระบบ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>ตรวจสอบ อนุมัติ และคัดกรองงาน</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>ดูสถิติและ Activity Audit Logs ทั้งหมด</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/admin"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <span>เข้าสู่แดชบอร์ดแอดมิน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID (Fastwork Icons) */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                หมวดหมู่งานยอดนิยม
              </h2>
              <p className="text-xs text-slate-500 mt-1">เลือกสายงานที่คุณต้องการค้นหาและสมัคร</p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>ดูงานทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => router.push(`/jobs?category=${encodeURIComponent(cat.name)}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-card-hover text-center transition flex flex-col items-center group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${cat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400 mt-1">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED & URGENT JOBS LISTING */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  ตำแหน่งงานเปิดรับล่าสุด
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                โอกาสทองจากองค์กรชั้นนำและบริษัทสตาร์ทอัพที่กำลังเติบโต
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'ALL' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterTab('URGENT')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'URGENT' ? 'bg-white text-rose-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                งานด่วน
              </button>
              <button
                onClick={() => setFilterTab('FEATURED')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'FEATURED' ? 'bg-white text-amber-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                งานแนะนำ
              </button>
              <button
                onClick={() => setFilterTab('INTERNSHIP')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'INTERNSHIP' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ฝึกงาน
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-semibold text-slate-600">ไม่พบตำแหน่งงานในหมวดหมู่นี้</p>
              <button
                onClick={() => setFilterTab('ALL')}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                ดูงานทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm"
            >
              <span>ดูตำแหน่งงานว่างทั้งหมด ({jobs.length} งาน)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER FOR COMPANIES & UNIVERSITIES */}
      <section className="py-12 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                สำหรับบริษัทและมหาวิทยาลัย
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                ร่วมสร้างระบบนิเวศแห่งการทำงานยุคใหม่ บน PWKfastwork
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 leading-relaxed font-light">
                บริษัทสามารถค้นหาบุคลากรที่มีศักยภาพได้อย่างรวดเร็ว ในขณะที่มหาวิทยาลัยสามารถติดตามผลการมีงานทำของบัณฑิตได้อย่างเป็นระบบ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                href="/register?role=COMPANY"
                className="px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition text-center shadow-md"
              >
                ลงทะเบียนสำหรับบริษัท
              </Link>
              <Link
                href="/register?role=UNIVERSITY"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition text-center shadow-md border border-blue-400"
              >
                ลงทะเบียนสำหรับมหาวิทยาลัย
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSuccess={fetchJobs}
      />
    </div>
  );
}
