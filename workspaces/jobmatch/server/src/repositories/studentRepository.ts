import { query, queryOne, execute, DatabaseSync } from '../config/db.js';
import { EmployabilityStatus, StudentEmployability, UniversityAnalyticsResponse } from '../../../shared/types.js';

export class StudentRepository {
  findBySeekerId(seekerId: number): StudentEmployability | null {
    return queryOne<StudentEmployability>(
      'SELECT * FROM student_employability WHERE seeker_id = ?',
      [seekerId]
    );
  }

  findCohortStudents(
    universityId: number,
    options: {
      cohortYear?: number;
      status?: EmployabilityStatus;
      faculty?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): { students: any[]; total: number } {
    let whereClause = 'WHERE se.university_id = ?';
    const params: any[] = [universityId];

    if (options.cohortYear) {
      whereClause += ' AND se.cohort_year = ?';
      params.push(options.cohortYear);
    }

    if (options.status) {
      whereClause += ' AND se.status = ?';
      params.push(options.status);
    }

    if (options.faculty) {
      whereClause += ' AND sp.faculty LIKE ?';
      params.push(`%${options.faculty}%`);
    }

    if (options.search) {
      whereClause += ` AND (
        sp.full_name LIKE ? OR 
        sp.student_id LIKE ? OR 
        sp.major LIKE ? OR
        se.placed_job_title LIKE ? OR
        cp.company_name LIKE ?
      )`;
      const pattern = `%${options.search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    // Total Count
    const countSql = `
      SELECT COUNT(*) as count
      FROM student_employability se
      JOIN seeker_profiles sp ON sp.id = se.seeker_id
      LEFT JOIN company_profiles cp ON cp.id = se.placed_company_id
      ${whereClause}
    `;
    const countRow = queryOne<{ count: number }>(countSql, params);
    const total = countRow ? countRow.count : 0;

    // Student Roster
    let listSql = `
      SELECT 
        se.id as employability_id,
        se.seeker_id,
        se.cohort_year,
        se.status as employability_status,
        se.placed_company_id,
        se.placed_job_title,
        se.starting_salary,
        se.updated_at as status_updated_at,
        sp.user_id,
        sp.full_name,
        sp.student_id,
        sp.faculty,
        sp.major,
        sp.gpa,
        sp.phone,
        sp.resume_url,
        sp.is_verified,
        cp.company_name as placed_company_name,
        cp.logo_url as placed_company_logo
      FROM student_employability se
      JOIN seeker_profiles sp ON sp.id = se.seeker_id
      LEFT JOIN company_profiles cp ON cp.id = se.placed_company_id
      ${whereClause}
      ORDER BY se.updated_at DESC, sp.student_id ASC
    `;

    const limit = options.limit || 25;
    const offset = options.offset || 0;
    listSql += ' LIMIT ? OFFSET ?';
    const listParams = [...params, limit, offset];

    const students = query(listSql, listParams);
    return { students, total };
  }

  updateStatus(
    seekerId: number,
    status: EmployabilityStatus,
    companyId?: number | null,
    jobTitle?: string | null,
    salary?: number | null,
    customDb?: DatabaseSync
  ): void {
    const sql = `
      UPDATE student_employability 
      SET 
        status = ?, 
        placed_company_id = ?, 
        placed_job_title = ?, 
        starting_salary = ?, 
        updated_at = datetime('now') 
      WHERE seeker_id = ?
    `;
    const params = [
      status,
      companyId !== undefined ? companyId : null,
      jobTitle !== undefined ? jobTitle : null,
      salary !== undefined ? salary : null,
      seekerId
    ];

    if (customDb) {
      const stmt = customDb.prepare(sql);
      stmt.run(...params);
    } else {
      execute(sql, params);
    }
  }

  getAnalytics(universityId: number, cohortYear?: number): UniversityAnalyticsResponse {
    let whereClause = 'WHERE university_id = ?';
    const params: any[] = [universityId];

    if (cohortYear) {
      whereClause += ' AND cohort_year = ?';
      params.push(cohortYear);
    }

    // Total Count
    const totalRow = queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM student_employability ${whereClause}`,
      params
    );
    const totalMonitoredStudents = totalRow ? totalRow.count : 0;

    if (totalMonitoredStudents === 0) {
      return {
        totalMonitoredStudents: 0,
        employmentRate: 0,
        outcomes: {
          employedInField: 0,
          employedOutOfField: 0,
          continuingEd: 0,
          seeking: 0,
          entrepreneur: 0
        },
        topHiringSectors: []
      };
    }

    // Status breakdown
    const statusRows = query<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count FROM student_employability ${whereClause} GROUP BY status`,
      params
    );

    const counts: Record<string, number> = {
      EMPLOYED_IN_FIELD: 0,
      EMPLOYED_OUT_OF_FIELD: 0,
      CONTINUING_ED: 0,
      SEEKING: 0,
      FREELANCE_ENTREPRENEUR: 0
    };

    for (const row of statusRows) {
      counts[row.status] = row.count;
    }

    const employedInField = Number(((counts.EMPLOYED_IN_FIELD / totalMonitoredStudents) * 100).toFixed(1));
    const employedOutOfField = Number(((counts.EMPLOYED_OUT_OF_FIELD / totalMonitoredStudents) * 100).toFixed(1));
    const continuingEd = Number(((counts.CONTINUING_ED / totalMonitoredStudents) * 100).toFixed(1));
    const seeking = Number(((counts.SEEKING / totalMonitoredStudents) * 100).toFixed(1));
    const entrepreneur = Number(((counts.FREELANCE_ENTREPRENEUR / totalMonitoredStudents) * 100).toFixed(1));

    // Overall employment rate is (Employed In Field + Employed Out of Field + Entrepreneur) / total
    const totalEmployed = counts.EMPLOYED_IN_FIELD + counts.EMPLOYED_OUT_OF_FIELD + counts.FREELANCE_ENTREPRENEUR;
    const employmentRate = Number(((totalEmployed / totalMonitoredStudents) * 100).toFixed(1));

    // Top Hiring Sectors
    const sectorSql = `
      SELECT 
        COALESCE(cp.industry, 'Technology & Services') as sector,
        COUNT(*) as count
      FROM student_employability se
      JOIN company_profiles cp ON cp.id = se.placed_company_id
      ${whereClause}
      GROUP BY cp.industry
      ORDER BY count DESC
      LIMIT 5
    `;
    const sectorRows = query<{ sector: string; count: number }>(sectorSql, params);

    const totalPlaced = sectorRows.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const topHiringSectors = sectorRows.map(r => ({
      sector: r.sector,
      percentage: Number(((r.count / totalPlaced) * 100).toFixed(1))
    }));

    return {
      totalMonitoredStudents,
      employmentRate,
      outcomes: {
        employedInField,
        employedOutOfField,
        continuingEd,
        seeking,
        entrepreneur
      },
      topHiringSectors
    };
  }

  getMHESIExport(universityId: number, cohortYear?: number): any[] {
    let whereClause = 'WHERE se.university_id = ?';
    const params: any[] = [universityId];

    if (cohortYear) {
      whereClause += ' AND se.cohort_year = ?';
      params.push(cohortYear);
    }

    const sql = `
      SELECT 
        sp.student_id as "Student ID",
        sp.full_name as "Full Name (TH/EN)",
        sp.faculty as "Faculty",
        sp.major as "Field of Study",
        sp.graduation_year as "Cohort Year",
        sp.gpa as "Cumulative GPA",
        se.status as "Employment Outcome",
        COALESCE(cp.company_name, 'N/A') as "Employing Enterprise",
        COALESCE(cp.industry, 'N/A') as "Industry Sector",
        COALESCE(se.placed_job_title, 'N/A') as "Job Title",
        COALESCE(se.starting_salary, 0) as "Starting Monthly Salary (THB)",
        se.updated_at as "Accreditation Verification Timestamp"
      FROM student_employability se
      JOIN seeker_profiles sp ON sp.id = se.seeker_id
      LEFT JOIN company_profiles cp ON cp.id = se.placed_company_id
      ${whereClause}
      ORDER BY sp.student_id ASC
    `;
    return query(sql, params);
  }
}

export const studentRepository = new StudentRepository();
