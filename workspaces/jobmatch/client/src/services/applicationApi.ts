import { apiRequest } from './api';
import { Application, ApplicationStage } from '../types';

export const applicationApi = {
  apply: async (data: {
    jobId: number;
    coverNote?: string;
    resumeUrl?: string;
  }): Promise<{ applicationId: number; stage: ApplicationStage; appliedAt: string }> => {
    return apiRequest<{ applicationId: number; stage: ApplicationStage; appliedAt: string }>(
      '/api/applications',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getMyApplications: async (): Promise<Application[]> => {
    const res = await apiRequest<{ success?: boolean; applications?: Application[] } | Application[]>('/api/applications/my');
    if (Array.isArray(res)) return res;
    return res.applications || [];
  },

  getJobApplications: async (jobId: number): Promise<Application[]> => {
    const res = await apiRequest<{ success?: boolean; applicants?: Application[] } | Application[]>(`/api/applications/job/${jobId}`);
    if (Array.isArray(res)) return res;
    return res.applicants || [];
  },

  updateStage: async (
    id: number,
    stage: ApplicationStage,
    internalNotes?: string
  ): Promise<{ id: number; stage: ApplicationStage; employabilitySyncStatus?: string }> => {
    return apiRequest<{ id: number; stage: ApplicationStage; employabilitySyncStatus?: string }>(
      `/api/applications/${id}/stage`,
      {
        method: 'PATCH',
        body: JSON.stringify({ stage, internalNotes }),
      }
    );
  },
};
