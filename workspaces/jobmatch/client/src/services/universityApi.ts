import { apiRequest } from './api';
import { StudentEmployabilityRecord, UniversityAnalytics } from '../types';

export interface UniversityStudentsFilter {
  cohort?: number;
  status?: string;
  faculty?: string;
  search?: string;
}

export const universityApi = {
  getStudents: async (
    filter: UniversityStudentsFilter = {}
  ): Promise<{ students: StudentEmployabilityRecord[]; total: number }> => {
    const query = new URLSearchParams();
    if (filter.cohort) query.append('cohort', filter.cohort.toString());
    if (filter.status && filter.status !== 'ALL') query.append('status', filter.status);
    if (filter.faculty && filter.faculty !== 'ALL') query.append('faculty', filter.faculty);
    if (filter.search) query.append('search', filter.search);

    const qs = query.toString();
    return apiRequest<{ students: StudentEmployabilityRecord[]; total: number }>(
      `/api/university/students${qs ? `?${qs}` : ''}`
    );
  },

  getAnalytics: async (): Promise<UniversityAnalytics> => {
    return apiRequest<UniversityAnalytics>('/api/university/analytics');
  },

  exportMHESI: async (): Promise<any> => {
    return apiRequest<any>('/api/university/export-mhesi', {
      method: 'POST',
    });
  },
};
