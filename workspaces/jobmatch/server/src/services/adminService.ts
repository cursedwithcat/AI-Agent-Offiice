import { userRepository } from '../repositories/userRepository.js';
import { jobRepository } from '../repositories/jobRepository.js';
import { auditService } from './auditService.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole, UserStatus, KYBStatus, JobStatus } from '../../../shared/types.js';

export class AdminService {
  getUsers(filterRole?: UserRole, filterStatus?: UserStatus) {
    return userRepository.findAllUsersWithProfiles(filterRole, filterStatus);
  }

  updateCompanyKYB(adminUserId: number, companyId: number, kybStatus: KYBStatus, ipAddress?: string) {
    const company = userRepository.getCompanyProfileById(companyId);
    if (!company) {
      throw new AppError('Company profile not found.', 404);
    }

    userRepository.updateCompanyKyb(companyId, kybStatus);

    // Also update user status if approved
    if (kybStatus === 'VERIFIED') {
      userRepository.updateStatus(company.user_id, 'ACTIVE');
    }

    auditService.logAction(
      adminUserId,
      'ADMIN',
      'COMPANY_KYB_MODERATION',
      'COMPANY_PROFILES',
      companyId,
      { previousStatus: company.kyb_status, newStatus: kybStatus },
      ipAddress
    );

    return { success: true, companyId, kybStatus };
  }

  updateUserStatus(adminUserId: number, targetUserId: number, status: UserStatus, ipAddress?: string) {
    if (adminUserId === targetUserId) {
      throw new AppError('Administrative safety lock: Cannot modify your own account status.', 400);
    }

    const user = userRepository.findById(targetUserId);
    if (!user) {
      throw new AppError('Target user not found.', 404);
    }

    userRepository.updateStatus(targetUserId, status);

    auditService.logAction(
      adminUserId,
      'ADMIN',
      'USER_STATUS_MODERATION',
      'USERS',
      targetUserId,
      { previousStatus: user.status, newStatus: status, targetEmail: user.email },
      ipAddress
    );

    return { success: true, userId: targetUserId, status };
  }

  getAllJobs(filterStatus?: JobStatus) {
    return jobRepository.getAllJobsForAdmin(filterStatus);
  }

  moderateJob(adminUserId: number, jobId: number, status: JobStatus, note?: string, ipAddress?: string) {
    const job = jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job requisition not found.', 404);
    }

    jobRepository.updateStatus(jobId, status);

    auditService.logAction(
      adminUserId,
      'ADMIN',
      'JOB_MODERATION',
      'JOBS',
      jobId,
      { previousStatus: job.status, newStatus: status, moderationNote: note },
      ipAddress
    );

    return { success: true, jobId, status, note };
  }

  getAuditLogs(filters: { actorRole?: string; action?: string; limit?: number; offset?: number }) {
    return auditService.getAuditLogs(filters);
  }

  getPlatformStats() {
    return auditService.getPlatformStats();
  }
}

export const adminService = new AdminService();
