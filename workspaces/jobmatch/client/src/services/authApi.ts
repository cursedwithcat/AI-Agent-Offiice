import { apiRequest } from './api';
import { AuthSession } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    return apiRequest<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (payload: {
    email: string;
    password: string;
    role: 'SEEKER' | 'COMPANY' | 'UNIVERSITY';
    profileData: any;
  }): Promise<AuthSession> => {
    return apiRequest<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<{ user: AuthSession['user']; profile: any }> => {
    return apiRequest<{ user: AuthSession['user']; profile: any }>('/api/auth/me');
  },
};
