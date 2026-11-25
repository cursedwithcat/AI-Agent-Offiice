import { apiRequest } from './api';
import { AdminStats, AuditLog, Job, KYBStatus, User } from '../types';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const raw = await apiRequest<any>('/api/admin/stats');
    const s = raw?.stats || raw || {};
    return {
      users: {
        total: s.totalUsers ?? 0,
        seekers: s.totalSeekers ?? 0,
        companies: s.totalCompanies ?? 0,
        universities: s.totalUniversities ?? 0,
        pendingKyb: s.pendingKybCount ?? 0,
      },
      jobs: {
        total: s.totalJobs ?? 0,
        published: s.totalJobs ?? 0,
        suspended: 0,
      },
      applications: {
        total: s.totalApplications ?? 0,
        hired: s.totalHired ?? 0,
      },
      ...s,
    };
  },

  getUsers: async (role?: string, status?: string): Promise<User[]> => {
    const query = new URLSearchParams();
    if (role && role !== 'ALL') query.append('role', role);
    if (status && status !== 'ALL') query.append('status', status);
    const qs = query.toString();
    const res = await apiRequest<{ success?: boolean; users?: User[] } | User[]>(`/api/admin/users${qs ? `?${qs}` : ''}`);
    if (Array.isArray(res)) return res;
    return res.users || [];
  },

  updateKYB: async (
    userId: number,
    kybStatus: KYBStatus
  ): Promise<{ success: boolean; kybStatus: KYBStatus }> => {
    return apiRequest<{ success: boolean; kybStatus: KYBStatus }>(`/api/admin/users/${userId}/kyb`, {
      method: 'PATCH',
      body: JSON.stringify({ kybStatus }),
    });
  },

  updateUserStatus: async (
    userId: number,
    status: string
  ): Promise<{ success: boolean; status: string }> => {
    return apiRequest<{ success: boolean; status: string }>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getJobs: async (): Promise<Job[]> => {
    const res = await apiRequest<{ success?: boolean; jobs?: Job[] } | Job[]>('/api/admin/jobs');
    if (Array.isArray(res)) return res;
    return res.jobs || [];
  },

  moderateJob: async (
    jobId: number,
    status: 'PUBLISHED' | 'SUSPENDED' | 'CLOSED',
    moderationNote?: string
  ): Promise<{ success: boolean; status: string }> => {
    return apiRequest<{ success: boolean; status: string }>(`/api/admin/jobs/${jobId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status, moderationNote }),
    });
  },

  getAuditLogs: async (limit: number = 50): Promise<AuditLog[]> => {
    const res = await apiRequest<{ logs?: AuditLog[]; total?: number } | AuditLog[]>(`/api/admin/audit-logs?limit=${limit}`);
    if (Array.isArray(res)) return res;
    return res.logs || [];
  },
};
