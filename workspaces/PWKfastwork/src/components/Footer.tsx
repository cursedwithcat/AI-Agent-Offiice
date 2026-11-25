import React from 'react';
import Link from 'next/link';
import { Briefcase, Shield, CheckCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-white">PWK<span className="text-blue-500">fastwork</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              แพลตฟอร์มศูนย์รวมตำแหน่งงานและพัฒนาสายอาชีพที่ทันสมัย เชื่อมโยง 4 บทบาทหลัก: ผู้หางาน บริษัท มหาวิทยาลัย และผู้ดูแลระบบ เข้าไว้ด้วยกันอย่างไร้รอยต่อ
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> ระบบยืนยันตัวตน 4 บทบาท
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <Shield className="w-3.5 h-3.5" /> ความปลอดภัยระดับสูง
              </span>
            </div>
          </div>

          {/* Col 2: สำหรับผู้ใช้งาน */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              บทบาทผู้ใช้งาน (4 Roles)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/seeker" className="hover:text-blue-400 transition">
                  ผู้หางาน & นักศึกษา
                </Link>
              </li>
              <li>
                <Link href="/dashboard/company" className="hover:text-blue-400 transition">
                  บริษัท & นายจ้าง (ลงประกาศงาน)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/university" className="hover:text-blue-400 transition">
                  มหาวิทยาลัย & สถาบัน (ติดตามการมีงานทำ)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-blue-400 transition">
                  ผู้ดูแลระบบ (Admin Portal)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: หมวดหมู่งาน */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              หมวดหมู่งานยอดนิยม
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/jobs?category=Web+%26+Programming" className="hover:text-blue-400 transition">
                  Web & Programming
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Design+%26+Creative" className="hover:text-blue-400 transition">
                  Design & Creative
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Marketing" className="hover:text-blue-400 transition">
                  Marketing & Advertising
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Data+%26+AI" className="hover:text-blue-400 transition">
                  Data Science & AI
                </Link>
              </li>
              <li>
                <Link href="/jobs?jobType=Internship" className="hover:text-blue-400 transition">
                  ฝึกงาน / สหกิจศึกษา (Internship)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: ช่วยเหลือ */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              เกี่ยวกับระบบ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400">ระบบคัดกรองใบสมัครอัจฉริยะ</span>
              </li>
              <li>
                <span className="text-slate-400">เชื่อมต่อข้อมูลนักศึกษากับมหาวิทยาลัย</span>
              </li>
              <li>
                <span className="text-slate-400">รายงานสถิติการมีงานทำแบบ Realtime</span>
              </li>
              <li>
                <span className="text-slate-400">ฐานข้อมูล SQLite & Prisma ORM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 PWKfastwork. All rights reserved. พัฒนาขึ้นเพื่อการจัดหางานและเชื่อมโยงภาคการศึกษาสู่ภาคธุรกิจ</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Next-Gen Job Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
