import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession, UserRole } from '../types';
import { authApi } from '../services/authApi';
import { useToast } from './ToastContext';

export interface PersonaSeedAccount {
  role: UserRole;
  label: string;
  email: string;
  subtitle: string;
}

export const PRESET_PERSONAS: Record<UserRole, PersonaSeedAccount> = {
  SEEKER: {
    role: 'SEEKER',
    label: '1. ผู้หางาน / นักศึกษา',
    email: 'somchai.s@student.chula.ac.th',
    subtitle: 'Somchai Saetang (CU CS Senior)',
  },
  COMPANY: {
    role: 'COMPANY',
    label: '2. บริษัท (ATS)',
    email: 'hr@scg.co.th',
    subtitle: 'SCG Digital Ventures HR',
  },
  UNIVERSITY: {
    role: 'UNIVERSITY',
    label: '3. มหาวิทยาลัย (Analytics)',
    email: 'career@chula.ac.th',
    subtitle: 'Chulalongkorn University Career Center',
  },
  ADMIN: {
    role: 'ADMIN',
    label: '4. แอดมิน (Governance)',
    email: 'admin@jobmatch.co',
    subtitle: 'Platform Root Administrator',
  },
};

interface AuthContextType {
  user: AuthSession['user'] | null;
  profile: any | null;
  activeRole: UserRole | 'TOKENS';
  setActiveRole: (role: UserRole | 'TOKENS') => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    role: 'SEEKER' | 'COMPANY' | 'UNIVERSITY';
    profileData: any;
  }) => Promise<void>;
  logout: () => void;
  switchPersona: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession['user'] | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | 'TOKENS'>('SEEKER');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('jobmatch_token');
    if (!token) {
      setUser(null);
      setProfile(null);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setActiveRole(data.user.role);
    } catch (err) {
      localStorage.removeItem('jobmatch_token');
      setUser(null);
      setProfile(null);
    }
  }, []);

  const switchPersona = useCallback(
    async (role: UserRole) => {
      setIsLoading(true);
      try {
        const persona = PRESET_PERSONAS[role];
        const session = await authApi.login(persona.email, 'password123');
        localStorage.setItem('jobmatch_token', session.token);
        setUser(session.user);
        setProfile(session.profile);
        setActiveRole(role);
        showToast(`สลับบทบาทสำเร็จ: ${persona.label} (${persona.subtitle})`, 'info');
      } catch (err: any) {
        showToast(err.message || 'ไม่สามารถสลับบทบาทได้', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await authApi.login(email, password);
      localStorage.setItem('jobmatch_token', session.token);
      setUser(session.user);
      setProfile(session.profile);
      setActiveRole(session.user.role);
      showToast(`เข้าสู่ระบบสำเร็จ: ${session.user.email}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    role: 'SEEKER' | 'COMPANY' | 'UNIVERSITY';
    profileData: any;
  }) => {
    setIsLoading(true);
    try {
      const session = await authApi.register(payload);
      localStorage.setItem('jobmatch_token', session.token);
      setUser(session.user);
      setProfile(session.profile);
      setActiveRole(session.user.role);
      showToast(`ลงทะเบียนและเข้าสู่ระบบสำเร็จ!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'ลงทะเบียนไม่สำเร็จ', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jobmatch_token');
    setUser(null);
    setProfile(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Initialize: Attempt to log in as default Seeker if no active session
  useEffect(() => {
    const init = async () => {
      const existingToken = localStorage.getItem('jobmatch_token');
      if (existingToken) {
        try {
          const data = await authApi.getMe();
          setUser(data.user);
          setProfile(data.profile);
          setActiveRole(data.user.role);
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem('jobmatch_token');
        }
      }
      // Auto-login default persona (Seeker) for instant live demo experience
      await switchPersona('SEEKER');
      setIsLoading(false);
    };
    init();
  }, [switchPersona]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeRole,
        setActiveRole,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
