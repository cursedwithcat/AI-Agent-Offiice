import { applicationRepository } from '../repositories/applicationRepository.js';
import { jobRepository } from '../repositories/jobRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { runTransaction } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { syncService } from './syncService.js';
import { auditService } from './auditService.js';
import { ApplicationStage } from '../../../shared/types.js';

export class ApplicationService {
  apply(
    seekerUserId: number,
    data: {
      jobId: number;
      coverNote?: string;
      resumeUrl?: string;
    },
    ipAddress?: string
  ) {
    const seeker = userRepository.getSeekerProfileByUserId(seekerUserId);
    if (!seeker) {
      throw new AppError('Candidate profile not found. Please complete profile setup.', 404);
    }

    const job = jobRepository.findById(data.jobId);
    if (!job) {
      throw new AppError('Job requisition not found.', 404);
    }

    if (job.status !== 'PUBLISHED') {
      throw new AppError('This job requisition is no longer accepting applications.', 400);
    }

    // Check duplicate
    const existing = applicationRepository.findByJobAndSeeker(data.jobId, seeker.id);
    if (existing) {
      throw new AppError('You have already applied for this position.', 409);
    }

    const resumeSnapshot = data.resumeUrl || seeker.resume_url;

    const applicationId = applicationRepository.create({
      jobId: data.jobId,
      seekerId: seeker.id,
      stage: 'APPLIED',
      coverNote: data.coverNote,
      resumeSnapshotUrl: resumeSnapshot || undefined
    });

    auditService.logAction(
      seekerUserId,
      'SEEKER',
      'APPLICATION_SUBMITTED',
      'APPLICATIONS',
      applicationId,
      { jobId: data.jobId, jobTitle: job.title },
      ipAddress
    );

    return {
      applicationId,
      stage: 'APPLIED' as ApplicationStage,
      appliedAt: new Date().toISOString()
    };
  }

  getMyApplications(seekerUserId: number) {
    const seeker = userRepository.getSeekerProfileByUserId(seekerUserId);
    if (!seeker) {
      throw new AppError('Candidate profile not found.', 404);
    }

    return applicationRepository.findBySeekerId(seeker.id);
  }

  getJobApplicants(companyUserId: number, jobId: number) {
    const company = userRepository.getCompanyProfileByUserId(companyUserId);
    if (!company) {
      throw new AppError('Company profile not found.', 404);
    }

    const job = jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job requisition not found.', 404);
    }

    if (job.company_id !== company.id) {
      throw new AppError('Unauthorized: This job belongs to another company.', 403);
    }

    return applicationRepository.findByJobId(jobId);
  }

  getApplicationById(userId: number, role: string, id: number) {
    const application = applicationRepository.findById(id);
    if (!application) {
      throw new AppError('Application record not found.', 404);
    }

    const job = jobRepository.findById(application.job_id);
    if (!job) {
      throw new AppError('Associated job requisition not found.', 404);
    }

    // Role-based Access & IDOR Verification
    if (role === 'ADMIN') {
      return application;
    }

    if (role === 'COMPANY') {
      const company = userRepository.getCompanyProfileByUserId(userId);
      if (!company || company.id !== job.company_id) {
        throw new AppError('Unauthorized: You can only view applications to your own jobs.', 403);
      }
      return application;
    }

    if (role === 'SEEKER') {
      const seeker = userRepository.getSeekerProfileByUserId(userId);
      if (!seeker || seeker.id !== application.seeker_id) {
        throw new AppError('Unauthorized: You can only view your own applications.', 403);
      }
      // Defensive filtering: Omit internal recruiter notes from candidate view
      const { internal_notes, ...candidateSafeView } = application;
      return candidateSafeView;
    }

    throw new AppError('Unauthorized: Access forbidden for your role.', 403);
  }

  updateStage(
    actorUserId: number,
    actorRole: string,
    applicationId: number,
    stage: ApplicationStage,
    internalNotes?: string,
    ipAddress?: string
  ) {
    const application = applicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    const job = jobRepository.findById(application.job_id);
    if (!job) {
      throw new AppError('Associated job requisition not found.', 404);
    }

    if (actorRole === 'COMPANY') {
      const company = userRepository.getCompanyProfileByUserId(actorUserId);
      if (!company || company.id !== job.company_id) {
        throw new AppError('Unauthorized: You can only manage applications to your own jobs.', 403);
      }
    }

    let employabilitySyncStatus: 'SYNCED' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';

    // Atomic Cross-Domain Transaction
    runTransaction((db) => {
      // 1. Update application stage and internal notes
      applicationRepository.updateStage(applicationId, stage, internalNotes, db);

      // 2. If stage is 'HIRED', trigger cross-domain employability sync
      if (stage === 'HIRED') {
        syncService.syncHiredCandidate(
          actorUserId,
          application.seeker_id,
          job.company_id,
          job.title,
          job.salary_max || job.salary_min || null,
          ipAddress,
          db
        );
        employabilitySyncStatus = 'SYNCED';
      }

      // 3. Audit trail
      auditService.logAction(
        actorUserId,
        actorRole,
        'APPLICATION_STAGE_UPDATED',
        'APPLICATIONS',
        applicationId,
        {
          previousStage: application.stage,
          newStage: stage,
          jobId: job.id,
          seekerId: application.seeker_id
        },
        ipAddress,
        db
      );
    });

    return {
      id: applicationId,
      stage,
      employabilitySyncStatus
    };
  }
}

export const applicationService = new ApplicationService();
