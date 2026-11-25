# Jobmatch (ระบบแพลตฟอร์มหางานและติดตามการมีงานทำ 4 บทบาท)
**4-Sided Talent & Employability Ecosystem**  
*Royal Blue Modern Design System (#2563EB) • Node.js Native SQLite WAL Engine • Thai PDPA Compliant*

---

## 🌟 ภาพรวมระบบ (System Overview)

**Jobmatch** เป็นแพลตฟอร์มบริหารจัดการการจ้างงานและติดตามภาวะการมีงานทำแบบครบวงจร 4 บทบาท ออกแบบเพื่อเชื่อมต่อความต้องการของ 4 ฝ่ายเข้าด้วยกันอย่างโปร่งใสและมีประสิทธิภาพ:

1. **🎓 ผู้หางาน / นิสิตนักศึกษา (Job Seeker):**
   - ค้นหาตำแหน่งงานด้วย Faceted Filter (ประเภทงาน, สถานที่, ทำงานจากบ้าน, เงินเดือน)
   - สมัครงานได้ทันทีในคลิกเดียว (**1-Click Apply**)
   - อัปโหลดเรซูเมไฟล์ PDF (ระบบตรวจสอบ MIME Type และขนาดไม่เกิน 5MB)
   - แดชบอร์ดติดตามสถานะการสมัครแบบเรียลไทม์ พร้อม Stepper แสดงขั้นตอนชัดเจน
   - มีป้ายกำกับรับรองสถานะนิสิตจากสถาบันการศึกษา (University Verified Badge)

2. **🏢 บริษัท / นายจ้าง (Company / Employer):**
   - สร้างและจัดการประกาศงาน (Draft, Published, Closed)
   - ระบบบริหารจัดการผู้สมัคร **ATS (Applicant Tracking System)** รองรับทั้งมุมมอง **Kanban Board** และ **Compact Table**
   - เลื่อนสถานะผู้สมัครตาม Pipeline (`APPLIED` ➔ `UNDER_REVIEW` ➔ `SHORTLISTED` ➔ `HIRED`)
   - **Cross-Domain Atomic Synchronization:** เมื่อกดรับเข้าทำงาน (`HIRED`) ระบบจะซิงก์ข้อมูลไปยังทะเบียนสถิติของมหาวิทยาลัยโดยอัตโนมัติ (`EMPLOYED_IN_FIELD`)

3. **🏫 มหาวิทยาลัย / ศูนย์พัฒนามหาวิทยาลัย (University Career Center):**
   - แดชบอร์ดสถิติ KPI อัตราการได้งานทำของบัณฑิต (Employment Rate) ตามมาตรฐานกระทรวง อว. (MHESI)
   - สรุปสัดส่วนการได้งานทำตรงสาย (In-Field) เทียบกับไม่ตรงสาย (Out-of-Field)
   - รายชื่อและทะเบียนนิสิต (Student Roster) พร้อมฟิลเตอร์ค้นหาและสถานะการทำงาน
   - ระบบส่งออกรายงานมาตรฐาน MHESI Accreditation Format

4. **🛡️ ผู้ดูแลระบบ (Platform Admin):**
   - ตรวจสอบเอกสารและอนุมัตินิติบุคคลบริษัท (**KYB Verification Queue**)
   - ระงับหรือเปิดใช้งานประกาศงานที่น่าสงสัย (Job Moderation)
   - ตรวจสอบประวัติการใช้งานและบันทึกความปลอดภัย (**PDPA Security Audit Trail**)

---

## 🚀 สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend Client:** React 18 + TypeScript + Vite + Tailwind CSS (Royal Blue Primary `#2563EB`) + Lucide Icons
- **Backend API:** Node.js 24 + Express + TypeScript + Zod Validation + Multer (PDF File Engine)
- **Database:** Node.js Native SQLite (`node:sqlite` DatabaseSync) เปิดใช้งาน **WAL (Write-Ahead Logging) Mode** และ Transactional Safety
- **Security & RBAC:** JWT (JSON Web Token), Bcrypt Password Hashing, Role-Based Access Control, OWASP Defensive Headers, IDOR Protection

---

## 🔑 บัญชีทดสอบที่ติดตั้งล่วงหน้า (Pre-seeded Accounts)

ระบบได้เตรียมข้อมูลจำลองและบัญชีผู้ใช้งานครอบคลุมทั้ง 4 บทบาท พร้อมรหัสผ่านเริ่มต้น:

| บทบาท (Role) | บัญชีผู้ใช้งาน (Email) | รหัสผ่าน (Password) | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| **1. Job Seeker** | `somchai.s@student.chula.ac.th` | `Password123!` | นายสมชาย แซ่ตั้ง (นิสิตวิทยาการคอมพิวเตอร์ จุฬาฯ) |
| **2. Company** | `hr@scg.co.th` | `Password123!` | บริษัท เอสซีจี จำกัด (SCG Digital Ventures) |
| **3. University** | `career@chula.ac.th` | `Password123!` | ฝ่ายพัฒนาศักยภาพนิสิตและอาชีพ จุฬาลงกรณ์มหาวิทยาลัย |
| **4. Admin** | `admin@jobmatch.co` | `Password123!` | ผู้ดูแลระบบแพลตฟอร์มส่วนกลาง (Platform Admin) |

> 💡 **Tip:** หน้าเว็บมีแถบ **Quick Persona Switcher** ด้านบนสุด ช่วยให้สามารถสลับบทบาทไปมาระหว่าง Seeker, Company, University, Admin และ Design Tokens ได้ในคลิกเดียวโดยไม่ต้องพิมพ์ล็อกอินซ้ำ

---

## 🛠️ ขั้นตอนการติดตั้งและการเปิดใช้งาน (How to Run)

### ความต้องการของระบบ (Prerequisites)
- **Node.js**: เวอร์ชัน 20.x หรือ 22.x/24.x ขึ้นไป
- **npm**: เวอร์ชัน 10.x ขึ้นไป

---

### ขั้นตอนที่ 1: ตรวจสอบและตั้งค่าฐานข้อมูล (Database Setup)
ฐานข้อมูล SQLite ได้รับการคอมไพล์และ Seed ข้อมูลไว้เรียบร้อยแล้วที่ `database/jobmatch.db`  
หากต้องการ Reset หรือ Migration ข้อมูลใหม่ สามารถรันคำสั่ง:

```bash
npm run db:migrate
```

### วิธีที่ 1: ดับเบิลคลิกเปิดใช้งานทันทีด้วยไฟล์ .bat (1-Click Run on Windows)
เพียงดับเบิลคลิกไฟล์ **`run.bat`** (หรือ `start.bat`) ที่โฟลเดอร์หลักของโปรเจกต์:
- ระบบจะตรวจสอบสภาพแวดล้อม Node.js, npm, dependencies และ SQLite ฐานข้อมูลให้อัตโนมัติ
- สตาร์ต Backend API (Port 5000) และ Vite Frontend (Port 3001) พร้อมกัน
- เปิดหน้าเว็บเบราว์เซอร์ไปยัง 👉 **http://localhost:3001** ให้อัตโนมัติทันที

---

### วิธีที่ 2: รันผ่าน Terminal / Command Prompt
รันคำสั่งเดียวที่โฟลเดอร์ root เพื่อสตาร์ตทั้ง Backend API (Port 5000) และ Vite Frontend (Port 3001) พร้อมกัน:

```bash
npm run dev
```

หรือสามารถเปิดแยก Terminal ได้ดังนี้:

#### Terminal 1: Backend API Service
```bash
npm run dev:server
```
*(เซิร์ฟเวอร์จะเริ่มทำงานที่ `http://localhost:5000`)*

#### Terminal 2: Frontend Client
```bash
npm run dev:client
```
*(ไคลเอนต์จะเริ่มทำงานที่ `http://localhost:3001`)*

---

### การเข้าใช้งานในเบราว์เซอร์
เปิดเว็บเบราว์เซอร์ไปที่:
👉 **http://localhost:3001**

---

## 🧪 การรันชุดทดสอบอัตโนมัติ (Automated Test Verification)

ระบบมีชุดทดสอบ API Integration Test & DevSecOps Verification ครอบคลุม 10 หมวดหมู่:

```bash
npm test:server
```

### รายการทดสอบที่ผ่านการตรวจสอบ:
1. `[TEST 1]` System Health & Database Diagnostics (SQLite WAL Mode Verification)
2. `[TEST 2]` Authentication & 4-Tier Role Identification
3. `[TEST 3]` Job Requisitions & Faceted Search Filtering
4. `[TEST 4]` Employer Requisition Publishing
5. `[TEST 5]` Candidate Registration & 1-Click Apply Flow (ป้องกันใบสมัครซ้ำ HTTP 409)
6. `[TEST 6]` Company ATS Kanban Pipeline & Candidate Rendering
7. `[TEST 7]` Cross-Domain Atomic State Sync (ATS Hired ➔ University Employability Status)
8. `[TEST 8]` University Cohort Analytics & MHESI Standard Export
9. `[TEST 9]` Admin KYB Verification Queue & Audit Trail Logging
10. `[TEST 10]` DevSecOps, OWASP Defensive Headers, IDOR Protection & Origin Whitelisting

---

## 📱 การทดสอบการแสดงผลบนอุปกรณ์เคลื่อนที่ (Mobile Simulator)

- ที่แถบเมนูด้านบน มีปุ่ม **"Mobile View" / "Desktop View"**
- เมื่อคลิก จะสลับโหมดเป็นขนาดหน้าจอมือถือ (Viewport 420px) พร้อมขอบจำลองสมาร์ตโฟน ช่วยให้ทดสอบความลื่นไหลของหน้าเว็บทั้งบนมือถือและคอมพิวเตอร์ได้อย่างสะดวก

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
jobmatch/
├── database/                    # โครงสร้างฐานข้อมูล SQLite DDL & Migration
│   ├── schema.sql               # ตาราง, ดัชนี, Foreign Keys
│   ├── seeds.sql                # ข้อมูลทดสอบ 4 บทบาทและประกาศงาน
│   ├── db.ts                    # SQLite Client เชื่อมต่อผ่าน DatabaseSync
│   └── migrate.ts               # สคริปต์ Migration & Integrity Audit
├── server/                      # บริการ Backend Express REST API
│   ├── src/
│   │   ├── config/              # ตั้งค่า Environment & Connection
│   │   ├── controllers/         # ตัวควบคุม Auth, Job, Application, Uni, Admin
│   │   ├── middleware/          # Auth, RBAC, Validate, Upload, Error Handling
│   │   ├── repositories/        # Data Access Layer (DAO)
│   │   ├── routes/              # Express API Routes
│   │   └── services/            # Business Logic & Atomic Cross-Domain Sync Engine
│   ├── uploads/resumes/         # แหล่งเก็บไฟล์ PDF เรซูเม
│   └── test_api.ts              # ชุดทดสอบ API & Security Verification 10 หมวด
├── client/                      # หน้าบ้าน React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, PersonaSwitcher, Modal, Badge
│   │   │   ├── seeker/          # JobCard, JobFilters, ApplyModal, Stepper
│   │   │   ├── company/         # ATSKanbanBoard, RequisitionModal, CandidateDrawer
│   │   │   ├── university/      # KPICards, BreakdownChart, StudentRosterTable
│   │   │   ├── admin/           # KYBQueue, FlaggedJobs, AuditLogsTable
│   │   │   └── tokens/          # Design Tokens & Color Palette Showcase
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── pages/HomePage.tsx   # หน้าหลักรวม 4 เวิร์กสเปซ
│   │   └── services/            # Axios/Fetch API Client
│   └── tailwind.config.js       # ค่า Token สี Royal Blue (#2563EB)
└── docs/                        # เอกสาร PRD, Architecture และ Design System
```

---

*จัดทำโดย Agent Office Engineering & QA Lead — Elena Rostova*
