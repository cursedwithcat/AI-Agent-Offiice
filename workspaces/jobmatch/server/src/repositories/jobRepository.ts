import { query, queryOne, execute, DatabaseSync } from '../config/db.js';
import { Job, JobWithCompany, JobStatus, JobType, WorkplaceType } from '../../../shared/types.js';

export interface JobFilterOptions {
  search?: string;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  location?: string;
  status?: JobStatus;
  companyId?: number;
  limit?: number;
  offset?: number;
}

export class JobRepository {
  findAll(options: JobFilterOptions = {}): { jobs: JobWithCompany[]; total: number } {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    // Default to published jobs if not explicitly querying by status or company
    if (options.status) {
      whereClause += ' AND j.status = ?';
      params.push(options.status);
    } else if (!options.companyId) {
      whereClause += " AND j.status = 'PUBLISHED'";
    }

    if (options.companyId) {
      whereClause += ' AND j.company_id = ?';
      params.push(options.companyId);
    }

    if (options.jobType) {
      whereClause += ' AND j.job_type = ?';
      params.push(options.jobType);
    }

    if (options.workplaceType) {
      whereClause += ' AND j.workplace_type = ?';
      params.push(options.workplaceType);
    }

    if (options.location) {
      whereClause += ' AND j.location LIKE ?';
      params.push(`%${options.location}%`);
    }

    if (options.search) {
      whereClause += ` AND (
        j.title LIKE ? OR 
        j.description LIKE ? OR 
        j.skills_required LIKE ? OR 
        cp.company_name LIKE ?
      )`;
      const pattern = `%${options.search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    // Get Total Count
    const countSql = `
      SELECT COUNT(*) as count
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      ${whereClause}
    `;
    const countRow = queryOne<{ count: number }>(countSql, params);
    const total = countRow ? countRow.count : 0;

    // Get Rows
    let listSql = `
      SELECT 
        j.*,
        cp.company_name,
        cp.logo_url as company_logo,
        cp.industry as company_industry,
        cp.kyb_status
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      ${whereClause}
      ORDER BY j.created_at DESC
    `;

    const limit = options.limit || 20;
    const offset = options.offset || 0;
    listSql += ' LIMIT ? OFFSET ?';
    const listParams = [...params, limit, offset];

    const jobs = query<JobWithCompany>(listSql, listParams);
    return { jobs, total };
  }

  findById(id: number): JobWithCompany | null {
    const sql = `
      SELECT 
        j.*,
        cp.company_name,
        cp.logo_url as company_logo,
        cp.industry as company_industry,
        cp.kyb_status,
        cp.website as company_website,
        cp.description as company_description,
        cp.address as company_address
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      WHERE j.id = ?
    `;
    return queryOne<JobWithCompany>(sql, [id]);
  }

  findByCompanyId(companyId: number): any[] {
    const sql = `
      SELECT 
        j.*,
        cp.company_name,
        cp.logo_url as company_logo,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.stage = 'HIRED') as hired_count
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
    `;
    return query(sql, [companyId]);
  }

  create(data: {
    companyId: number;
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
    skillsRequired?: string;
    status?: JobStatus;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO jobs (
        company_id, title, department, job_type, workplace_type, 
        location, salary_min, salary_max, salary_currency, 
        experience_level, description, requirements, skills_required, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    const params = [
      data.companyId,
      data.title,
      data.department || null,
      data.jobType,
      data.workplaceType,
      data.location,
      data.salaryMin !== undefined ? data.salaryMin : null,
      data.salaryMax !== undefined ? data.salaryMax : null,
      data.salaryCurrency || 'THB',
      data.experienceLevel || null,
      data.description,
      data.requirements || null,
      data.skillsRequired || '[]',
      data.status || 'PUBLISHED'
    ];

    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  update(id: number, data: Partial<Job>): void {
    const fields: string[] = [];
    const params: any[] = [];

    const allowedKeys: (keyof Job)[] = [
      'title', 'department', 'job_type', 'workplace_type', 'location',
      'salary_min', 'salary_max', 'salary_currency', 'experience_level',
      'description', 'requirements', 'skills_required', 'status'
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    params.push(id);

    execute(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  updateStatus(id: number, status: JobStatus): void {
    execute(
      `UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );
  }

  getAllJobsForAdmin(filterStatus?: JobStatus): any[] {
    let sql = `
      SELECT 
        j.*,
        cp.company_name,
        cp.kyb_status,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
      FROM jobs j
      JOIN company_profiles cp ON cp.id = j.company_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (filterStatus) {
      sql += ' AND j.status = ?';
      params.push(filterStatus);
    }
    sql += ' ORDER BY j.created_at DESC';
    return query(sql, params);
  }
}

export const jobRepository = new JobRepository();
