import { jobRepository, JobFilterOptions } from '../repositories/jobRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from './auditService.js';
import { Job, JobStatus, JobType, WorkplaceType, UserRole } from '../../../shared/types.js';

export class JobService {
  getJobs(options: JobFilterOptions) {
    const { jobs, total } = jobRepository.findAll(options);
    const parsedJobs = jobs.map(job => ({
      ...job,
      skills_required: typeof job.skills_required === 'string' ? JSON.parse(job.skills_required || '[]') : job.skills_required
    }));
    return {
      jobs: parsedJobs,
      total,
      page: Math.floor((options.offset || 0) / (options.limit || 20)) + 1,
      limit: options.limit || 20
    };
  }

  getJobById(id: number) {
    const job = jobRepository.findById(id);
    if (!job) {
      throw new AppError('Job requisition not found.', 404);
    }
    return {
      ...job,
      skills_required: typeof job.skills_required === 'string' ? JSON.parse(job.skills_required || '[]') : job.skills_required
    };
  }

  createJob(
    companyUserId: number,
    data: {
      title: string;
      department?: string;
      jobType: JobType;
      workplaceType: WorkplaceType;
      location: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryCurrency?: string;
      experienceLevel?: string;
      description: string;
      requirements?: string;
      skillsRequired?: string[] | string;
      status?: JobStatus;
    },
    ipAddress?: string
  ) {
    const company = userRepository.getCompanyProfileByUserId(companyUserId);
    if (!company) {
      throw new AppError('Company profile not found for this user.', 404);
    }

    const skillsStr = Array.isArray(data.skillsRequired)
      ? JSON.stringify(data.skillsRequired)
      : data.skillsRequired || '[]';

    const jobId = jobRepository.create({
      companyId: company.id,
      title: data.title,
      department: data.department,
      jobType: data.jobType,
      workplaceType: data.workplaceType,
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryCurrency: data.salaryCurrency,
      experienceLevel: data.experienceLevel,
      description: data.description,
      requirements: data.requirements,
      skillsRequired: skillsStr,
      status: data.status || 'PUBLISHED'
    });

    auditService.logAction(
      companyUserId,
      'COMPANY',
      'JOB_CREATED',
      'JOBS',
      jobId,
      { title: data.title, companyId: company.id },
      ipAddress
    );

    return this.getJobById(jobId);
  }

  updateJob(
    userId: number,
    role: UserRole,
    jobId: number,
    data: Partial<Job>,
    ipAddress?: string
  ) {
    const job = jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    // Role check: Only the owning company or an Admin can edit
    if (role === 'COMPANY') {
      const company = userRepository.getCompanyProfileByUserId(userId);
      if (!company || company.id !== job.company_id) {
        throw new AppError('Unauthorized: You can only edit jobs belonging to your organization.', 403);
      }
    }

    if (Array.isArray(data.skills_required)) {
      data.skills_required = JSON.stringify(data.skills_required);
    }

    jobRepository.update(jobId, data);

    auditService.logAction(
      userId,
      role,
      'JOB_UPDATED',
      'JOBS',
      jobId,
      { updatedFields: Object.keys(data) },
      ipAddress
    );

    return this.getJobById(jobId);
  }

  updateJobStatus(
    userId: number,
    role: UserRole,
    jobId: number,
    status: JobStatus,
    ipAddress?: string
  ) {
    const job = jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    if (role === 'COMPANY') {
      const company = userRepository.getCompanyProfileByUserId(userId);
      if (!company || company.id !== job.company_id) {
        throw new AppError('Unauthorized: You can only update status of your own requisitions.', 403);
      }
    }

    jobRepository.updateStatus(jobId, status);

    auditService.logAction(
      userId,
      role,
      'JOB_STATUS_CHANGED',
      'JOBS',
      jobId,
      { oldStatus: job.status, newStatus: status },
      ipAddress
    );

    return { success: true, jobId, status };
  }

  getCompanyJobs(companyUserId: number) {
    const company = userRepository.getCompanyProfileByUserId(companyUserId);
    if (!company) {
      throw new AppError('Company profile not found for this user.', 404);
    }

    const jobs = jobRepository.findByCompanyId(company.id);
    return jobs.map(j => ({
      ...j,
      skills_required: typeof j.skills_required === 'string' ? JSON.parse(j.skills_required || '[]') : j.skills_required
    }));
  }
}

export const jobService = new JobService();
