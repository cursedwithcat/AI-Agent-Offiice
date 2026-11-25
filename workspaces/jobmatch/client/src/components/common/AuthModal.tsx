import React, { useState } from 'react';
import { LogIn, UserPlus, Check, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regRole, setRegRole] = useState<'SEEKER' | 'COMPANY' | 'UNIVERSITY'>('SEEKER');
  const [fullName, setFullName] = useState('');
  const [universityName, setUniversityName] = useState('จุฬาลงกรณ์มหาวิทยาลัย');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        const profileData =
          regRole === 'SEEKER'
            ? {
                full_name: fullName || 'ผู้สมัครงานทดสอบ',
                university_name: universityName,
                faculty: 'คณะวิทยาศาสตร์',
                major: 'วิทยาการคอมพิวเตอร์',
              }
            : regRole === 'COMPANY'
            ? {
                company_name: companyName || 'องค์กรธุรกิจใหม่',
                industry: 'Information Technology',
              }
            : {
                university_name: universityName || 'สถาบันการศึกษา',
              };

        await register({
          email,
          password,
          role: regRole,
          profileData,
        });
      }
      onClose();
    } catch {
      // Error handled in AuthContext with showToast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'login' ? 'เข้าสู่ระบบ (Sign In)' : 'สร้างบัญชีผู้ใช้ใหม่ (Register)'}
      subtitle="ระบบจัดการสิทธิ์ 4 บทบาท (Seeker, Company, University, Admin)"
      icon={
        tab === 'login' ? (
          <LogIn className="w-5 h-5 text-brand-600" />
        ) : (
          <UserPlus className="w-5 h-5 text-growth-600" />
        )
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* TAB TOGGLE */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              tab === 'login'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              tab === 'register'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกบทบาทที่ต้องการสมัคร *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('SEEKER')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    regRole === 'SEEKER'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ผู้หางาน
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('COMPANY')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    regRole === 'COMPANY'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  บริษัท
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('UNIVERSITY')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    regRole === 'UNIVERSITY'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  มหาวิทยาลัย
                </button>
              </div>
            </div>
          )}

          {tab === 'register' && regRole === 'SEEKER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น นายธนากร ใจดี"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {tab === 'register' && regRole === 'COMPANY' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อบริษัท / องค์กร *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="เช่น บริษัท สยามเทค จำกัด"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              อีเมล (Email) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รหัสผ่าน (Password) *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{tab === 'login' ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัครสมาชิก'}</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
