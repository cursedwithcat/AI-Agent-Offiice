'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Building2, GraduationCap, ShieldAlert, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RoleSwitcherModal({ isOpen, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'JOB_SEEKER',
      name: 'ธนกฤต วงศ์สว่าง (ผู้หางาน / นักศึกษา)',
      email: 'seeker1@gmail.com',
      badge: 'ผู้หางาน',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-500',
      icon: UserCheck,
      desc: 'ค้นหางาน ส่งใบสมัคร ติดตามสถานะสัมภาษณ์ และอัปเดตเรซูเม',
      dashboardPath: '/dashboard/seeker',
    },
    {
      role: 'COMPANY',
      name: 'TechSiam Innovation (บริษัท / นายจ้าง)',
      email: 'hr@techsiam.co.th',
      badge: 'บริษัท',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500',
      icon: Building2,
      desc: 'ลงประกาศรับสมัครงาน จัดการใบสมัคร และนัดสัมภาษณ์ผู้สมัคร',
      dashboardPath: '/dashboard/company',
    },
    {
      role: 'UNIVERSITY',
      name: 'มหาวิทยาลัย PWK (มหาวิทยาลัย / สถาบัน)',
      email: 'career@pwk-uni.ac.th',
      badge: 'มหาวิทยาลัย',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200 hover:border-purple-500',
      icon: GraduationCap,
      desc: 'ติดตามอัตราการมีงานทำของนักศึกษา บันทึกประวัติ และดูพันธมิตร',
      dashboardPath: '/dashboard/university',
    },
    {
      role: 'ADMIN',
      name: 'ผู้ดูแลระบบกลาง (Admin PWKfastwork)',
      email: 'admin@pwkfastwork.com',
      badge: 'แอดมิน',
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200 hover:border-rose-500',
      icon: ShieldAlert,
      desc: 'จัดการผู้ใช้ทุกบทบาท ตรวจสอบประกาศงาน และดูสถิติภาพรวมทั้งระบบ',
      dashboardPath: '/dashboard/admin',
    },
  ];

  const handleSwitch = async (email: string, targetPath: string, roleName: string) => {
    setLoadingRole(roleName);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
        }),
      });

      if (res.ok) {
        onClose();
        if (onSuccess) onSuccess();
        router.push(targetPath);
        router.refresh();
      } else {
        alert('เกิดข้อผิดพลาดในการสลับบัญชี');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">ทดลองใช้งาน 4 บทบาท (1-Click Switch)</h3>
              <p className="text-xs text-slate-500">เลือกบทบาทที่ต้องการเพื่อทดสอบระบบได้ทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Cards */}
        <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {demoAccounts.map((item) => {
            const Icon = item.icon;
            const isLoading = loadingRole === item.role;

            return (
              <button
                key={item.role}
                disabled={isLoading}
                onClick={() => handleSwitch(item.email, item.dashboardPath, item.role)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${item.bgColor} group`}
              >
                <div className={`p-3 rounded-xl text-white ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {item.name}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.color} text-white`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                    <span className="font-sans text-slate-500">อีเมล:</span> {item.email} (รหัสผ่าน: password123)
                  </p>
                </div>
                <div className="self-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg bg-white shadow-sm border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition`}>
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าใช้งาน →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>รหัสผ่านทดสอบทุกบัญชีคือ: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">password123</code></span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
