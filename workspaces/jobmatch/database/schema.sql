-- ======================================================================
-- Jobmatch Relational Database Schema (DDL)
-- Data Architect: Vikram Patel
-- Engine: SQLite 3 with WAL Mode & Enforced Foreign Keys
-- Standards: Strict Data Integrity, ANSI SQL types, Optimized Indexes
-- ======================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------
-- 1. Core Users Table
-- Central authentication registry for all 4 roles.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SEEKER', 'COMPANY', 'UNIVERSITY', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role, status);

-- ----------------------------------------------------------------------
-- 2. Seeker Profiles Table
-- Detailed talent profile, university credentials, and resume snapshot.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seeker_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    university_name TEXT,
    faculty TEXT,
    major TEXT,
    student_id TEXT,
    graduation_year INTEGER,
    gpa REAL CHECK (gpa IS NULL OR (gpa >= 0.00 AND gpa <= 4.00)),
    bio TEXT,
    skills TEXT, -- Stored as JSON array string, e.g. ["React","Node.js","PostgreSQL"]
    resume_url TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seeker_user_id ON seeker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_seeker_university ON seeker_profiles (university_name, graduation_year);

-- ----------------------------------------------------------------------
-- 3. Company Profiles Table
-- Corporate legal entities, industry, KYB status, and branding.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    tax_id TEXT,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    address TEXT,
    kyb_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (kyb_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_user_id ON company_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_company_kyb_status ON company_profiles (kyb_status);
CREATE INDEX IF NOT EXISTS idx_company_name ON company_profiles (company_name COLLATE NOCASE);

-- ----------------------------------------------------------------------
-- 4. University Profiles Table
-- Accredited academic institutions, campuses, and authorized career officers.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS university_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    university_name TEXT NOT NULL,
    campus TEXT,
    contact_person TEXT,
    contact_email TEXT,
    phone TEXT,
    is_accredited INTEGER NOT NULL DEFAULT 1 CHECK (is_accredited IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_university_user_id ON university_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_university_name ON university_profiles (university_name COLLATE NOCASE);

-- ----------------------------------------------------------------------
-- 5. Jobs Table
-- Requisitions posted by employers with full search criteria and filters.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    job_type TEXT NOT NULL CHECK (job_type IN ('FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'CONTRACT')),
    workplace_type TEXT NOT NULL CHECK (workplace_type IN ('ON_SITE', 'HYBRID', 'REMOTE')),
    location TEXT NOT NULL,
    salary_min INTEGER CHECK (salary_min IS NULL OR salary_min >= 0),
    salary_max INTEGER CHECK (salary_max IS NULL OR salary_max >= 0),
    salary_currency TEXT NOT NULL DEFAULT 'THB',
    experience_level TEXT,
    description TEXT NOT NULL,
    requirements TEXT,
    skills_required TEXT, -- Stored as JSON array string or comma-delimited
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'SUSPENDED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min),
    FOREIGN KEY (company_id) REFERENCES company_profiles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs (status, job_type, location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);

-- ----------------------------------------------------------------------
-- 6. Applications Table
-- ATS progression pipeline. Unique per (job_id, seeker_id).
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    seeker_id INTEGER NOT NULL,
    stage TEXT NOT NULL DEFAULT 'APPLIED' CHECK (stage IN (
        'APPLIED', 
        'UNDER_REVIEW', 
        'SHORTLISTED', 
        'OFFERED', 
        'HIRED', 
        'REJECTED', 
        'WITHDRAWN'
    )),
    cover_note TEXT,
    resume_snapshot_url TEXT,
    internal_notes TEXT,
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (job_id, seeker_id),
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES seeker_profiles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications (job_id, stage);
CREATE INDEX IF NOT EXISTS idx_applications_seeker ON applications (seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications (stage);

-- ----------------------------------------------------------------------
-- 7. Student Employability Table
-- Real-time MHESI cohort tracking synchronized with ATS stage transitions.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_employability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seeker_id INTEGER NOT NULL UNIQUE,
    university_id INTEGER NOT NULL,
    cohort_year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'SEEKING' CHECK (status IN (
        'SEEKING', 
        'EMPLOYED_IN_FIELD', 
        'EMPLOYED_OUT_OF_FIELD', 
        'CONTINUING_ED', 
        'FREELANCE_ENTREPRENEUR'
    )),
    placed_company_id INTEGER,
    placed_job_title TEXT,
    starting_salary INTEGER CHECK (starting_salary IS NULL OR starting_salary >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (seeker_id) REFERENCES seeker_profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES university_profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (placed_company_id) REFERENCES company_profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_student_emp_uni ON student_employability (university_id, cohort_year, status);
CREATE INDEX IF NOT EXISTS idx_student_emp_seeker ON student_employability (seeker_id);

-- ----------------------------------------------------------------------
-- 8. Audit Logs Table
-- Immutable activity log for PDPA compliance, moderation, and security auditing.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    details TEXT, -- JSON String
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ----------------------------------------------------------------------
-- Automated Timestamp Triggers
-- ----------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_seeker_updated_at AFTER UPDATE ON seeker_profiles
BEGIN
    UPDATE seeker_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_company_updated_at AFTER UPDATE ON company_profiles
BEGIN
    UPDATE company_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_university_updated_at AFTER UPDATE ON university_profiles
BEGIN
    UPDATE university_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_jobs_updated_at AFTER UPDATE ON jobs
BEGIN
    UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_applications_updated_at AFTER UPDATE ON applications
BEGIN
    UPDATE applications SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_student_emp_updated_at AFTER UPDATE ON student_employability
BEGIN
    UPDATE student_employability SET updated_at = datetime('now') WHERE id = NEW.id;
END;
