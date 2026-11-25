process.env.AUTO_START = 'false';

import http from 'node:http';
import app, { startServer } from './src/index.js';

const PORT = 5055;

let server: http.Server;

async function request(path: string, options: {
  method?: string;
  token?: string;
  body?: any;
  headers?: Record<string, string>;
} = {}): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${PORT}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers
    }, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(rawData);
          resolve({ status: res.statusCode || 200, data, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode || 200, data: rawData, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition: boolean, message: string, extra?: any) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`, extra ? JSON.stringify(extra) : '');
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ PASSED: ${message}`);
}

async function runTests() {
  console.log('======================================================');
  console.log('  STARTING JOBMATCH BACKEND API VERIFICATION SUITE    ');
  console.log('======================================================\n');

  server = startServer(PORT);
  await new Promise(r => setTimeout(r, 600));

  try {
    // 1. Health check
    console.log('[TEST 1] System Health & Database Diagnostics:');
    const health = await request('/api/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK', health);
    assert(health.data.database.includes('WAL Mode'), 'SQLite WAL mode active and confirmed');

    // 2. Authentication - Seeded personas login
    console.log('\n[TEST 2] Authentication & Role Identification:');
    // Admin login
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@jobmatch.co', password: 'password123' }
    });
    assert(adminLogin.status === 200, 'Admin login succeeded', adminLogin);
    const adminToken = adminLogin.data.token;
    assert(adminLogin.data.user.role === 'ADMIN', 'Admin role verified');

    // Company login (SCG)
    const companyLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'hr@scg.co.th', password: 'password123' }
    });
    assert(companyLogin.status === 200, 'Company (SCG) login succeeded', companyLogin);
    const companyToken = companyLogin.data.token;
    assert(companyLogin.data.user.role === 'COMPANY', 'Company role verified');

    // University login (Chulalongkorn)
    const uniLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'career@chula.ac.th', password: 'password123' }
    });
    assert(uniLogin.status === 200, 'University login succeeded', uniLogin);
    const uniToken = uniLogin.data.token;
    assert(uniLogin.data.user.role === 'UNIVERSITY', 'University role verified');

    // Seeker login (Somchai)
    const seekerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'somchai.s@student.chula.ac.th', password: 'password123' }
    });
    assert(seekerLogin.status === 200, 'Seeker (Somchai) login succeeded', seekerLogin);
    const seekerToken = seekerLogin.data.token;
    assert(seekerLogin.data.user.role === 'SEEKER', 'Seeker role verified');

    // Verify /api/auth/me
    const meRes = await request('/api/auth/me', { token: seekerToken });
    assert(meRes.status === 200, 'GET /api/auth/me returned 200');
    assert(meRes.data.profile.full_name.includes('สมชาย'), 'Profile matches seeker record');

    // 3. Job Requisitions (Public & Filters)
    console.log('\n[TEST 3] Job Requisitions & Search Filters:');
    const publicJobs = await request('/api/jobs?keyword=Developer&limit=5');
    assert(publicJobs.status === 200, 'Public job query succeeded');
    assert(publicJobs.data.jobs.length > 0, `Returned ${publicJobs.data.jobs.length} matching jobs`);
    const targetJobId = publicJobs.data.jobs[0].id;

    // Single Job details
    const jobDetail = await request(`/api/jobs/${targetJobId}`);
    assert(jobDetail.status === 200, 'Job details endpoint succeeded');
    assert(jobDetail.data.job.company_name !== undefined, 'Job includes joined company profile');

    // 4. Company Requisition Creation
    console.log('\n[TEST 4] Company Creates New Requisition:');
    const newJob = await request('/api/jobs', {
      method: 'POST',
      token: companyToken,
      body: {
        title: 'Backend Systems Engineer (Rust / Node.js)',
        department: 'High-Throughput Services',
        jobType: 'FULL_TIME',
        workplaceType: 'HYBRID',
        location: 'Bangsue, Bangkok',
        salaryMin: 55000,
        salaryMax: 85000,
        salaryCurrency: 'THB',
        experienceLevel: 'Mid to Senior',
        description: 'Design resilient microservices handling high-concurrency transactions for SCG enterprise partners.',
        requirements: 'Proficiency in TypeScript, Node.js, and SQL. Understanding of distributed systems.',
        skillsRequired: ['TypeScript', 'Node.js', 'SQL', 'Docker'],
        status: 'PUBLISHED'
      }
    });
    assert(newJob.status === 201, 'New job created with HTTP 201 Created');
    const createdJobId = newJob.data.job.id;

    // 5. Seeker Registration & 1-Click Application
    console.log('\n[TEST 5] Candidate Registration & 1-Click Apply:');
    const candidateEmail = `test.candidate.${Date.now()}@student.chula.ac.th`;
    const newCandidate = await request('/api/auth/register', {
      method: 'POST',
      body: {
        email: candidateEmail,
        password: 'password123',
        role: 'SEEKER',
        profileData: {
          fullName: 'วรรณภา วรรณสิทธิ์ (Wannapha Wannasit)',
          phone: '089-999-8888',
          universityName: 'Chulalongkorn University',
          faculty: 'Faculty of Engineering',
          major: 'Information Systems',
          studentId: '6530999921',
          graduationYear: 2026,
          gpa: 3.88,
          skills: ['Node.js', 'TypeScript', 'React', 'SQL']
        }
      }
    });
    assert(newCandidate.status === 201, 'New seeker candidate registered', newCandidate);
    const candidateToken = newCandidate.data.token;

    // Seeker applies to the newly created job
    const applyRes = await request('/api/applications', {
      method: 'POST',
      token: candidateToken,
      body: {
        jobId: createdJobId,
        coverNote: 'Excited to apply for the Backend Systems Engineer role!'
      }
    });
    assert(applyRes.status === 201, 'Seeker successfully submitted 1-Click application', applyRes);
    const newAppId = applyRes.data.applicationId;

    // Duplicate check enforcement
    const dupRes = await request('/api/applications', {
      method: 'POST',
      token: candidateToken,
      body: { jobId: createdJobId }
    });
    assert(dupRes.status === 409, 'Duplicate application correctly rejected with HTTP 409 Conflict');

    // 6. ATS Pipeline & Kanban Board
    console.log('\n[TEST 6] Company ATS Kanban Pipeline:');
    const applicants = await request(`/api/applications/job/${createdJobId}`, {
      token: companyToken
    });
    assert(applicants.status === 200, 'Retrieved applicant pipeline');
    assert(applicants.data.applicants.length === 1, 'Candidate visible in Kanban column');

    // 7. ADR-002: Atomic Cross-Domain Employment Sync
    console.log('\n[TEST 7] Atomic Cross-Domain State Synchronization:');
    // Progress to UNDER_REVIEW
    await request(`/api/applications/${newAppId}/stage`, {
      method: 'PATCH',
      token: companyToken,
      body: { stage: 'UNDER_REVIEW', internalNotes: 'Profile matches requirements' }
    });

    // Hire candidate: MUST atomically update student_employability to EMPLOYED_IN_FIELD
    const hireRes = await request(`/api/applications/${newAppId}/stage`, {
      method: 'PATCH',
      token: companyToken,
      body: { stage: 'HIRED', internalNotes: 'Offer accepted! 70,000 THB/month' }
    });
    assert(hireRes.status === 200, 'Application stage updated to HIRED', hireRes);
    assert(hireRes.data.employabilitySyncStatus === 'SYNCED', 'Cross-domain sync triggered and reported SYNCED');

    // 8. University Cohort & MHESI Accreditation Metrics
    console.log('\n[TEST 8] University Cohort Roster & MHESI Analytics:');
    const uniAnalytics = await request('/api/university/analytics?cohort=2026', {
      token: uniToken
    });
    assert(uniAnalytics.status === 200, 'University analytics returned 200');
    assert(uniAnalytics.data.totalMonitoredStudents >= 350, `Monitored students count: ${uniAnalytics.data.totalMonitoredStudents}`);
    assert(uniAnalytics.data.employmentRate > 80, `Verified employment rate: ${uniAnalytics.data.employmentRate}%`);

    // University search roster
    const roster = await request('/api/university/students?cohort=2026&status=EMPLOYED_IN_FIELD&limit=5', {
      token: uniToken
    });
    assert(roster.status === 200, 'University student roster fetched successfully');
    assert(roster.data.students.length > 0, 'Found students in field');

    // University MHESI Export
    const mhesiExport = await request('/api/university/export-mhesi', {
      method: 'POST',
      token: uniToken,
      body: { cohort: 2026 }
    });
    assert(mhesiExport.status === 200, 'MHESI Accreditation export succeeded');
    assert(mhesiExport.data.meta.standard.includes('MHESI'), 'Export standard format validated');

    // 9. Admin Governance & Auditing
    console.log('\n[TEST 9] Admin Command Center & Security Audit:');
    const adminStats = await request('/api/admin/stats', {
      token: adminToken
    });
    assert(adminStats.status === 200, 'Admin platform statistics fetched');
    assert(adminStats.data.stats.totalJobs > 0, 'Platform jobs tracked');

    // Company KYB verification
    const kybRes = await request('/api/admin/users/3/kyb', {
      method: 'PATCH',
      token: adminToken,
      body: { kybStatus: 'VERIFIED' }
    });
    assert(kybRes.status === 200, 'Admin verified company KYB status');

    // Audit logs
    const auditLogs = await request('/api/admin/audit-logs?limit=5', {
      token: adminToken
    });
    assert(auditLogs.status === 200, 'Security audit logs fetched');
    assert(auditLogs.data.logs.length > 0, 'Audit trail records verified');

    // 10. DevSecOps & OWASP Defensive Controls Hardening
    console.log('\n[TEST 10] DevSecOps & OWASP Defensive Controls Hardening:');
    
    // 10.1 HTTP Security Headers & Information Disclosure Check
    const healthHeaderCheck = await request('/api/health');
    assert(healthHeaderCheck.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff header verified');
    assert(healthHeaderCheck.headers['x-frame-options'] === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header verified');
    assert(healthHeaderCheck.headers['x-powered-by'] === undefined, 'Express signature suppressed (X-Powered-By masked)');

    // 10.2 OWASP A01: IDOR Access Control Enforcement
    // Somchai (seekerToken) attempting to access Wannapha's application (newAppId)
    const unauthorizedAccess = await request(`/api/applications/${newAppId}`, {
      token: seekerToken
    });
    assert(unauthorizedAccess.status === 403, 'OWASP A01: IDOR attack blocked with HTTP 403 Forbidden', unauthorizedAccess);

    // 10.3 Candidate Data Privacy: Candidate viewing their own application has internal notes redacted
    const candidateSelfAccess = await request(`/api/applications/${newAppId}`, {
      token: candidateToken
    });
    assert(candidateSelfAccess.status === 200, 'Candidate can access their own application');
    assert(candidateSelfAccess.data.application.internal_notes === undefined, 'Confidential internal_notes redacted from candidate view');

    // 10.4 Company viewing their applicant gets authorized access
    const companyAccess = await request(`/api/applications/${newAppId}`, {
      token: companyToken
    });
    assert(companyAccess.status === 200, 'Authorized company can access application details');

    // 10.5 CORS Whitelist Protection
    const allowedCorsReq = await request('/api/health', {
      headers: { Origin: 'http://localhost:5173' }
    });
    assert(allowedCorsReq.headers['access-control-allow-origin'] === 'http://localhost:5173', 'CORS allows approved origin');

    console.log('\n======================================================');
    console.log('  ✓ ALL 10 TEST SUITES COMPLETED WITH ZERO DEFECTS    ');
    console.log('======================================================\n');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
