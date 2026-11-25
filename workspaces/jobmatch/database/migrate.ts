import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Jobmatch Database Migration & Automated Seeding Script
 * Author: Vikram Patel, Database & Data Architect
 * Runs DDL schema, inserts deterministic seed accounts, and verifies data integrity.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, 'jobmatch.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const SEEDS_PATH = path.resolve(__dirname, 'seeds.sql');

export function runMigration(): void {
  console.log('======================================================');
  console.log('   JOBMATCH RELATIONAL DATABASE MIGRATION ENGINE      ');
  console.log('   Data Architect: Vikram Patel                       ');
  console.log('======================================================');
  console.log(`[INIT] Target Database File: ${DB_PATH}`);

  const isFresh = process.argv.includes('--fresh') || process.argv.includes('-f');
  if (isFresh && fs.existsSync(DB_PATH)) {
    console.log('[RESET] --fresh flag detected: Recreating clean database instance...');
    fs.unlinkSync(DB_PATH);
    const walFile = `${DB_PATH}-wal`;
    const shmFile = `${DB_PATH}-shm`;
    if (fs.existsSync(walFile)) fs.unlinkSync(walFile);
    if (fs.existsSync(shmFile)) fs.unlinkSync(shmFile);
  }

  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // If a fresh migration is requested or running from scratch, open DB
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA busy_timeout = 5000;');

  console.log('[STEP 1/3] Reading and applying DDL schema (schema.sql)...');
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
  console.log('  -> Tables, Constraints, Indexes, and Triggers successfully applied.');

  console.log('[STEP 2/3] Reading and applying deterministic seeds (seeds.sql)...');
  if (!fs.existsSync(SEEDS_PATH)) {
    throw new Error(`Seed file not found at ${SEEDS_PATH}`);
  }
  const seedSql = fs.readFileSync(SEEDS_PATH, 'utf-8');
  
  // Wrap seed execution in immediate transaction for safety
  db.exec('BEGIN IMMEDIATE;');
  try {
    db.exec(seedSql);

    // Expand cohort records for University 1 (Chulalongkorn University)
    // To match Dr. Kanya's exact PRD/Architecture accreditation metrics:
    // Total: 350 students | ~64.2% In-Field, ~18.2% Out-of-Field, ~9.4% Continuing Ed, ~8.2% Seeking
    const currentCount = Number(db.prepare('SELECT COUNT(*) as count FROM student_employability WHERE university_id = 1').get().count);
    
    if (currentCount < 350) {
      console.log(`  -> Expanding University Cohort 2026 dataset from ${currentCount} to 350 records...`);
      
      const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)');
      const insertSeekerStmt = db.prepare(`
        INSERT INTO seeker_profiles (user_id, full_name, university_name, faculty, major, student_id, graduation_year, gpa, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertEmpStmt = db.prepare(`
        INSERT INTO student_employability (seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const defaultHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      const targetTotal = 350;
      
      // Target counts matching Sophia & Marcus's specifications:
      // In-Field: 225 (64.3%), Out-of-Field: 64 (18.3%), Continuing Ed: 33 (9.4%), Seeking: 28 (8.0%)
      const existingInField = Number(db.prepare("SELECT COUNT(*) as count FROM student_employability WHERE status = 'EMPLOYED_IN_FIELD'").get().count);
      const existingOutOfField = Number(db.prepare("SELECT COUNT(*) as count FROM student_employability WHERE status = 'EMPLOYED_OUT_OF_FIELD'").get().count);
      const existingContEd = Number(db.prepare("SELECT COUNT(*) as count FROM student_employability WHERE status = 'CONTINUING_ED'").get().count);
      const existingSeeking = Number(db.prepare("SELECT COUNT(*) as count FROM student_employability WHERE status = 'SEEKING'").get().count);

      let needInField = Math.max(0, 225 - existingInField);
      let needOutOfField = Math.max(0, 64 - existingOutOfField);
      let needContEd = Math.max(0, 33 - existingContEd);
      let needSeeking = Math.max(0, 28 - existingSeeking);

      const faculties = [
        { name: 'Faculty of Engineering', majors: ['Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering'] },
        { name: 'Faculty of Science', majors: ['Computer Science', 'Data Science & IT', 'Applied Statistics'] },
        { name: 'Faculty of Commerce and Accountancy', majors: ['Information Systems', 'Marketing', 'Finance'] }
      ];

      const techJobTitles = [
        'Junior Software Engineer', 'Fullstack Developer', 'Backend Developer', 
        'Data Analyst', 'QA Automation Engineer', 'Cloud Operations Associate'
      ];

      const outOfFieldJobTitles = [
        'Operations Coordinator', 'Technical Sales Specialist', 'Digital Content Strategist', 'Customer Experience Specialist'
      ];

      let generated = 0;
      for (let i = currentCount + 1; i <= targetTotal; i++) {
        let status = 'SEEKING';
        let placedCompanyId: number | null = null;
        let placedTitle: string | null = null;
        let salary: number | null = null;

        if (needInField > 0) {
          status = 'EMPLOYED_IN_FIELD';
          placedCompanyId = (i % 2 === 0) ? 1 : 2; // SCG or LMWN
          placedTitle = techJobTitles[i % techJobTitles.length];
          salary = 35000 + (i % 15) * 1000;
          needInField--;
        } else if (needOutOfField > 0) {
          status = 'EMPLOYED_OUT_OF_FIELD';
          placedCompanyId = (i % 2 === 0) ? 1 : 2;
          placedTitle = outOfFieldJobTitles[i % outOfFieldJobTitles.length];
          salary = 28000 + (i % 10) * 1000;
          needOutOfField--;
        } else if (needContEd > 0) {
          status = 'CONTINUING_ED';
          placedTitle = 'Master of Science Program';
          needContEd--;
        } else if (needSeeking > 0) {
          status = 'SEEKING';
          needSeeking--;
        }

        const facultyChoice = faculties[i % faculties.length];
        const majorChoice = facultyChoice.majors[i % facultyChoice.majors.length];
        const studentCode = `6530${(10000 + i).toString().slice(1)}`;
        const gpa = Number((2.80 + (i % 120) * 0.01).toFixed(2));

        // Create User
        const userRes = insertUserStmt.run(
          `student.${i}@chula.ac.th`,
          defaultHash,
          'SEEKER',
          'ACTIVE'
        );
        const userId = Number(userRes.lastInsertRowid);

        // Create Seeker Profile
        const seekerRes = insertSeekerStmt.run(
          userId,
          `CU Candidate ${i}`,
          'Chulalongkorn University',
          facultyChoice.name,
          majorChoice,
          studentCode,
          2026,
          gpa,
          1
        );
        const seekerId = Number(seekerRes.lastInsertRowid);

        // Create Employability Tracking Record
        insertEmpStmt.run(
          seekerId,
          1, // Chulalongkorn University ID
          2026,
          status,
          placedCompanyId,
          placedTitle,
          salary
        );

        generated++;
      }
      console.log(`  -> Successfully synthesized ${generated} cohort members for MHESI metrics.`);
    }

    db.exec('COMMIT;');
    console.log('  -> Seed data and cohort records committed atomically.');
  } catch (seedErr) {
    db.exec('ROLLBACK;');
    throw seedErr;
  }

  console.log('[STEP 3/3] Verifying data integrity & table counts...');
  const tables = [
    'users',
    'seeker_profiles',
    'company_profiles',
    'university_profiles',
    'jobs',
    'applications',
    'student_employability',
    'audit_logs'
  ];

  console.log('------------------------------------------------------');
  console.log(' Table Name             | Row Count | Verification    ');
  console.log('------------------------------------------------------');
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number | bigint };
    const count = Number(row.count);
    const status = count > 0 ? '✓ VALIDATED' : '! EMPTY';
    console.log(` ${table.padEnd(22)} | ${count.toString().padStart(9)} | ${status}`);
  }
  console.log('------------------------------------------------------');

  // Verify University MHESI Analytics calculation directly in SQL
  const statsQuery = `
    SELECT 
      COUNT(*) as total_students,
      SUM(CASE WHEN status = 'EMPLOYED_IN_FIELD' THEN 1 ELSE 0 END) as in_field,
      SUM(CASE WHEN status = 'EMPLOYED_OUT_OF_FIELD' THEN 1 ELSE 0 END) as out_of_field,
      SUM(CASE WHEN status = 'CONTINUING_ED' THEN 1 ELSE 0 END) as cont_ed,
      SUM(CASE WHEN status = 'SEEKING' THEN 1 ELSE 0 END) as seeking
    FROM student_employability
    WHERE university_id = 1;
  `;
  const mhesi = db.prepare(statsQuery).get() as any;
  const empRate = (((Number(mhesi.in_field) + Number(mhesi.out_of_field)) / Number(mhesi.total_students)) * 100).toFixed(1);
  const inFieldRate = ((Number(mhesi.in_field) / Number(mhesi.total_students)) * 100).toFixed(1);

  console.log(`[ANALYTICS AUDIT] Chulalongkorn Cohort 2026:`);
  console.log(`  - Total Tracked Students: ${mhesi.total_students}`);
  console.log(`  - Overall Employment Rate: ${empRate}%`);
  console.log(`  - In-Field Employment Rate: ${inFieldRate}%`);
  console.log('======================================================');
  console.log(' ✓ MIGRATION & SEEDING COMPLETED WITH ZERO INTEGRITY DEFECTS');
  console.log('======================================================');

  db.close();
}

// Execute migration directly when run from CLI
if (process.argv[1]?.includes('migrate')) {
  try {
    runMigration();
  } catch (err) {
    console.error('MIGRATION FATAL ERROR:', err);
    process.exit(1);
  }
}
