/**
 * Shared Type Definitions & Contracts: Project Jobmatch
 * Managed by Vikram Patel, Database & Data Architect
 */

export type UserRole = 'SEEKER' | 'COMPANY' | 'UNIVERSITY' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export type JobType = 'FULL_TIME' | 'INTERNSHIP' | 'PART_TIME' | 'CONTRACT';
export type WorkplaceType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'SUSPENDED';

export type ApplicationStage = 
  | 'APPLIED' 
  | 'UNDER_REVIEW' 
  | 'SHORTLISTED' 
  | 'OFFERED' 
  | 'HIRED' 
  | 'REJECTED' 
  | 'WITHDRAWN';

export type EmployabilityStatus = 
  | 'SEEKING' 
  | 'EMPLOYED_IN_FIELD' 
  | 'EMPLOYED_OUT_OF_FIELD' 
  | 'CONTINUING_ED' 
  | 'FREELANCE_ENTREPRENEUR';

export type KYBStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

// ==========================================
// Database Entity Interfaces
// ==========================================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface SeekerProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone: string | null;
  university_name: string | null;
  faculty: string | null;
  major: string | null;
  student_id: string | null;
  graduation_year: number | null;
  gpa: number | null;
  bio: string | null;
  skills: string | null; // JSON string or comma-delimited
  resume_url: string | null;
  is_verified: number; // 0 or 1 SQLite boolean
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  tax_id: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  kyb_status: KYBStatus;
  created_at: string;
  updated_at: string;
}

export interface UniversityProfile {
  id: number;
  user_id: number;
  university_name: string;
  campus: string | null;
  contact_person: string | null;
  contact_email: string | null;
  phone: string | null;
  is_accredited: number; // 0 or 1 SQLite boolean
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  department: string | null;
  job_type: JobType;
  workplace_type: WorkplaceType;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  experience_level: string | null;
  description: string;
  requirements: string | null;
  skills_required: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  seeker_id: number;
  stage: ApplicationStage;
  cover_note: string | null;
  resume_snapshot_url: string | null;
  internal_notes: string | null;
  applied_at: string;
  updated_at: string;
}

export interface StudentEmployability {
  id: number;
  seeker_id: number;
  university_id: number;
  cohort_year: number;
  status: EmployabilityStatus;
  placed_company_id: number | null;
  placed_job_title: string | null;
  starting_salary: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: number | null;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: string | null; // JSON String
  ip_address: string | null;
  created_at: string;
}

// ==========================================
// API DTOs and Composite Response Contracts
// ==========================================

export interface AuthSession {
  token: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
  profile: SeekerProfile | CompanyProfile | UniversityProfile | null;
}

export interface JobWithCompany extends Job {
  company_name: string;
  company_logo: string | null;
  company_industry: string | null;
  kyb_status: KYBStatus;
}

export interface ApplicationWithDetails extends Application {
  job_title: string;
  job_type: JobType;
  company_name: string;
  company_logo: string | null;
  location: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_university?: string;
  candidate_faculty?: string;
  candidate_major?: string;
  candidate_gpa?: number;
  candidate_skills?: string[];
  candidate_resume_url?: string;
}

export interface UniversityAnalyticsResponse {
  totalMonitoredStudents: number;
  employmentRate: number;
  outcomes: {
    employedInField: number;
    employedOutOfField: number;
    continuingEd: number;
    seeking: number;
    entrepreneur?: number;
  };
  topHiringSectors: Array<{
    sector: string;
    percentage: number;
  }>;
}
