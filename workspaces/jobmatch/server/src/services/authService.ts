import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { runTransaction } from '../config/db.js';
import { ENV } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from './auditService.js';
import { UserRole, AuthSession, SeekerProfile, CompanyProfile, UniversityProfile } from '../../../shared/types.js';

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  profileData: {
    // Seeker fields
    fullName?: string;
    phone?: string;
    universityName?: string;
    faculty?: string;
    major?: string;
    studentId?: string;
    graduationYear?: number;
    gpa?: number;
    bio?: string;
    skills?: string[] | string;
    resumeUrl?: string;

    // Company fields
    companyName?: string;
    taxId?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    address?: string;

    // University fields
    campus?: string;
    contactPerson?: string;
    contactEmail?: string;
  };
}

export class AuthService {
  async register(payload: RegisterPayload, ipAddress?: string): Promise<AuthSession> {
    const existing = userRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError('Email address is already registered.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    // Initial status: Companies pending verification; Seekers, Universities, Admins are ACTIVE
    const initialStatus = payload.role === 'COMPANY' ? 'PENDING_VERIFICATION' : 'ACTIVE';

    const result = runTransaction((db) => {
      const userId = userRepository.createUser(
        payload.email,
        passwordHash,
        payload.role,
        initialStatus,
        db
      );

      let profile: SeekerProfile | CompanyProfile | UniversityProfile | null = null;

      if (payload.role === 'SEEKER') {
        const skillsStr = Array.isArray(payload.profileData.skills)
          ? JSON.stringify(payload.profileData.skills)
          : payload.profileData.skills || '[]';

        const profileId = userRepository.createSeekerProfile(
          {
            userId,
            fullName: payload.profileData.fullName || 'Candidate',
            phone: payload.profileData.phone,
            universityName: payload.profileData.universityName || 'Chulalongkorn University',
            faculty: payload.profileData.faculty,
            major: payload.profileData.major,
            studentId: payload.profileData.studentId,
            graduationYear: payload.profileData.graduationYear || new Date().getFullYear(),
            gpa: payload.profileData.gpa,
            bio: payload.profileData.bio,
            skills: skillsStr,
            resumeUrl: payload.profileData.resumeUrl
          },
          db
        );

        // Also seed initial student employability record for Chulalongkorn (Uni ID: 1)
        const stmt = db.prepare(`
          INSERT INTO student_employability (
            seeker_id, university_id, cohort_year, status, created_at, updated_at
          ) VALUES (?, 1, ?, 'SEEKING', datetime('now'), datetime('now'))
        `);
        stmt.run(profileId, payload.profileData.graduationYear || new Date().getFullYear());

        const profileStmt = db.prepare('SELECT * FROM seeker_profiles WHERE id = ?');
        profile = profileStmt.get(profileId) as unknown as SeekerProfile;
      } else if (payload.role === 'COMPANY') {
        const profileId = userRepository.createCompanyProfile(
          {
            userId,
            companyName: payload.profileData.companyName || 'Registered Enterprise',
            taxId: payload.profileData.taxId,
            industry: payload.profileData.industry,
            companySize: payload.profileData.companySize,
            website: payload.profileData.website,
            logoUrl: payload.profileData.logoUrl,
            description: payload.profileData.description,
            address: payload.profileData.address,
            kybStatus: 'PENDING'
          },
          db
        );

        const profileStmt = db.prepare('SELECT * FROM company_profiles WHERE id = ?');
        profile = profileStmt.get(profileId) as unknown as CompanyProfile;
      } else if (payload.role === 'UNIVERSITY') {
        const profileId = userRepository.createUniversityProfile(
          {
            userId,
            universityName: payload.profileData.universityName || 'Higher Education Institution',
            campus: payload.profileData.campus,
            contactPerson: payload.profileData.contactPerson,
            contactEmail: payload.profileData.contactEmail || payload.email,
            phone: payload.profileData.phone
          },
          db
        );

        const profileStmt = db.prepare('SELECT * FROM university_profiles WHERE id = ?');
        profile = profileStmt.get(profileId) as unknown as UniversityProfile;
      }

      auditService.logAction(
        userId,
        payload.role,
        'USER_REGISTERED',
        'USERS',
        userId,
        { email: payload.email, role: payload.role },
        ipAddress,
        db
      );

      return { userId, profile };
    });

    const token = jwt.sign(
      {
        userId: result.userId,
        email: payload.email,
        role: payload.role
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: result.userId,
        email: payload.email,
        role: payload.role,
        status: initialStatus
      },
      profile: result.profile
    };
  }

  async login(email: string, password: string, ipAddress?: string): Promise<AuthSession> {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError('Account is suspended. Please contact platform administrator.', 403);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const profile = this.getUserProfile(user.id, user.role);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    auditService.logAction(
      user.id,
      user.role,
      'USER_LOGIN',
      'USERS',
      user.id,
      { email: user.email },
      ipAddress
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      profile
    };
  }

  getMe(userId: number): AuthSession {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const profile = this.getUserProfile(user.id, user.role);

    // Provide a fresh token as well
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      profile
    };
  }

  private getUserProfile(userId: number, role: UserRole): any {
    switch (role) {
      case 'SEEKER':
        return userRepository.getSeekerProfileByUserId(userId);
      case 'COMPANY':
        return userRepository.getCompanyProfileByUserId(userId);
      case 'UNIVERSITY':
        return userRepository.getUniversityProfileByUserId(userId);
      case 'ADMIN':
        return { role: 'ADMIN', name: 'System Administrator' };
      default:
        return null;
    }
  }
}

export const authService = new AuthService();
