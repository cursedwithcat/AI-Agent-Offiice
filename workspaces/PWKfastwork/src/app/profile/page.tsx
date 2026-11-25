'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  GraduationCap,
  ShieldCheck,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Phone,
  Mail,
  Camera,
} from 'lucide-react';
import { ROLE_LABELS } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [profileData, setProfileData] = useState<any>({});
  const [availableUnis, setAvailableUnis] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => {
        if (data.universities) setAvailableUnis(data.universities);
      })
      .catch((err) => console.error('Error fetching universities:', err));
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      const u = data.user;
      setCurrentUser(u);
      setName(u.name || '');
      setPhone(u.phone || '');
      setBio(u.bio || '');
      setAvatar(u.avatar || '');

      if (u.role === 'JOB_SEEKER') {
        const jsp = u.jobSeekerProfile || {};
        setProfileData({
          ...jsp,
          universityName: jsp.university?.universityProfile?.universityName || jsp.university?.name || '',
        });
      } else if (u.role === 'COMPANY') {
        setProfileData(u.companyProfile || {});
      } else if (u.role === 'UNIVERSITY') {
        setProfileData(u.universityProfile || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          bio,
          avatar,
          profileData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึก');

      setMessage('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!');
      await fetchProfile();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดโปรไฟล์...</p>
      </div>
    );
  }

  const roleMeta = ROLE_LABELS[currentUser?.role] || { label: currentUser?.role, badge: 'bg-slate-100 text-slate-700' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href={
          currentUser?.role === 'JOB_SEEKER'
            ? '/dashboard/seeker'
            : currentUser?.role === 'COMPANY'
            ? '/dashboard/company'
            : currentUser?.role === 'UNIVERSITY'
            ? '/dashboard/university'
            : '/dashboard/admin'
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับสู่หน้าแดชบอร์ด</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleMeta.badge}`}>
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">ข้อมูลทั่วไป (General Information)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อที่แสดงในระบบ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์รูปภาพโปรไฟล์ (Avatar URL)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประวัติโดยย่อ / คำอธิบาย (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="แนะนำตัวหรือวิสัยทัศน์ของคุณ..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none font-sans"
              />
            </div>
          </div>

          {/* Role-Specific Profile Section */}
          {currentUser?.role === 'JOB_SEEKER' && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-blue-600 text-sm">ข้อมูลสำหรับผู้หางาน & นักศึกษา</h3>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  มหาวิทยาลัย / สถาบันการศึกษา (ถ้าเป็นนักศึกษา)
                </label>
                <input
                  type="text"
                  list="profile-universities-list"
                  placeholder="เช่น มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK"
                  value={profileData.universityName || ''}
                  onChange={(e) => setProfileData({ ...profileData, universityName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
                <datalist id="profile-universities-list">
                  {availableUnis.map((u: any) => (
                    <option key={u.id} value={u.name}>
                      {u.campus ? `${u.name} (${u.campus})` : u.name}
                    </option>
                  ))}
                </datalist>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 mt-1">
                  <span>* กรอกชื่อมหาวิทยาลัยของคุณ ระบบจะเชื่อมโยงข้อมูลกับระบบของมหาวิทยาลัยนั้นๆ อัตโนมัติ</span>
                  {currentUser?.jobSeekerProfile?.university && (
                    <span className="text-purple-600 font-bold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                      สังกัดปัจจุบัน: {currentUser.jobSeekerProfile.university.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่งงานที่สนใจ (Job Title)
                  </label>
                  <input
                    type="text"
                    value={profileData.title || ''}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสนักศึกษา (Student ID)
                  </label>
                  <input
                    type="text"
                    value={profileData.studentId || ''}
                    onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">คณะ</label>
                  <input
                    type="text"
                    value={profileData.faculty || ''}
                    onChange={(e) => setProfileData({ ...profileData, faculty: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชา</label>
                  <input
                    type="text"
                    value={profileData.major || ''}
                    onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ปีที่สำเร็จการศึกษา</label>
                  <input
                    type="number"
                    value={profileData.graduationYear || ''}
                    onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ทักษะและความสามารถ (คั่นด้วยจุลภาค)
                </label>
                <input
                  type="text"
                  value={profileData.skills || ''}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  placeholder="เช่น React, Python, UI Design, SQL, Docker"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลิงก์เรซูเม / CV (URL)
                  </label>
                  <input
                    type="url"
                    value={profileData.resumeUrl || ''}
                    onChange={(e) => setProfileData({ ...profileData, resumeUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลิงก์พอร์ตโฟลิโอ / GitHub / ผลงาน
                  </label>
                  <input
                    type="url"
                    value={profileData.portfolioUrl || ''}
                    onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {currentUser?.role === 'COMPANY' && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-emerald-600 text-sm">ข้อมูลบริษัทและองค์กร</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่อุตสาหกรรม
                  </label>
                  <input
                    type="text"
                    value={profileData.industry || ''}
                    onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ตั้งบริษัท
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เว็บไซต์บริษัท
                </label>
                <input
                  type="url"
                  value={profileData.website || ''}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายองค์กรและวัฒนธรรมการทำงาน
                </label>
                <textarea
                  rows={3}
                  value={profileData.description || ''}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {currentUser?.role === 'UNIVERSITY' && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-purple-600 text-sm">ข้อมูลมหาวิทยาลัยและสถาบัน</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วิทยาเขต / Campus
                  </label>
                  <input
                    type="text"
                    value={profileData.campus || ''}
                    onChange={(e) => setProfileData({ ...profileData, campus: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ประสานงาน / ฝ่ายแนะแนวอาชีพ
                  </label>
                  <input
                    type="text"
                    value={profileData.contactPerson || ''}
                    onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เว็บไซต์มหาวิทยาลัย
                </label>
                <input
                  type="url"
                  value={profileData.website || ''}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
