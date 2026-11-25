import { query, queryOne, execute, DatabaseSync } from '../config/db.js';
import { AuditLog } from '../../../shared/types.js';

export class AuditRepository {
  create(data: {
    actorId?: number | null;
    actorRole: string;
    action: string;
    targetType: string;
    targetId?: number | null;
    details?: any;
    ipAddress?: string | null;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO audit_logs (
        actor_id, actor_role, action, target_type, target_id, details, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    const detailsStr = data.details ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) : null;
    const params = [
      data.actorId !== undefined ? data.actorId : null,
      data.actorRole,
      data.action,
      data.targetType,
      data.targetId !== undefined ? data.targetId : null,
      detailsStr,
      data.ipAddress || null
    ];

    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  findAll(options: {
    actorRole?: string;
    action?: string;
    limit?: number;
    offset?: number;
  } = {}): { logs: any[]; total: number } {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (options.actorRole) {
      whereClause += ' AND al.actor_role = ?';
      params.push(options.actorRole);
    }

    if (options.action) {
      whereClause += ' AND al.action = ?';
      params.push(options.action);
    }

    const countSql = `SELECT COUNT(*) as count FROM audit_logs al ${whereClause}`;
    const countRow = queryOne<{ count: number }>(countSql, params);
    const total = countRow ? countRow.count : 0;

    let listSql = `
      SELECT 
        al.*,
        u.email as actor_email
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_id
      ${whereClause}
      ORDER BY al.created_at DESC
    `;

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    listSql += ' LIMIT ? OFFSET ?';
    const listParams = [...params, limit, offset];

    const logs = query(listSql, listParams).map(log => {
      let parsedDetails = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = log.details;
        }
      }
      return {
        ...log,
        details: parsedDetails
      };
    });

    return { logs, total };
  }

  getPlatformStats(): {
    totalUsers: number;
    totalSeekers: number;
    totalCompanies: number;
    totalUniversities: number;
    totalJobs: number;
    totalApplications: number;
    totalHired: number;
    pendingKybCount: number;
  } {
    const usersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users')!.count;
    const seekersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM seeker_profiles')!.count;
    const companiesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM company_profiles')!.count;
    const universitiesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM university_profiles')!.count;
    const jobsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM jobs')!.count;
    const applicationsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM applications')!.count;
    const hiredCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE stage = 'HIRED'")!.count;
    const pendingKyb = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM company_profiles WHERE kyb_status = 'PENDING'")!.count;

    return {
      totalUsers: usersCount,
      totalSeekers: seekersCount,
      totalCompanies: companiesCount,
      totalUniversities: universitiesCount,
      totalJobs: jobsCount,
      totalApplications: applicationsCount,
      totalHired: hiredCount,
      pendingKybCount: pendingKyb
    };
  }
}

export const auditRepository = new AuditRepository();
