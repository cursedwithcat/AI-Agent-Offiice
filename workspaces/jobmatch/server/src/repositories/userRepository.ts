import { query, queryOne, execute, DatabaseSync } from '../config/db.js';
import { User, SeekerProfile, CompanyProfile, UniversityProfile, UserRole, UserStatus, KYBStatus } from '../../../shared/types.js';

export class UserRepository {
  findById(id: number): User | null {
    return queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  findByEmail(email: string): User | null {
    return queryOne<User>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  }

  createUser(
    email: string,
    passwordHash: string,
    role: UserRole,
    status: UserStatus = 'ACTIVE',
    customDb?: DatabaseSync
  ): number {
    const sql = `
      INSERT INTO users (email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(email, passwordHash, role, status);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, [email, passwordHash, role, status]);
    return Number(res.lastInsertRowid);
  }

  updateStatus(id: number, status: UserStatus): void {
    execute(
      `UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );
  }

  // --- Seeker Profiles ---
  getSeekerProfileByUserId(userId: number): SeekerProfile | null {
    return queryOne<SeekerProfile>('SELECT * FROM seeker_profiles WHERE user_id = ?', [userId]);
  }

  getSeekerProfileById(id: number): SeekerProfile | null {
    return queryOne<SeekerProfile>('SELECT * FROM seeker_profiles WHERE id = ?', [id]);
  }

  createSeekerProfile(data: {
    userId: number;
    fullName: string;
    phone?: string;
    universityName?: string;
    faculty?: string;
    major?: string;
    studentId?: string;
    graduationYear?: number;
    gpa?: number;
    bio?: string;
    skills?: string;
    resumeUrl?: string;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO seeker_profiles (
        user_id, full_name, phone, university_name, faculty, major, 
        student_id, graduation_year, gpa, bio, skills, resume_url, 
        is_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `;
    const params = [
      data.userId,
      data.fullName,
      data.phone || null,
      data.universityName || null,
      data.faculty || null,
      data.major || null,
      data.studentId || null,
      data.graduationYear || null,
      data.gpa || null,
      data.bio || null,
      data.skills || '[]',
      data.resumeUrl || null
    ];
    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  updateSeekerProfile(userId: number, data: Partial<SeekerProfile>): void {
    const fields: string[] = [];
    const params: any[] = [];

    const allowedKeys: (keyof SeekerProfile)[] = [
      'full_name', 'phone', 'university_name', 'faculty', 'major',
      'student_id', 'graduation_year', 'gpa', 'bio', 'skills', 'resume_url'
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    params.push(userId);

    execute(
      `UPDATE seeker_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
      params
    );
  }

  // --- Company Profiles ---
  getCompanyProfileByUserId(userId: number): CompanyProfile | null {
    return queryOne<CompanyProfile>('SELECT * FROM company_profiles WHERE user_id = ?', [userId]);
  }

  getCompanyProfileById(id: number): CompanyProfile | null {
    return queryOne<CompanyProfile>('SELECT * FROM company_profiles WHERE id = ?', [id]);
  }

  createCompanyProfile(data: {
    userId: number;
    companyName: string;
    taxId?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    address?: string;
    kybStatus?: KYBStatus;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO company_profiles (
        user_id, company_name, tax_id, industry, company_size, 
        website, logo_url, description, address, kyb_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    const params = [
      data.userId,
      data.companyName,
      data.taxId || null,
      data.industry || null,
      data.companySize || null,
      data.website || null,
      data.logoUrl || null,
      data.description || null,
      data.address || null,
      data.kybStatus || 'PENDING'
    ];
    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  updateCompanyKyb(companyId: number, kybStatus: KYBStatus): void {
    execute(
      `UPDATE company_profiles SET kyb_status = ?, updated_at = datetime('now') WHERE id = ?`,
      [kybStatus, companyId]
    );
  }

  // --- University Profiles ---
  getUniversityProfileByUserId(userId: number): UniversityProfile | null {
    return queryOne<UniversityProfile>('SELECT * FROM university_profiles WHERE user_id = ?', [userId]);
  }

  getUniversityProfileById(id: number): UniversityProfile | null {
    return queryOne<UniversityProfile>('SELECT * FROM university_profiles WHERE id = ?', [id]);
  }

  createUniversityProfile(data: {
    userId: number;
    universityName: string;
    campus?: string;
    contactPerson?: string;
    contactEmail?: string;
    phone?: string;
  }, customDb?: DatabaseSync): number {
    const sql = `
      INSERT INTO university_profiles (
        user_id, university_name, campus, contact_person, contact_email, 
        phone, is_accredited, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `;
    const params = [
      data.userId,
      data.universityName,
      data.campus || null,
      data.contactPerson || null,
      data.contactEmail || null,
      data.phone || null
    ];
    if (customDb) {
      const stmt = customDb.prepare(sql);
      const res = stmt.run(...params);
      return Number(res.lastInsertRowid);
    }
    const res = execute(sql, params);
    return Number(res.lastInsertRowid);
  }

  // --- Admin Moderation Queries ---
  findAllUsersWithProfiles(filterRole?: UserRole, filterStatus?: UserStatus): any[] {
    let sql = `
      SELECT 
        u.id, u.email, u.role, u.status, u.created_at, u.updated_at,
        sp.full_name as seeker_name, sp.university_name, sp.gpa,
        cp.id as company_profile_id, cp.company_name, cp.industry, cp.tax_id, cp.kyb_status,
        up.university_name as registered_university
      FROM users u
      LEFT JOIN seeker_profiles sp ON sp.user_id = u.id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      LEFT JOIN university_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (filterRole) {
      sql += ' AND u.role = ?';
      params.push(filterRole);
    }
    if (filterStatus) {
      sql += ' AND u.status = ?';
      params.push(filterStatus);
    }
    sql += ' ORDER BY u.created_at DESC';
    return query(sql, params);
  }
}

export const userRepository = new UserRepository();
