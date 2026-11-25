'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserCheck,
  Building2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // Route by role
      const role = data.user.role;
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

  const handleQuickLogin = async (quickEmail: string, targetPath: string) => {
    setEmail(quickEmail);
    setPassword('password123');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: quickEmail, password: 'password123' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');

      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900">
              PWK<span className="text-blue-600">fastwork</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">เข้าสู่ระบบเพื่อใช้งาน</h2>
          <p className="text-xs text-slate-500">
            ระบบรองรับผู้ใช้งาน 4 บทบาท พร้อมสิทธิ์การเข้าถึงเฉพาะตัว
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Grid */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 justify-center text-xs font-bold text-slate-700 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>หรือเลือกเข้าสู่ระบบด่วน 4 บทบาท (Demo)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('seeker1@gmail.com', '/dashboard/seeker')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 font-semibold flex items-center gap-2 transition"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">ผู้หางาน</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hr@techsiam.co.th', '/dashboard/company')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 font-semibold flex items-center gap-2 transition"
              >
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">บริษัท</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('career@pwk-uni.ac.th', '/dashboard/university')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-semibold flex items-center gap-2 transition"
              >
                <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">มหาวิทยาลัย</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@pwkfastwork.com', '/dashboard/admin')}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-800 font-semibold flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">แอดมิน</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              สมัครสมาชิกใหม่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
