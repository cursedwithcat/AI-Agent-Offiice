# Jobmatch Database & Data Storage Layer

**Data Architect:** Vikram Patel  
**Database Engine:** SQLite 3 (Node.js Native `node:sqlite` / `DatabaseSync`)  
**Storage Architecture:** WAL (Write-Ahead Logging) Mode with Enforced Referential Integrity  

---

## 1. Storage Configuration & PRAGMAs

To achieve microsecond query execution while guaranteeing ACID compliance and zero race conditions, the following engine PRAGMAs are strictly enforced:

```sql
PRAGMA foreign_keys = ON;         -- Guarantees relational referential integrity (cascading deletes & set nulls)
PRAGMA journal_mode = WAL;        -- High-concurrency Write-Ahead Logging (concurrent reads during writes)
PRAGMA synchronous = NORMAL;      -- Optimal balance of disk durability and benchmark throughput
PRAGMA busy_timeout = 5000;       -- Prevents database locks under concurrent HTTP requests
```

---

## 2. Relational Schema Architecture

| Table Name | Primary Role & Description | Primary Key & Foreign Keys | Key Indexes |
| :--- | :--- | :--- | :--- |
| **`users`** | Central authentication registry for all 4 roles (`SEEKER`, `COMPANY`, `UNIVERSITY`, `ADMIN`) | `id` PK (Autoincrement) | `idx_users_email` (UNIQUE, NOCASE)<br>`idx_users_role` (`role`, `status`) |
| **`seeker_profiles`** | Academic credentials, verified status, GPA, skills array, and PDF resume snapshot | `id` PK<br>`user_id` FK ➔ `users(id)` ON DELETE CASCADE | `idx_seeker_user_id`<br>`idx_seeker_university` |
| **`company_profiles`** | Corporate identity, tax registration, KYB moderation status, and branding | `id` PK<br>`user_id` FK ➔ `users(id)` ON DELETE CASCADE | `idx_company_user_id`<br>`idx_company_kyb_status`<br>`idx_company_name` |
| **`university_profiles`**| Higher education institution, accredited campus, and authorized career officers | `id` PK<br>`user_id` FK ➔ `users(id)` ON DELETE CASCADE | `idx_university_user_id`<br>`idx_university_name` |
| **`jobs`** | Requisitions posted by employers with full search, salary, and filter fields | `id` PK<br>`company_id` FK ➔ `company_profiles(id)` ON DELETE CASCADE | `idx_jobs_company_id`<br>`idx_jobs_search` (`status`, `job_type`, `location`)<br>`idx_jobs_created_at` |
| **`applications`** | ATS candidate progression pipeline. Enforces `UNIQUE(job_id, seeker_id)` | `id` PK<br>`job_id` FK ➔ `jobs(id)`<br>`seeker_id` FK ➔ `seeker_profiles(id)` | `idx_applications_job` (`job_id`, `stage`)<br>`idx_applications_seeker`<br>`idx_applications_stage` |
| **`student_employability`** | Cohort employability tracking synchronized atomically with ATS hire events | `id` PK<br>`seeker_id` FK (UNIQUE)<br>`university_id` FK<br>`placed_company_id` FK | `idx_student_emp_uni` (`university_id`, `cohort_year`, `status`)<br>`idx_student_emp_seeker` |
| **`audit_logs`** | Tamper-evident PDPA compliance & security action audit log | `id` PK<br>`actor_id` FK ➔ `users(id)` ON DELETE SET NULL | `idx_audit_logs_actor`<br>`idx_audit_logs_target`<br>`idx_audit_logs_created_at` |

---

## 3. Seed Accounts & Default Test Credentials

All pre-seeded test accounts share the standard test password: **`password123`** (hashed using bcrypt with cost factor 10).

| Persona / Role | Email | Status | Organization / Entity |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@jobmatch.co` | `ACTIVE` | Jobmatch Governance & Compliance |
| **COMPANY** | `hr@scg.co.th` | `ACTIVE` (KYB `VERIFIED`) | SCG (Siam Cement Group) |
| **COMPANY** | `recruitment@linemanwongnai.com` | `ACTIVE` (KYB `VERIFIED`) | LINE MAN Wongnai |
| **COMPANY (Pending)** | `hr@startupthai.io` | `PENDING_VERIFICATION` | StartupThai Innovations Co., Ltd. |
| **UNIVERSITY** | `career@chula.ac.th` | `ACTIVE` (Accredited) | Chulalongkorn University |
| **SEEKER (Hired)** | `somchai.s@student.chula.ac.th` | `ACTIVE` (Verified) | Somchai Saetang (CS Senior, GPA 3.82) |
| **SEEKER (Reviewing)** | `napat.k@student.chula.ac.th` | `ACTIVE` (Verified) | Napat Kittisuk (Software Eng, GPA 3.65) |
| **SEEKER (Continuing Ed)**| `ploy.t@student.chula.ac.th` | `ACTIVE` (Verified) | Ploy Thanasuk (Info Systems, GPA 3.50) |
| **SEEKER (Offered)** | `ananda.m@student.chula.ac.th` | `ACTIVE` (Verified) | Ananda Mueangthai (Data Science, GPA 3.75) |

---

## 4. Atomic Cross-Domain Synchronization Pattern

When a company advances an application to `HIRED`:

```typescript
import { runTransaction } from './db.js';

runTransaction((db) => {
  // 1. Advance Application stage
  db.prepare(`
    UPDATE applications 
    SET stage = 'HIRED', updated_at = datetime('now') 
    WHERE id = ?
  `).run(applicationId);

  // 2. Fetch candidate and job context
  const app = db.prepare(`
    SELECT a.seeker_id, j.company_id, j.title, j.salary_min 
    FROM applications a 
    JOIN jobs j ON a.job_id = j.id 
    WHERE a.id = ?
  `).get(applicationId);

  // 3. Atomically update university graduate outcome record
  db.prepare(`
    UPDATE student_employability 
    SET status = 'EMPLOYED_IN_FIELD', 
        placed_company_id = ?, 
        placed_job_title = ?, 
        starting_salary = COALESCE(?, starting_salary),
        updated_at = datetime('now') 
    WHERE seeker_id = ?
  `).run(app.company_id, app.title, app.salary_min, app.seeker_id);

  // 4. Record tamper-evident audit event
  db.prepare(`
    INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address)
    VALUES (?, 'COMPANY', 'STAGE_TRANSITION_HIRED', 'APPLICATION', ?, ?, ?)
  `).run(actorUserId, applicationId, JSON.stringify({ seekerId: app.seeker_id, title: app.title }), ip);
});
```

---

## 5. Migration Execution Commands

```bash
# Standard idempotent migration & seeding
npm run db:migrate

# Complete clean wipe and fresh migration
npm run db:migrate -- --fresh
```
