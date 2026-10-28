# 🏢 Agent Office (บริษัท AI Agent จำลอง)

แพลตฟอร์มบริหารและสั่งงานบริษัท AI Agent อัตโนมัติ โดยแบ่งทีมตามตำแหน่งงานจริง ปรึกษาหารือกัน วางสถาปัตยกรรม เขียนโค้ดจริง และทดสอบ พร้อมแสดงกระบวนการทำงาน (Process Visualization) แบบ Real-Time บน Next.js UI ผ่าน SSE Stream ที่เชื่อมตรงกับ **Antigravity CLI (`agy`)**

---

## 🏛️ สถาปัตยกรรมระบบ (System Architecture)

```text
[Frontend: Next.js 16 + React 19 + Tailwind CSS]
   │  ▲
   │  │ 1. POST /api/run-agent (ส่งคำสั่งพร้อม Project ID และ Workflow Mode)
   │  │ 2. SSE Stream: {"step": "thinking" | "stdout" | "tool_call" | "tool_result" | "phase_change"}
   ▼  │
[Backend: FastAPI Subprocess Manager]
   │  ▲
   │  │ Async Subprocess / Pipe Stdout & Stderr (--output-format stream-json)
   ▼  │
[Antigravity / agy CLI Instance]
   │
   ▼
[Workspaces Directory: workspaces/<project_id>/]
   └── David (Lead Developer) สร้างไฟล์จริงผ่าน write_to_file / run_command
```

---

## 👥 ตำแหน่งงานในบริษัท (Virtual Roles)

| ตำแหน่ง | ชื่อ Agent | บทบาทและหน้าที่ | สีประจำตัว |
| :--- | :--- | :--- | :--- |
| **CEO** | **Alex Vance** | กำหนดวิสัยทัศน์ สโคปงาน วางกลยุทธ์ธุรกิจ และสั่งการทีมบริหาร | 🔵 Royal Blue (`#2563EB`) |
| **Lead PM** | **Sophia Chen** | วิเคราะห์ฟีเจอร์ แปลงเป็น User Stories และกำหนด Acceptance Criteria | 🟣 Violet (`#7C3AED`) |
| **Lead UI/UX Designer** | **Maya Lin** | ออกแบบ Design System, Wireframe UI จำลอง (`wireframe_preview.html`) และ Client Approval Gate | 🔴 Rose (`#E11D48`) |
| **System Architect** | **Marcus Sterling** | เลือก Tech Stack ออกแบบ File Tree สถาปัตยกรรม และ API Contracts | 🔷 Sky Blue (`#0284C7`) |
| **Database Architect** | **Vikram Patel** | ออกแบบ Data Models, Entity Relations, ตารางฐานข้อมูล และไฟล์ Schema/Migration | 🟠 Amber (`#D97706`) |
| **Senior Backend Engineer** | **Sean O'Connor** | พัฒนา REST/API Endpoints, Server Logic, Controller และเชื่อมต่อฐานข้อมูล | 🟣 Indigo (`#4F46E5`) |
| **Senior Frontend Engineer** | **David Kim** | ลงมือสร้าง Client UI, CSS/Tailwind, Responsive Components และ DOM Reactivity | 🟢 Emerald (`#059669`) |
| **Security Specialist** | **Samira Khan** | ตรวจสอบช่องโหว่ OWASP Top 10, Hardening โค้ด และออกใบรับรองความปลอดภัย | 🔴 Crimson (`#DC2626`) |
| **QA & Release Lead** | **Elena Rostova** | ตรวจสอบไฟล์โค้ด เช็คคุณภาพความถูกต้อง Syntax และแนะนำคู่มือวิธีรันโปรเจกต์ | 🟢 Teal (`#0D9488`) |
| **Maintenance & Support Lead** | **Lucas Miller** | **ศูนย์รับเรื่องหลังจบโปรเจกต์**: รับแจ้งแก้ไขงาน/บั๊ก/ฟีเจอร์เพิ่ม วิเคราะห์ผลกระทบ และประสานงานส่งต่อให้ทีมตามหน้าที่ | 🟠 Orange (`#F97316`) |

---

## 🚀 รูปแบบการทำงาน (Workflow Modes)

1. **Full Company Pipeline (End-to-End Build)**:
   - **Phase 1 (CEO)**: กำหนด Executive Vision & Scoping
   - **Phase 2 (PM)**: แตก Feature Spec & Acceptance Criteria
   - **Phase 3 (Designer)**: ออกแบบ UI/UX Wireframe & ผ่านจุด Client Approval Gate
   - **Phase 4 (Architect)**: วางระบบ & โครงสร้างไฟล์ Blueprint
   - **Phase 5 (Database)**: สร้าง Schema & Entity Models
   - **Phase 6 (Backend)**: เขียนโค้ด API Routes & Server Controller
   - **Phase 7 (Frontend)**: เขียนโค้ด Client Views & UI Component
   - **Phase 8 (Security)**: ทำ DevSecOps Audit & ปิดช่องโหว่
   - **Phase 9 (QA)**: ตรวจสอบโค้ด & สรุปคำแนะนำวิธีรัน
   - **Phase 10 (Maintenance)**: รับมอบโปรเจกต์ จัดทำ Operational Baseline และสแตนด์บายรับงานแก้ไข
2. **Maintenance & Fix (แจ้งแก้ไขงาน / ประสานงานซ่อมบำรุง)**:
   - หลังทำโปรเจกต์เสร็จ ผู้ใช้สามารถแจ้งสิ่งที่ต้องการแก้ไข บั๊ก หรือฟีเจอร์เพิ่มเติมมายัง **Lucas Miller (Maintenance Lead)**
   - Lucas จะเข้าตรวจสอบโค้ดเดิมในโฟลเดอร์ Workspace แล้วออกใบงานประสานงาน (Maintenance & Dispatch Ticket)
   - ส่งต่องานแก้ไขให้คนในทีมตามหน้าที่ (เช่น Frontend ปรับปุ่ม/สี, Backend เพิ่ม API, DB ปรับตาราง)
   - ปิดท้ายด้วย Elena (QA) ตรวจสอบความถูกต้องและ Regression Test ก่อนส่งมอบงาน
3. **Boardroom Meeting (Roundtable Discussion)**:
   - ปรึกษาหารือ ระดมสมอง และถกเถียงประเด็นปัญหา ทั้ง 10 ตำแหน่งร่วมแสดงความคิดเห็น
4. **Specialist Direct (สั่งการรายบุคคล)**:
   - สั่งงานตรงไปยังตำแหน่งที่เลือก (เช่น ให้ Maintenance ตรวจสอบ, ให้ Frontend ปรับ UI)

---

## 📁 การจัดเก็บ Path และ Workspace (`workspaces/`)

- โฟลเดอร์ `workspaces/` ถูกแยกไว้ที่ Root ของโปรเจกต์อย่างเป็นระเบียบ
- แต่ละโปรเจกต์จะมีโฟลเดอร์เฉพาะ เช่น `workspaces/markdown-notes/`, `workspaces/inventory-api/`
- เมื่อรันงาน `agy CLI` จะถูกรันด้วย `cwd` ชี้ไปยังโฟลเดอร์ของโปรเจกต์นั้นโดยตรง ทำให้คำสั่ง `write_to_file` และ `run_command` สร้างไฟล์และรันสคริปต์ในโฟลเดอร์นั้นทันที
- หน้าเว็บมี **File Explorer** และ **Code Inspector** ให้เปิดดูไฟล์และคัดลอกโค้ดที่ Agent สร้างได้แบบเรียลไทม์

---

## 🛠️ วิธีการติดตั้งและเปิดใช้งาน (Setup & Quick Start)

### 1. ความต้องการเบื้องต้น (Prerequisites)
- **Node.js**: v18.17+ หรือ v20+
- **Python**: 3.10+
- **Google Antigravity CLI (`agy`)**: ติดตั้งและล็อกอินยืนยันตัวตนไว้ในระบบ

### 2. การติดตั้ง Dependencies (First-time Installation)
```bash
# ติดตั้ง Backend Dependencies
cd backend
pip install -r requirements.txt
cd ..

# ติดตั้ง Frontend Dependencies
cd frontend
npm install
cd ..
```

### 3. การเปิดใช้งานระบบ (Launch System)

#### บน Windows:
- ดับเบิ้ลคลิกไฟล์ `run.bat` ที่โฟลเดอร์ Root ของโปรเจกต์ ระบบจะเปิดทั้ง Backend และ Frontend ให้อัตโนมัติ

#### บน macOS / Linux:
```bash
chmod +x run.sh
./run.sh
```

#### หรือเปิดผ่าน Terminal แยกโปรเซส:
1. **Backend (FastAPI)**:
   ```bash
   cd backend
   python run.py
   ```
   - เข้าดู Swagger API Docs: `http://localhost:8000/docs`

2. **Frontend (Next.js)**:
   ```bash
   cd frontend
   npm run dev
   ```
   - เข้าใช้งาน Web UI Dashboard: `http://localhost:3000`
