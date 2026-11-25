import React from 'react';
import { Smartphone, Monitor, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { PersonaSwitcher } from './PersonaSwitcher';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  isMobileSim: boolean;
  onToggleMobileSim: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileSim,
  onToggleMobileSim,
  onOpenAuthModal,
}) => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* LOGO & TITLE */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-growth-500 flex items-center justify-center font-bold text-base tracking-wider text-white shadow-inner">
            JM
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Jobmatch{' '}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono border border-brand-500/30">
                Production UI v1.0
              </span>
            </span>
            <p className="text-[11px] text-slate-400">
              Royal Blue Modern Theme (#2563EB) • 4-Sided Talent Platform
            </p>
          </div>
        </div>

        {/* PERSONA SWITCHER TABS */}
        <div className="order-3 lg:order-2 w-full lg:w-auto">
          <PersonaSwitcher />
        </div>

        {/* QUICK CONTROLS & ACTIVE USER PILL */}
        <div className="order-2 lg:order-3 flex items-center gap-2">
          {/* MOBILE / DESKTOP SIMULATOR TOGGLE */}
          <button
            onClick={onToggleMobileSim}
            className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isMobileSim
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="สลับโหมดจำลองมือถือ (Mobile Responsive Simulation) / Desktop"
          >
            {isMobileSim ? (
              <>
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline text-[11px]">Mobile View</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 text-brand-300" />
                <span className="hidden sm:inline text-[11px]">Desktop View</span>
              </>
            )}
          </button>

          {/* USER SESSION */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-full bg-brand-600/40 text-brand-300 flex items-center justify-center font-bold text-[10px]">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-200 text-[11px] max-w-[130px] truncate">
                  {profile?.full_name || profile?.company_name || profile?.university_name || user.email}
                </div>
                <div className="text-[9px] text-slate-400 font-mono uppercase">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="ออกจากระบบ"
                className="text-slate-400 hover:text-red-400 ml-1 p-1 hover:bg-slate-700/50 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
