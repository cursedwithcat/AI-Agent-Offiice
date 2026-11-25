import { query, queryOne, execute, DatabaseSync } from '../config/db.js';
import { Application, ApplicationStage, ApplicationWithDetails } from '../../../shared/types.js';

export class ApplicationRepository {
  create(data: {
    jobId: number;
    seekerId: number;
    stage?: ApplicationStage;
    coverNote?: string;
    resumeSnapshotUrl?: string;
    internalNotes?: string;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO applications (
        job_id, seeker_id, stage, cover_note, 
        resume_snapshot_url, internal_notes, applied_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    const params = [
      data.jobId,
      data.seekerId,
      data.stage || 'APPLIED',
      data.coverNote || null,
      data.resumeSnapshotUrl || null,
      data.internalNotes || null
    ];

    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  findById(id: number): Application | null {
    return queryOne<Application>('SELECT * FROM applications WHERE id = ?', [id]);
  }

  findByJobAndSeeker(jobId: number, seekerId: number): Application | null {
    return queryOne<Application>(
      'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
      [jobId, seekerId]
    );
  }

  findBySeekerId(seekerId: number): ApplicationWithDetails[] {
    const sql = `
      SELECT 
        a.*,
        j.title as job_title,
        j.job_type,
        j.location,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        cp.company_name,
        cp.logo_url as company_logo
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN company_profiles cp ON cp.id = j.company_id
      WHERE a.seeker_id = ?
      ORDER BY a.applied_at DESC
    `;
    return query<ApplicationWithDetails>(sql, [seekerId]);
  }

  findByJobId(jobId: number): any[] {
    const sql = `
      SELECT 
        a.id,
        a.job_id,
        a.seeker_id,
        a.stage,
        a.cover_note,
        a.resume_snapshot_url,
        a.internal_notes,
        a.applied_at,
        a.updated_at,
        sp.full_name as candidate_name,
        u.email as candidate_email,
        sp.phone as candidate_phone,
        sp.university_name as candidate_university,
        sp.faculty as candidate_faculty,
        sp.major as candidate_major,
        sp.gpa as candidate_gpa,
        sp.skills as candidate_skills,
        sp.graduation_year as candidate_graduation_year,
        sp.is_verified as candidate_is_verified
      FROM applications a
      JOIN seeker_profiles sp ON sp.id = a.seeker_id
      JOIN users u ON u.id = sp.user_id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `;
    const rows = query(sql, [jobId]);
    return rows.map(r => ({
      ...r,
      candidate_skills: typeof r.candidate_skills === 'string' ? JSON.parse(r.candidate_skills || '[]') : r.candidate_skills
    }));
  }

  updateStage(
    id: number,
    stage: ApplicationStage,
    internalNotes?: string,
    customDb?: DatabaseSync
  ): void {
    let sql: string;
    let params: any[];

    if (internalNotes !== undefined) {
      sql = `UPDATE applications SET stage = ?, internal_notes = ?, updated_at = datetime('now') WHERE id = ?`;
      params = [stage, internalNotes, id];
    } else {
      sql = `UPDATE applications SET stage = ?, updated_at = datetime('now') WHERE id = ?`;
      params = [stage, id];
    }

    if (customDb) {
      const stmt = customDb.prepare(sql);
      stmt.run(...params);
    } else {
      execute(sql, params);
    }
  }
}

export const applicationRepository = new ApplicationRepository();
