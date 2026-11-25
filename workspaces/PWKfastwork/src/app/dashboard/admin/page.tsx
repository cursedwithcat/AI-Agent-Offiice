'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  Activity,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  Flame,
  Star,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { ROLE_LABELS, formatThaiDateTime, formatThaiDate } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab: 'USERS' | 'JOBS' | 'LOGS'
  const [activeTab, setActiveTab] = useState<'USERS' | 'JOBS' | 'LOGS'>('USERS');

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user || userData.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setCurrentUser(userData.user);

      // Fetch stats & logs
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats);
      setRecentLogs(statsData.recentLogs || []);

      // Fetch all users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // Fetch all jobs
      const jobsRes = await fetch('/api/admin/jobs');
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${userName}"? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบอย่างถาวร`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJobFeatured = async (jobId: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, featured: !currentVal }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJobUrgent = async (jobId: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, urgent: !currentVal }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('ยืนยันลบตำแหน่งงานนี้ออกจากระบบ?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดระบบจัดการผู้ดูแลระบบ (Admin)...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-600/30 border border-rose-400 flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-8 h-8 text-rose-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser?.name}</h1>
              <span className="text-[11px] font-bold bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              ศูนย์ควบคุมระบบกลาง PWKfastwork (User Registry, RBAC, Job Moderation & Audit Logs)
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-xs font-bold transition flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ผู้ใช้งานในระบบทั้งหมด</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {stats?.totalUsers || users.length}
          </p>
          <div className="flex gap-1 text-[10px] text-slate-500 mt-1 font-medium">
            <span>หา: {stats?.seekersCount}</span> • 
            <span>บ: {stats?.companiesCount}</span> • 
            <span>ม: {stats?.universitiesCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ประกาศงานที่เปิดรับ</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {stats?.activeJobs || jobs.length} / {stats?.totalJobs || jobs.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">สถานะ Active ทั่วระบบ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">ใบสมัครงานทั้งหมด</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
            {stats?.totalApplications || 0}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">อัตราการสมัครงาน</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">รับเข้าทำงานสำเร็จ (Hired)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.acceptedApplications || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">ผ่านการคัดเลือกเรียบร้อย</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'text-rose-700 border-b-2 border-rose-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ฐานข้อมูลผู้ใช้งานทั้งหมด ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('JOBS')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'JOBS'
              ? 'text-rose-700 border-b-2 border-rose-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>ตรวจสอบและจัดการประกาศงาน ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'LOGS'
              ? 'text-rose-700 border-b-2 border-rose-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>บันทึกกิจกรรมและประวัติระบบ ({recentLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DATABASE MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมลผู้ใช้..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="ALL">ทุกบทบาท (4 Roles)</option>
                <option value="JOB_SEEKER">ผู้หางาน / นักศึกษา (Seeker)</option>
                <option value="COMPANY">บริษัท / นายจ้าง (Company)</option>
                <option value="UNIVERSITY">มหาวิทยาลัย / สถาบัน (University)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="ALL">ทุกสถานะบัญชี</option>
                <option value="ACTIVE">ปกติ (ACTIVE)</option>
                <option value="SUSPENDED">ระงับการใช้งาน (SUSPENDED)</option>
              </select>
            </div>
          </div>

          {/* User Registry Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">ผู้ใช้งาน / อีเมล</th>
                    <th className="px-5 py-3.5">บทบาท (Role)</th>
                    <th className="px-5 py-3.5">สถานะบัญชี</th>
                    <th className="px-5 py-3.5">ข้อมูลเกี่ยวข้อง</th>
                    <th className="px-5 py-3.5">วันที่สมัคร</th>
                    <th className="px-5 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => {
                    const roleInfo = ROLE_LABELS[u.role] || { label: u.role, badge: 'bg-slate-100 text-slate-700' };

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${roleInfo.badge} focus:outline-none`}
                          >
                            <option value="JOB_SEEKER">JOB_SEEKER (ผู้หางาน)</option>
                            <option value="COMPANY">COMPANY (บริษัท)</option>
                            <option value="UNIVERSITY">UNIVERSITY (มหาวิทยาลัย)</option>
                            <option value="ADMIN">ADMIN (แอดมิน)</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <Unlock className="w-3 h-3" /> ปกติ
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" /> ระงับ
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {u.role === 'JOB_SEEKER' && (
                            <span>สมัครงาน {u._count?.applications || 0} ตำแหน่ง</span>
                          )}
                          {u.role === 'COMPANY' && (
                            <span>ลงประกาศ {u._count?.jobs || 0} งาน</span>
                          )}
                          {u.role === 'UNIVERSITY' && (
                            <span>มีนักศึกษา {u._count?.studentProfiles || 0} คน</span>
                          )}
                          {u.role === 'ADMIN' && <span className="text-rose-600 font-bold">Admin สิทธิ์เต็ม</span>}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {formatThaiDate(u.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="ลบบัญชีผู้ใช้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOBS MODERATION */}
      {activeTab === 'JOBS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">ตำแหน่งงาน / บริษัท</th>
                    <th className="px-5 py-3.5">หมวดหมู่</th>
                    <th className="px-5 py-3.5">สถานะ</th>
                    <th className="px-5 py-3.5">ป้ายพิเศษ</th>
                    <th className="px-5 py-3.5">ผู้สมัคร</th>
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
                          บริษัท: {job.company.name} ({job.company.email})
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{job.category}</span>
                        <span className="block text-[11px] text-slate-400">{job.jobType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-x-2">
                        <button
                          onClick={() => handleToggleJobFeatured(job.id, job.featured)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            job.featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Star className="w-3 h-3 inline mr-0.5" /> แนะนำ
                        </button>
                        <button
                          onClick={() => handleToggleJobUrgent(job.id, job.urgent)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            job.urgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Flame className="w-3 h-3 inline mr-0.5" /> ด่วน
                        </button>
                      </td>
                      <td className="px-5 py-4 font-bold text-blue-600">
                        {job._count?.applications || 0} คน
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
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
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">บันทึกกิจกรรมการจัดการของระบบ (Audit Logs)</h3>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3.5 bg-slate-50 rounded-xl text-xs border border-slate-100"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-800">เป้าหมาย: {log.target || '-'}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ดำเนินการโดย: {log.admin?.name} ({log.admin?.email})
                  </p>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatThaiDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
