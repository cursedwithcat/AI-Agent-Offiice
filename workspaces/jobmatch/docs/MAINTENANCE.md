# Jobmatch Maintenance & Support Operations Manual
**Target Project:** Jobmatch (4-Sided Talent & Employability Ecosystem)  
**Maintenance & Support Lead:** Lucas Miller  
**Target Directory:** [`jobmatch/`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch)  
**Initial Baseline Date:** November 2, 2026  
**Operational Status:** 🟢 **ACTIVE MAINTENANCE & SUPPORT MODE**

---

## 1. Maintenance Registration & Operational Baseline

The Jobmatch platform has formally transitioned from initial greenfield development into **Active Maintenance & Support Phase**. Lucas Miller serves as the central operational commander and primary point of contact for all modifications, enhancements, bug reports, and maintenance escalations.

### 1.1 Verified System Baseline
- **Application Version:** `1.0.0`
- **Core Architecture:** 4-Sided Multi-Tenant Ecosystem (`SEEKER`, `COMPANY`, `UNIVERSITY`, `ADMIN`)
- **Technology Stack:**
  - Client: React 18 + TypeScript + Vite + Tailwind CSS (`#2563EB` Royal Blue Theme)
  - Backend: Node.js 24 + Express + TypeScript + Zod Validation + Multer
  - Database: Node.js Native SQLite (`node:sqlite` DatabaseSync), WAL Mode (`PRAGMA journal_mode = WAL;`)
- **Automated Verification:** 10/10 Test Suites Passing (28 assertion checkpoints)
- **Production Build:** Transformed 1609 modules, zero TypeScript or bundling errors

---

## 2. Maintenance & Dispatch Ticket (MDT) Routing Matrix

All client change requests and issues are triaged by Lucas Miller and dispatched to the designated specialist:

| Specialization Area | Agent Specialist | Primary Responsibilities & Target Files |
| :--- | :--- | :--- |
| **UI/UX & Design Changes** | **Maya Lin**<br>*(Lead UI/UX Designer)* | • Visual styling, Tailwind tokens, color palette updates<br>• Responsive layout adjustments (desktop & 420px mobile simulator)<br>• [`client/tailwind.config.js`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/client/tailwind.config.js), [`client/src/components/tokens/DesignTokensView.tsx`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/client/src/components/tokens/DesignTokensView.tsx) |
| **Database & Schema Updates** | **Vikram Patel**<br>*(Database Architect)* | • SQLite schema changes, indexes, foreign keys, triggers<br>• Migration scripts and deterministic test seeds<br>• [`database/schema.sql`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/database/schema.sql), [`database/seeds.sql`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/database/seeds.sql), [`database/db.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/database/db.ts), [`database/migrate.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/database/migrate.ts) |
| **Backend & Business Logic** | **Sean O'Connor**<br>*(Senior Backend Engineer)* | • Express controllers, REST routes, services, repositories<br>• Atomic cross-domain sync engine (`HIRED` ➔ `EMPLOYED_IN_FIELD`)<br>• [`server/src/controllers/`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/controllers/), [`server/src/services/`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/services/), [`server/src/repositories/`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/repositories/) |
| **Client UI & React State** | **David Kim**<br>*(Senior Frontend Engineer)* | • React components, hooks, contexts (`AuthContext`, `ToastContext`)<br>• ATS Kanban board, faceted search filters, application stepper<br>• [`client/src/App.tsx`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/client/src/App.tsx), [`client/src/pages/HomePage.tsx`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/client/src/pages/HomePage.tsx), [`client/src/components/`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/client/src/components/) |
| **Security & Hardening** | **Samira Khan**<br>*(Security Specialist)* | • OWASP Top 10 mitigation, IDOR defenses, CORS whitelisting<br>• JWT authentication, password hashing, PDPA audit trails<br>• [`server/src/middleware/auth.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/middleware/auth.ts), [`server/src/middleware/rbac.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/middleware/rbac.ts), [`server/src/services/auditService.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/src/services/auditService.ts) |
| **Quality Verification & QA** | **Elena Rostova**<br>*(QA & Release Lead)* | • Integration test suites, regression test execution<br>• API contract validation, multi-persona scenario verification<br>• [`server/test_api.ts`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/server/test_api.ts) |
| **Business Scope & PRD** | **Sophia Chen**<br>*(Product Manager)* | • Feature requirements, user stories, acceptance criteria<br>• Scope definition and stakeholder alignment<br>• [`docs/PRD.md`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/docs/PRD.md) |

---

## 3. SLA & Incident Severity Classification

| Severity Level | Definition | Response Target | Resolution Target |
| :--- | :--- | :--- | :--- |
| **P0 - Blocker** | System down, data corruption, auth bypass, sync failure | < 15 minutes | < 2 hours (Hotfix) |
| **P1 - Critical** | Major persona blocked (e.g. ATS Kanban down, applications failing) | < 30 minutes | < 6 hours |
| **P2 - Major** | Non-blocking functional defect, reporting calculation anomaly | < 2 hours | < 24 hours |
| **P3 - Minor / Enhancement**| Cosmetic UI adjustment, copy change, performance enhancement | < 4 hours | Next release sprint |

---

## 4. Standard Operational Procedures (Runbook)

### 4.1 System Health Diagnostics
Execute the health check against the live API:
```bash
curl http://localhost:5000/api/health
```
Expected Response:
```json
{
  "status": "UP",
  "service": "Jobmatch REST API Backend",
  "database": "CONNECTED (WAL Mode)"
}
```

### 4.2 Automated Quality & Regression Gate
Before declaring any patch complete, execute the full regression suite:
```bash
npm run test
# Or
npm run test:server
```

### 4.3 Database Maintenance & Re-seeding
To reset and re-seed the SQLite database deterministically:
```bash
npm run db:migrate
```

### 4.4 Production Compilation Check
Verify client and server compilation:
```bash
npm run build
```

---

## 5. Maintenance Change Log

| Version / Date | Type | Author | Description |
| :--- | :--- | :--- | :--- |
| **v1.0.0** (2026-11-02) | **Release** | Engineering Core / Elena Rostova | Initial production release covering all 4 personas, SQLite WAL, ATS Kanban, Atomic Sync, and Thai PDPA audit logs. |
| **v1.0.1** (2026-11-02) | **Maintenance Patch** | Lucas Miller | Added unified root build scripts (`build`, `build:client`, `build:server`, `test`) to [`package.json`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/package.json), established operational maintenance manual [`docs/MAINTENANCE.md`](file:///C:/Users/b/OneDrive/Desktop/Agent%20Office/workspaces/jobmatch/docs/MAINTENANCE.md). |
