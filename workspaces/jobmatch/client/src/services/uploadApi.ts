import { apiRequest } from './api';

export const uploadApi = {
  uploadResume: async (file: File): Promise<{ fileUrl: string; size: number }> => {
    const formData = new FormData();
    formData.append('resume', file);

    return apiRequest<{ fileUrl: string; size: number }>('/api/uploads/resume', {
      method: 'POST',
      body: formData,
    });
  },
};
