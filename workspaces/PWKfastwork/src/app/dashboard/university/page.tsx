'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Briefcase,
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  FileSpreadsheet,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { EMPLOYMENT_STATUS_MAP, formatThaiDate } from '@/lib/utils';

export default function UniversityDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [facultyFilter, setFacultyFilter] = useState('ALL');

  // Add/Edit Student Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    faculty: 'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
    major: 'วิศวกรรมคอมพิวเตอร์',
    graduationYear: '2025',
    employmentStatus: 'UNEMPLOYED',
    companyEmployed: '',
    phone: '',
    title: 'นักศึกษา / บัณฑิตใหม่',
  });

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

      if (userData.user.role !== 'UNIVERSITY' && userData.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setCurrentUser(userData.user);

      // Fetch students
      const studRes = await fetch('/api/university/students');
      const studData = await studRes.json();
      setStudents(studData.students || []);

      // Fetch stats
      const statsRes = await fetch('/api/university/stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      studentId: '',
      faculty: 'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
      major: 'วิศวกรรมคอมพิวเตอร์',
      graduationYear: '2025',
      employmentStatus: 'UNEMPLOYED',
      companyEmployed: '',
      phone: '',
      title: 'นักศึกษา / บัณฑิตใหม่',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: any) => {
    setEditingStudent(student);
    const p = student.jobSeekerProfile;
    setFormData({
      name: student.name,
      email: student.email,
      studentId: p?.studentId || '',
      faculty: p?.faculty || 'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
      major: p?.major || '',
      graduationYear: p?.graduationYear ? String(p.graduationYear) : '2025',
      employmentStatus: p?.employmentStatus || 'UNEMPLOYED',
      companyEmployed: p?.companyEmployed || '',
      phone: student.phone || '',
      title: p?.title || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingStudent) {
        // Update
        const res = await fetch('/api/university/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStudent.id,
            studentId: formData.studentId,
            faculty: formData.faculty,
            major: formData.major,
            graduationYear: formData.graduationYear,
            employmentStatus: formData.employmentStatus,
            companyEmployed: formData.companyEmployed,
          }),
        });
        if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      } else {
        // Create
        const res = await fetch('/api/university/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const p = s.jobSeekerProfile;
    if (statusFilter !== 'ALL' && p?.employmentStatus !== statusFilter) return false;
    if (facultyFilter !== 'ALL' && p?.faculty !== facultyFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchStudentId = p?.studentId?.toLowerCase().includes(q);
      const matchMajor = p?.major?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchStudentId && !matchMajor) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดแดชบอร์ดมหาวิทยาลัย...</p>
      </div>
    );
  }

  const universityProfile = currentUser?.universityProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* University Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}`}
            alt={currentUser?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser?.name}</h1>
              <span className="text-[11px] font-bold bg-purple-500/30 border border-purple-300 text-purple-100 px-2.5 py-0.5 rounded-full">
                มหาวิทยาลัย & สถาบันการศึกษา
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-200">
              {universityProfile?.campus || 'วิทยาเขตหลัก'} • ผู้ประสานงาน: {universityProfile?.contactPerson || 'ฝ่ายแนะแนวอาชีพ'}
            </p>
            <p className="text-xs text-purple-200/80">
              {universityProfile?.description || 'ศูนย์ส่งเสริมการมีงานทำและพัฒนาศักยภาพบัณฑิต'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-xs font-bold transition border border-white/20"
          >
            แก้ไขข้อมูลสถาบัน
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>เพิ่มข้อมูลนักศึกษาใหม่</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">นักศึกษาในระบบทั้งหมด</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            {stats?.totalStudents || students.length} คน
          </p>
          <span className="text-[11px] text-purple-600 font-medium">สังกัดมหาวิทยาลัยนี้</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">อัตราการได้งานทำ (Employment Rate)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.employmentRate || 0}%
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">ได้งานทำ + กำลังฝึกงาน</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">มีงานทำแล้ว (Employed)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {stats?.employedCount || 0} คน
          </p>
          <span className="text-[11px] text-blue-600 font-medium">เข้าทำงานในองค์กรแล้ว</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">กำลังมองหางาน (Looking for Job)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {stats?.unemployedCount || 0} คน
          </p>
          <span className="text-[11px] text-amber-600 font-medium">ต้องการโอกาสและการแนะแนว</span>
        </div>
      </div>

      {/* Top Hiring Companies & Faculty Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>บริษัทพันธมิตรที่รับนักศึกษาเข้าทำงาน (Top Hiring Companies)</span>
          </h3>

          {stats?.topCompanies?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.topCompanies.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs"
                >
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                    {c.count} คน
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              ยังไม่มีการบันทึกบริษัทที่รับเข้าทำงาน
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>การกระจายตัวตามคณะ (Faculty Distribution)</span>
          </h3>

          {stats?.facultyBreakdown && Object.keys(stats.facultyBreakdown).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(stats.facultyBreakdown).map(([faculty, count]: any, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs"
                >
                  <span className="font-medium text-slate-700">{faculty}</span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-full">
                    {count} คน
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">ไม่มีข้อมูลคณะ</p>
          )}
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              ทะเบียนรายชื่อนักศึกษาและการติดตามการมีงานทำ ({filteredStudents.length} คน)
            </h3>
            <p className="text-xs text-slate-500">บันทึก อัปเดตสถานะการทำงาน และตรวจสอบการสมัครงาน</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มนักศึกษา</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัสนักศึกษา, อีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="ALL">สถานะการทำงานทั้งหมด</option>
              <option value="EMPLOYED">มีงานทำแล้ว (Employed)</option>
              <option value="INTERNING">กำลังฝึกงาน (Interning)</option>
              <option value="STUDYING">กำลังศึกษาอยู่ (Studying)</option>
              <option value="UNEMPLOYED">กำลังมองหางาน (Unemployed)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ชื่อ-นามสกุล / รหัสนักศึกษา</th>
                  <th className="px-5 py-3.5">คณะ & สาขาวิชา</th>
                  <th className="px-5 py-3.5">สถานะการมีงานทำ</th>
                  <th className="px-5 py-3.5">สถานที่ทำงาน / บริษัท</th>
                  <th className="px-5 py-3.5">การสมัครงาน</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => {
                  const p = s.jobSeekerProfile;
                  const statusMeta = EMPLOYMENT_STATUS_MAP[p?.employmentStatus || 'UNEMPLOYED'];

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                            alt={s.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                            <p className="text-[11px] text-purple-700 font-semibold font-mono">
                              {p?.studentId || 'ไม่มีรหัส'} • {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{p?.faculty || '-'}</p>
                        <p className="text-[11px] text-slate-400">{p?.major || '-'} (จบปี {p?.graduationYear || '-'})</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${statusMeta?.badge}`}>
                          {statusMeta?.label || p?.employmentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {p?.companyEmployed ? (
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            {p.companyEmployed}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ยังไม่มีข้อมูล -</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-blue-600">
                          {s.applications?.length || 0} ตำแหน่ง
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT STUDENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingStudent ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มข้อมูลนักศึกษาใหม่'}
                </h3>
                <p className="text-xs text-slate-500">บันทึกข้อมูลเพื่อติดตามผลการได้งานทำ</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingStudent)}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสนักศึกษา</label>
                  <input
                    type="text"
                    placeholder="เช่น PWK65-00123"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ปีที่สำเร็จการศึกษา</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">คณะ</label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชา</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะการมีงานทำ</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="UNEMPLOYED">กำลังมองหางาน (Unemployed)</option>
                    <option value="STUDYING">กำลังศึกษาอยู่ (Studying)</option>
                    <option value="INTERNING">กำลังฝึกงาน / สหกิจ (Interning)</option>
                    <option value="EMPLOYED">มีงานทำแล้ว (Employed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">บริษัท / สถานที่ทำงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น TechSiam, SCB, Google"
                    value={formData.companyEmployed}
                    onChange={(e) => setFormData({ ...formData, companyEmployed: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
