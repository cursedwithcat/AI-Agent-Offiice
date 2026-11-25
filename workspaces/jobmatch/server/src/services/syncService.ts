import { DatabaseSync, execute } from '../config/db.js';
import { studentRepository } from '../repositories/studentRepository.js';
import { auditService } from './auditService.js';
import { EmployabilityStatus } from '../../../shared/types.js';

export class SyncService {
  /**
   * Executes atomic synchronization of student employability status
   * when an employer hires a candidate in the ATS pipeline.
   */
  syncHiredCandidate(
    actorId: number,
    seekerId: number,
    companyId: number,
    jobTitle: string,
    salary: number | null,
    ipAddress?: string,
    customDb?: DatabaseSync
  ): { synced: boolean; status: EmployabilityStatus } {
    // Check if the student has an existing employability record
    const existing = studentRepository.findBySeekerId(seekerId);

    if (existing) {
      studentRepository.updateStatus(
        seekerId,
        'EMPLOYED_IN_FIELD',
        companyId,
        jobTitle,
        salary,
        customDb
      );
    } else {
      // If none exists, create one with default Chulalongkorn university profile (ID: 1)
      const sql = `
        INSERT INTO student_employability (
          seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at
        ) VALUES (?, 1, 2026, 'EMPLOYED_IN_FIELD', ?, ?, ?, datetime('now'), datetime('now'))
      `;
      if (customDb) {
        const stmt = customDb.prepare(sql);
        stmt.run(seekerId, companyId, jobTitle, salary || null);
      } else {
        execute(sql, [seekerId, companyId, jobTitle, salary || null]);
      }
    }

    auditService.logAction(
      actorId,
      'COMPANY',
      'ATOMIC_EMPLOYABILITY_SYNC_HIRED',
      'STUDENT_EMPLOYABILITY',
      seekerId,
      {
        seekerId,
        companyId,
        jobTitle,
        salary,
        targetStatus: 'EMPLOYED_IN_FIELD'
      },
      ipAddress,
      customDb
    );

    return { synced: true, status: 'EMPLOYED_IN_FIELD' };
  }
}

export const syncService = new SyncService();
