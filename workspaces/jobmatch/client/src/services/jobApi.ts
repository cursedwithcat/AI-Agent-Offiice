import { apiRequest } from './api';
import { Job } from '../types';

export interface JobFilterParams {
  keyword?: string;
  type?: string;
  workplace?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const jobApi = {
  getJobs: async (params: JobFilterParams = {}): Promise<{ jobs: Job[]; total: number; page: number }> => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.workplace && params.workplace !== 'ALL') query.append('workplace', params.workplace);
    if (params.location && params.location !== 'ALL') query.append('location', params.location);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return apiRequest<{ jobs: Job[]; total: number; page: number }>(`/api/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobById: async (id: number): Promise<Job> => {
    const res = await apiRequest<{ success?: boolean; job?: Job } | Job>(`/api/jobs/${id}`);
    if ('job' in res && res.job) return res.job;
    return res as Job;
  },

  getMyCompanyJobs: async (): Promise<Job[]> => {
    const res = await apiRequest<{ success?: boolean; jobs?: Job[] } | Job[]>('/api/jobs/company/mine');
    if (Array.isArray(res)) return res;
    return res.jobs || [];
  },

  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const res = await apiRequest<{ success?: boolean; job?: Job } | Job>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    if ('job' in res && res.job) return res.job;
    return res as Job;
  },

  updateJobStatus: async (id: number, status: string): Promise<{ success: boolean; status: string }> => {
    return apiRequest<{ success: boolean; status: string }>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
