'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Building2,
  GraduationCap,
  Shield,
  ChevronDown,
} from 'lucide-react';
import RoleSwitcherModal from './RoleSwitcherModal';
import { ROLE_LABELS } from '@/lib/utils';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY' | 'UNIVERSITY' | 'ADMIN';
  avatar?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user || null);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'JOB_SEEKER':
        return '/dashboard/seeker';
      case 'COMPANY':
        return '/dashboard/company';
      case 'UNIVERSITY':
        return '/dashboard/university';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">PWK</span>
                  <span className="font-extrabold text-xl tracking-tight text-blue-600">fastwork</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                  Job Portal & Career Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                href="/jobs"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/jobs'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ค้นหางาน
              </Link>
              <Link
                href="/dashboard/company"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition"
              >
                สำหรับบริษัท
              </Link>
              <Link
                href="/dashboard/university"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition"
              >
                สำหรับมหาวิทยาลัย
              </Link>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Button */}
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>สลับบทบาททดสอบ (4 Roles)</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 transition border border-slate-200/60"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div className="text-left leading-none">
                    <p className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {currentUser.name}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold mt-0.5 px-1.5 py-0.2 rounded ${
                        ROLE_LABELS[currentUser.role]?.badge || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">เข้าสู่ระบบในชื่อ</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink(currentUser.role)}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>แดชบอร์ด ({ROLE_LABELS[currentUser.role]?.label || 'หน้าควบคุม'})</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>ข้อมูลส่วนตัว / โปรไฟล์</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="p-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg"
              title="สลับบทบาท"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
            {currentUser && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${ROLE_LABELS[currentUser.role]?.badge}`}>
                    {ROLE_LABELS[currentUser.role]?.label}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                ค้นหางานทั้งหมด
              </Link>
              {currentUser && (
                <Link
                  href={getDashboardLink(currentUser.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  ไปยังแดชบอร์ด ({ROLE_LABELS[currentUser.role]?.label})
                </Link>
              )}
              <Link
                href="/dashboard/company"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                สำหรับบริษัท / ลงประกาศงาน
              </Link>
              <Link
                href="/dashboard/university"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                สำหรับมหาวิทยาลัย / ติดตามนักศึกษา
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSwitcherOpen(true);
                }}
                className="w-full py-2.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                สลับบทบาททดลองใช้งาน (4 Roles)
              </button>

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  ออกจากระบบ
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold border border-slate-200 rounded-xl"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold bg-blue-600 text-white rounded-xl"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSuccess={fetchUser}
      />
    </>
  );
}
