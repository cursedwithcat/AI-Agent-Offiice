import React from 'react';
import {
  GraduationCap,
  Building2,
  Landmark,
  ShieldCheck,
  Palette,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const PersonaSwitcher: React.FC = () => {
  const { activeRole, setActiveRole, switchPersona, isLoading } = useAuth();

  const handleRoleSelect = async (role: UserRole | 'TOKENS') => {
    if (isLoading) return;
    if (role === 'TOKENS') {
      setActiveRole('TOKENS');
    } else {
      await switchPersona(role);
    }
  };

  const getButtonClass = (target: UserRole | 'TOKENS') => {
    const isActive = activeRole === target;
    return `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
    }`;
  };

  return (
    <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
      <button
        onClick={() => handleRoleSelect('SEEKER')}
        className={getButtonClass('SEEKER')}
        disabled={isLoading}
      >
        <GraduationCap className="w-4 h-4 text-emerald-400" />
        <span>1. ผู้หางาน / นิสิต</span>
      </button>

      <button
        onClick={() => handleRoleSelect('COMPANY')}
        className={getButtonClass('COMPANY')}
        disabled={isLoading}
      >
        <Building2 className="w-4 h-4 text-blue-400" />
        <span>2. บริษัท (ATS)</span>
      </button>

      <button
        onClick={() => handleRoleSelect('UNIVERSITY')}
        className={getButtonClass('UNIVERSITY')}
        disabled={isLoading}
      >
        <Landmark className="w-4 h-4 text-purple-400" />
        <span>3. มหาวิทยาลัย (Analytics)</span>
      </button>

      <button
        onClick={() => handleRoleSelect('ADMIN')}
        className={getButtonClass('ADMIN')}
        disabled={isLoading}
      >
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span>4. แอดมิน (Governance)</span>
      </button>

      <button
        onClick={() => handleRoleSelect('TOKENS')}
        className={getButtonClass('TOKENS')}
        disabled={isLoading}
      >
        <Palette className="w-4 h-4 text-pink-400" />
        <span>5. Design Tokens</span>
      </button>

      {isLoading && (
        <span className="px-2 text-xs text-slate-400 flex items-center gap-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
        </span>
      )}
    </nav>
  );
};
