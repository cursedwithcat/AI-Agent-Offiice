'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'JOB_SEEKER';

  const [role, setRole] = useState<'JOB_SEEKER' | 'COMPANY' | 'UNIVERSITY' | 'ADMIN'>(
    initialRole as any
  );

  // Common
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Seeker
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [studentId, setStudentId] = useState('');

  // Company
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('เทคโนโลยีและซอฟต์แวร์');
  const [location, setLocation] = useState('กรุงเทพมหานคร');
  const [website, setWebsite] = useState('');

  // University
  const [universityName, setUniversityName] = useState('');
  const [campus, setCampus] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUnis, setAvailableUnis] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => {
        if (data.universities) setAvailableUnis(data.universities);
      })
      .catch((err) => console.error('Error fetching universities:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      role,
      name,
      email,
      password,
      phone,
    };

    if (role === 'JOB_SEEKER') {
      payload.title = title;
      payload.skills = skills;
      payload.faculty = faculty;
      payload.major = major;
      payload.studentId = studentId;
      payload.universityName = universityName;
    } else if (role === 'COMPANY') {
      payload.companyName = companyName || name;
      payload.industry = industry;
      payload.location = location;
      payload.website = website;
    } else if (role === 'UNIVERSITY') {
      payload.universityName = universityName || name;
      payload.campus = campus;
      payload.contactPerson = contactPerson || name;
      payload.website = website;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      // Redirect by role
      if (role === 'JOB_SEEKER') router.push('/dashboard/seeker');
      else if (role === 'COMPANY') router.push('/dashboard/company');
      else if (role === 'UNIVERSITY') router.push('/dashboard/university');
      else if (role === 'ADMIN') router.push('/dashboard/admin');
      else router.push('/');

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900">
              PWK<span className="text-blue-600">fastwork</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">สร้างบัญชีผู้ใช้ใหม่</h2>
          <p className="text-xs text-slate-500">
            เลือกบทบาทของคุณเพื่อเริ่มต้นใช้งานระบบที่ออกแบบมาสำหรับคุณโดยเฉพาะ
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('JOB_SEEKER')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
              role === 'JOB_SEEKER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ผู้หางาน</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('COMPANY')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
              role === 'COMPANY'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>บริษัท</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('UNIVERSITY')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
              role === 'UNIVERSITY'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>มหาวิทยาลัย</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
              role === 'ADMIN'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>แอดมิน</span>
          </button>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === 'COMPANY'
                    ? 'ชื่อบริษัท / องค์กร'
                    : role === 'UNIVERSITY'
                    ? 'ชื่อมหาวิทยาลัย / สถาบัน'
                    : 'ชื่อ - นามสกุล'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    role === 'COMPANY'
                      ? 'เช่น TechSiam Innovation'
                      : role === 'UNIVERSITY'
                      ? 'เช่น มหาวิทยาลัย PWK'
                      : 'สมชาย ใจมั่น'
                  }
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (role === 'COMPANY') setCompanyName(e.target.value);
                    if (role === 'UNIVERSITY') setUniversityName(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  placeholder="081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Role Specific Fields: JOB_SEEKER */}
            {role === 'JOB_SEEKER' && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-blue-600 block">ข้อมูลสายงานและการศึกษา</span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    มหาวิทยาลัย / สถาบันการศึกษา (ถ้าเป็นนักศึกษา)
                  </label>
                  <input
                    type="text"
                    list="register-universities-list"
                    placeholder="เช่น มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK"
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <datalist id="register-universities-list">
                    {availableUnis.map((u: any) => (
                      <option key={u.id} value={u.name}>
                        {u.campus ? `${u.name} (${u.campus})` : u.name}
                      </option>
                    ))}
                  </datalist>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * พิมพ์หรือเลือกชื่อสถาบัน ระบบจะเชื่อมโยงโปรไฟล์เข้าสู่ระบบของมหาวิทยาลัยโดยอัตโนมัติ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ตำแหน่งที่ต้องการ / ความเชี่ยวชาญ
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Full Stack Developer, UX Designer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รหัสนักศึกษา (หากสังกัดสถาบัน)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น PWK65-001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">คณะ</label>
                    <input
                      type="text"
                      placeholder="เช่น วิศวกรรมศาสตร์, วิทยาการคอมพิวเตอร์"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชา</label>
                    <input
                      type="text"
                      placeholder="เช่น ซอฟต์แวร์, การตลาดดิจิทัล"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ทักษะสำคัญ (Skills) คั่นด้วยจุลภาค
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น React, Next.js, Node.js, SQL, TailwindCSS"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Role Specific Fields: COMPANY */}
            {role === 'COMPANY' && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-emerald-600 block">ข้อมูลบริษัทและสถานที่ตั้ง</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      หมวดหมู่อุตสาหกรรม
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="เทคโนโลยีและซอฟต์แวร์">เทคโนโลยีและซอฟต์แวร์ (IT & Software)</option>
                      <option value="ดีไซน์และสื่อโฆษณา">ดีไซน์และสื่อโฆษณา (Creative & Media)</option>
                      <option value="การเงินและฟินเทค">การเงินและฟินเทค (Banking & Fintech)</option>
                      <option value="อีคอมเมิร์ซและการค้าปลีก">อีคอมเมิร์ซและการค้าปลีก (E-commerce)</option>
                      <option value="การศึกษาและสถาบัน">การศึกษาและพัฒนาบุคลากร</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      สถานที่ตั้งบริษัท
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น กรุงเทพฯ (BTS พร้อมพงษ์)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เว็บไซต์บริษัท (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://mycompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Role Specific Fields: UNIVERSITY */}
            {role === 'UNIVERSITY' && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-purple-600 block">ข้อมูลสถาบันการศึกษา</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      วิทยาเขต / ศูนย์การศึกษา
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น วิทยาเขตหลัก พระราม 9"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อผู้ประสานงาน / ฝ่ายแนะแนวอาชีพ
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น อาจารย์ ดร. วินัย ชูเกียรติ"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เว็บไซต์มหาวิทยาลัย (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.my-university.ac.th"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              <span>{loading ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครสมาชิก'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">กำลังโหลดฟอร์มสมัครสมาชิก...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
