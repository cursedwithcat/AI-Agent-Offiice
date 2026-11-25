import { studentRepository } from '../repositories/studentRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from './auditService.js';
import { EmployabilityStatus } from '../../../shared/types.js';

export class UniversityService {
  getStudents(
    universityUserId: number,
    options: {
      cohortYear?: number;
      status?: EmployabilityStatus;
      faculty?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const university = userRepository.getUniversityProfileByUserId(universityUserId);
    if (!university) {
      throw new AppError('University profile not found for this user.', 404);
    }

    const { students, total } = studentRepository.findCohortStudents(university.id, options);
    return {
      students,
      total,
      page: Math.floor((options.offset || 0) / (options.limit || 25)) + 1,
      limit: options.limit || 25
    };
  }

  getAnalytics(universityUserId: number, cohortYear?: number) {
    const university = userRepository.getUniversityProfileByUserId(universityUserId);
    if (!university) {
      throw new AppError('University profile not found for this user.', 404);
    }

    const analytics = studentRepository.getAnalytics(university.id, cohortYear);
    return {
      universityName: university.university_name,
      campus: university.campus,
      cohortYear: cohortYear || 2026,
      ...analytics
    };
  }

  exportMHESI(universityUserId: number, cohortYear?: number, ipAddress?: string) {
    const university = userRepository.getUniversityProfileByUserId(universityUserId);
    if (!university) {
      throw new AppError('University profile not found.', 404);
    }

    const records = studentRepository.getMHESIExport(university.id, cohortYear);

    auditService.logAction(
      universityUserId,
      'UNIVERSITY',
      'MHESI_ACCREDITATION_EXPORT',
      'STUDENT_EMPLOYABILITY',
      university.id,
      { cohortYear: cohortYear || 2026, rowCount: records.length },
      ipAddress
    );

    return {
      meta: {
        institution: university.university_name,
        cohortYear: cohortYear || 2026,
        recordCount: records.length,
        exportedAt: new Date().toISOString(),
        standard: 'MHESI-TH-HigherEducation-Employability-v2026'
      },
      data: records
    };
  }
}

export const universityService = new UniversityService();
