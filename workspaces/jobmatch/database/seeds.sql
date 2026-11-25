-- ======================================================================
-- Jobmatch Initial Deterministic Seed Dataset
-- Data Architect: Vikram Patel
-- Default Test Password for all seeded accounts: password123
-- Bcrypt Hash ($2a$10$): $2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu
-- ======================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------
-- 1. Users Table Seed
-- ----------------------------------------------------------------------
-- ID 1: Admin
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(1, 'admin@jobmatch.co', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'ADMIN', 'ACTIVE', datetime('now', '-30 days'), datetime('now', '-30 days'));

-- ID 2: SCG (Company - Verified)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(2, 'hr@scg.co.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'COMPANY', 'ACTIVE', datetime('now', '-25 days'), datetime('now', '-25 days'));

-- ID 3: LINE MAN Wongnai (Company - Verified)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(3, 'recruitment@linemanwongnai.com', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'COMPANY', 'ACTIVE', datetime('now', '-24 days'), datetime('now', '-24 days'));

-- ID 4: Chulalongkorn University (University)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(4, 'career@chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'UNIVERSITY', 'ACTIVE', datetime('now', '-28 days'), datetime('now', '-28 days'));

-- ID 5: Somchai Saetang (Seeker - CS Senior)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(5, 'somchai.s@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-20 days'), datetime('now', '-20 days'));

-- ID 6: Napat Kittisuk (Seeker - Software Eng)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(6, 'napat.k@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-18 days'), datetime('now', '-18 days'));

-- ID 7: Ploy Thanasuk (Seeker - Business Info Systems)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(7, 'ploy.t@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-15 days'), datetime('now', '-15 days'));

-- ID 8: Ananda Mueangthai (Seeker - Data Science)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(8, 'ananda.m@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-12 days'), datetime('now', '-12 days'));

-- ID 9: Karn Wongsuwan (Seeker - Computer Eng)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(9, 'karn.w@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-10 days'), datetime('now', '-10 days'));

-- ID 10: Natta Prasert (Seeker - CS Senior)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(10, 'natta.p@student.chula.ac.th', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'SEEKER', 'ACTIVE', datetime('now', '-8 days'), datetime('now', '-8 days'));

-- ID 11: StartupThai Innovations (Company - Pending Verification for Admin demo)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES 
(11, 'hr@startupthai.io', '$2a$10$0EsvMy6hk4nqfeheRSydr.wEaZwvO.c3q9.QvNmtq8gQ2QB1tMibu', 'COMPANY', 'PENDING_VERIFICATION', datetime('now', '-2 days'), datetime('now', '-2 days'));

-- ----------------------------------------------------------------------
-- 2. Seeker Profiles Table Seed
-- ----------------------------------------------------------------------
INSERT OR IGNORE INTO seeker_profiles (id, user_id, full_name, phone, university_name, faculty, major, student_id, graduation_year, gpa, bio, skills, resume_url, is_verified, created_at, updated_at) VALUES 
(1, 5, 'สมชาย แซ่ตั้ง (Somchai Saetang)', '081-234-5678', 'Chulalongkorn University', 'Faculty of Engineering', 'Computer Engineering', '6530123421', 2026, 3.82, 'Aspiring Fullstack Engineer passionate about TypeScript, React, and scalable Node.js microservices. Winner of National Hackathon 2025.', '["React", "TypeScript", "Node.js", "Docker", "Tailwind CSS", "PostgreSQL"]', '/uploads/resumes/somchai_resume.pdf', 1, datetime('now', '-20 days'), datetime('now', '-20 days')),
(2, 6, 'ณภัทร กิตติสุข (Napat Kittisuk)', '082-345-6789', 'Chulalongkorn University', 'Faculty of Science', 'Computer Science', '6530234523', 2026, 3.65, 'Frontend developer focused on high-performance web applications, accessibility, and modern CSS architecture.', '["React", "Next.js", "JavaScript", "HTML/CSS", "Figma"]', '/uploads/resumes/napat_resume.pdf', 1, datetime('now', '-18 days'), datetime('now', '-18 days')),
(3, 7, 'พลอย ธนสุข (Ploy Thanasuk)', '083-456-7890', 'Chulalongkorn University', 'Faculty of Commerce and Accountancy', 'Information Systems', '6530345624', 2026, 3.50, 'Data-driven problem solver with strong business analytics background and expertise in dashboard automation.', '["SQL", "Python", "Tableau", "Power BI", "Data Modeling"]', '/uploads/resumes/ploy_resume.pdf', 1, datetime('now', '-15 days'), datetime('now', '-15 days')),
(4, 8, 'อนันดา เมืองไทย (Ananda Mueangthai)', '084-567-8901', 'Chulalongkorn University', 'Faculty of Engineering', 'Data Science & AI', '6530456725', 2026, 3.75, 'Machine learning enthusiast with experience training transformer models and deploying low-latency inferencing APIs.', '["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "FastAPI"]', '/uploads/resumes/ananda_resume.pdf', 1, datetime('now', '-12 days'), datetime('now', '-12 days')),
(5, 9, 'กานต์ วงศ์สุวรรณ (Karn Wongsuwan)', '085-678-9012', 'Chulalongkorn University', 'Faculty of Engineering', 'Computer Engineering', '6530567826', 2026, 3.40, 'Mobile developer crafting cross-platform experiences using Flutter, with native Android/iOS integration skills.', '["Flutter", "Dart", "REST APIs", "Firebase", "Git"]', '/uploads/resumes/karn_resume.pdf', 1, datetime('now', '-10 days'), datetime('now', '-10 days')),
(6, 10, 'ณัฐ ประเสริฐ (Natta Prasert)', '086-789-0123', 'Chulalongkorn University', 'Faculty of Science', 'Computer Science', '6530678927', 2026, 3.90, 'Cloud enthusiast with hands-on Kubernetes, Linux system administration, and infrastructure-as-code expertise.', '["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "Go"]', '/uploads/resumes/natta_resume.pdf', 1, datetime('now', '-8 days'), datetime('now', '-8 days'));

-- ----------------------------------------------------------------------
-- 3. Company Profiles Table Seed
-- ----------------------------------------------------------------------
INSERT OR IGNORE INTO company_profiles (id, user_id, company_name, tax_id, industry, company_size, website, logo_url, description, address, kyb_status, created_at, updated_at) VALUES 
(1, 2, 'SCG (Siam Cement Group)', '0107536000242', 'Industrial & Technology Conglomerate', '10,000+ employees', 'https://www.scg.com', 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=128&h=128&fit=crop', 'Leading business conglomerate in the ASEAN region driving digital innovation, sustainable living, and smart industry solutions.', '1 Siam Cement Road, Bangsue, Bangkok 10800', 'VERIFIED', datetime('now', '-25 days'), datetime('now', '-25 days')),
(2, 3, 'LINE MAN Wongnai', '0105561142589', 'On-Demand Delivery & Tech Platform', '1,000 - 5,000 employees', 'https://career.lmwn.com', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop', 'Thailand''s premier on-demand lifestyle platform connecting millions of consumers with restaurants, grocery stores, riders, and services.', 'T-One Building, 26th Floor, Sukhumvit 40, Phra Khanong, Bangkok 10110', 'VERIFIED', datetime('now', '-24 days'), datetime('now', '-24 days')),
(3, 11, 'StartupThai Innovations Co., Ltd.', '0105567891011', 'AI & Enterprise Software', '10 - 50 employees', 'https://startupthai.io', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&h=128&fit=crop', 'Fast-paced venture-backed AI startup designing generative enterprise agents and automated workflows.', 'True Digital Park, 6th Floor, Sukhumvit 101, Bangkok 10260', 'PENDING', datetime('now', '-2 days'), datetime('now', '-2 days'));

-- ----------------------------------------------------------------------
-- 4. University Profiles Table Seed
-- ----------------------------------------------------------------------
INSERT OR IGNORE INTO university_profiles (id, user_id, university_name, campus, contact_person, contact_email, phone, is_accredited, created_at, updated_at) VALUES 
(1, 4, 'Chulalongkorn University', 'Main Campus (Pathumwan)', 'Dr. Kanya Siriporn (Director of Career Services)', 'career@chula.ac.th', '+66 2 218 0000', 1, datetime('now', '-28 days'), datetime('now', '-28 days'));

-- ----------------------------------------------------------------------
-- 5. Jobs Table Seed
-- ----------------------------------------------------------------------
INSERT OR IGNORE INTO jobs (id, company_id, title, department, job_type, workplace_type, location, salary_min, salary_max, salary_currency, experience_level, description, requirements, skills_required, status, created_at, updated_at) VALUES 
(1, 1, 'Junior Fullstack Developer (Node.js & React)', 'SCG Digital Innovation', 'FULL_TIME', 'HYBRID', 'Bangsue, Bangkok', 35000, 50000, 'THB', 'Entry Level / Fresh Graduate', 
'Join our flagship digital venture engineering squad. You will develop modern web applications, microservices, and customer-facing interfaces serving thousands of enterprise partners across Southeast Asia.', 
'• Bachelor''s Degree in Computer Science, Software Engineering, or related fields.\n• Hands-on proficiency with React, TypeScript, and Node.js.\n• Familiarity with REST APIs, relational databases (PostgreSQL/SQLite), and Git.\n• Strong team collaboration and growth mindset.', 
'["React", "TypeScript", "Node.js", "SQL", "Git"]', 'PUBLISHED', datetime('now', '-18 days'), datetime('now', '-18 days')),

(2, 2, 'Frontend Engineer (React / TypeScript)', 'Core Consumer Engineering', 'FULL_TIME', 'HYBRID', 'Thong Lo, Bangkok', 40000, 65000, 'THB', 'Junior to Mid Level', 
'Be part of the engineering powerhouse behind Thailand''s fastest-growing on-demand ecosystem. You will craft fluid, responsive UI micro-frontends with lightning-fast load times and seamless user journeys.', 
'• Strong foundation in JavaScript (ES6+), React 18, and modern state management.\n• Experience with responsive styling using Tailwind CSS.\n• Appreciation for web performance metrics (Core Web Vitals) and unit testing.\n• Passion for delivering intuitive user experiences.', 
'["React", "TypeScript", "Tailwind CSS", "Next.js", "Web Performance"]', 'PUBLISHED', datetime('now', '-15 days'), datetime('now', '-15 days')),

(3, 2, 'Data Analyst Intern (Summer 2026)', 'Business Intelligence & Operations', 'INTERNSHIP', 'HYBRID', 'Thong Lo, Bangkok', 15000, 20000, 'THB', 'Internship / Student', 
'Exciting 3-month paid summer internship where you will analyze rider dispatch efficiency, consumer dining trends, and merchant campaign ROI directly collaborating with Product Managers and Data Scientists.', 
'• Currently enrolled 3rd or 4th-year university student in Information Systems, Statistics, or Engineering.\n• Proficient in SQL and data wrangling with Python (Pandas).\n• Familiar with visualization tools such as Tableau or Metabase.', 
'["SQL", "Python", "Tableau", "Data Analysis", "Excel"]', 'PUBLISHED', datetime('now', '-14 days'), datetime('now', '-14 days')),

(4, 1, 'Mobile Application Developer (Flutter)', 'Smart Living IoT Unit', 'FULL_TIME', 'ON_SITE', 'Bangsue, Bangkok', 38000, 55000, 'THB', 'Entry Level / 0-2 Years', 
'Engineer seamless cross-platform mobile experiences controlling next-generation smart home IoT hardware and automated green energy residential ecosystems.', 
'• Proven experience building applications with Flutter and Dart.\n• Understanding of mobile architecture patterns (BLoC, Provider, or Riverpod).\n• Familiarity with BLE or WebSocket IoT communication is a plus.', 
'["Flutter", "Dart", "REST APIs", "State Management", "Mobile Architecture"]', 'PUBLISHED', datetime('now', '-10 days'), datetime('now', '-10 days')),

(5, 1, 'Cloud Infrastructure Associate (DevOps)', 'Enterprise Cloud Operations', 'FULL_TIME', 'REMOTE', 'Bangkok (Remote)', 45000, 60000, 'THB', 'Entry Level / 1 Year', 
'Automate continuous deployment pipelines, maintain container orchestrations in AWS, and enforce security policies for mission-critical enterprise systems.', 
'• Understanding of Linux server administration and networking basics.\n• Working knowledge of Docker containers and CI/CD pipelines (GitHub Actions/GitLab CI).\n• Scripting capabilities in Bash or Python.', 
'["AWS", "Docker", "Linux", "CI/CD", "Bash"]', 'PUBLISHED', datetime('now', '-8 days'), datetime('now', '-8 days')),

(6, 3, 'Junior AI Prompt & NLP Engineer', 'AI Research Lab', 'FULL_TIME', 'REMOTE', 'Bangkok (Remote)', 32000, 45000, 'THB', 'Entry Level', 
'Assist in fine-tuning instruction prompts, evaluating agentic reasoning frameworks, and benchmark-testing retrieval-augmented generation (RAG) models for enterprise client pilots.', 
'• Bachelor''s degree in Computer Science, Linguistics, or cognitive disciplines.\n• Hands-on experimentation with LLM APIs (OpenAI, Anthropic, Gemini).\n• Solid Python scripting and data cleaning skills.', 
'["Python", "Prompt Engineering", "NLP", "LLMs"]', 'DRAFT', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- ----------------------------------------------------------------------
-- 6. Applications Table Seed (ATS Pipeline)
-- ----------------------------------------------------------------------
-- Somchai -> SCG Junior Fullstack Developer (HIRED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(1, 1, 1, 'HIRED', 'I am very excited about SCG''s digital sustainability initiatives and would love to contribute my fullstack TypeScript skills.', '/uploads/resumes/somchai_resume.pdf', 'Excellent technical interview, outstanding hackathon portfolio. Offer extended and signed. Placed in squad Alpha.', datetime('now', '-14 days'), datetime('now', '-3 days'));

-- Somchai -> LMWN Frontend Engineer (SHORTLISTED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(2, 2, 1, 'SHORTLISTED', 'LINE MAN Wongnai is one of my favorite Thai apps! I am enthusiastic about high-density UI and micro-frontends.', '/uploads/resumes/somchai_resume.pdf', 'Passed coding assignment with 95% score. Inviting to final cultural interview.', datetime('now', '-10 days'), datetime('now', '-2 days'));

-- Napat -> LMWN Frontend Engineer (UNDER_REVIEW)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(3, 2, 2, 'UNDER_REVIEW', 'Passionate front-end developer eager to build performant mobile-web experiences at scale.', '/uploads/resumes/napat_resume.pdf', 'Profile looks solid; portfolio projects use Next.js and Tailwind. Technical team reviewing repo.', datetime('now', '-5 days'), datetime('now', '-1 day'));

-- Ploy -> LMWN Data Analyst Intern (APPLIED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(4, 3, 3, 'APPLIED', 'Seeking summer internship to apply my SQL and BI visualization skills to real-world consumer behavior data.', '/uploads/resumes/ploy_resume.pdf', 'Resume received. Initial HR screening pending.', datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Ananda -> LMWN Data Analyst Intern (OFFERED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(5, 3, 4, 'OFFERED', 'Excited about leveraging statistical machine learning and SQL to uncover delivery route optimization metrics.', '/uploads/resumes/ananda_resume.pdf', 'Strong analytical assessment score (100%). Offer letter delivered via email. Pending candidate signature.', datetime('now', '-7 days'), datetime('now', '-1 day'));

-- Karn -> SCG Mobile Developer (SHORTLISTED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(6, 4, 5, 'SHORTLISTED', 'Eager to build high-performance IoT mobile apps that interface directly with smart hardware.', '/uploads/resumes/karn_resume.pdf', 'Impressive Flutter showcase app on GitHub. Interview scheduled for this Thursday.', datetime('now', '-6 days'), datetime('now', '-2 days'));

-- Natta -> SCG Cloud Associate (HIRED)
INSERT OR IGNORE INTO applications (id, job_id, seeker_id, stage, cover_note, resume_snapshot_url, internal_notes, applied_at, updated_at) VALUES 
(7, 5, 6, 'HIRED', 'Dedicated to automated cloud infrastructure and CI/CD pipelines with strong focus on high availability.', '/uploads/resumes/natta_resume.pdf', 'Certified AWS Cloud Practitioner. Passed technical system architecture round. Welcome to SCG Cloud Ops!', datetime('now', '-12 days'), datetime('now', '-4 days'));

-- ----------------------------------------------------------------------
-- 7. Student Employability Table Seed (University Cohort Tracking)
-- High-fidelity records for seeded students + aggregated MHESI cohort.
-- ----------------------------------------------------------------------
-- 1. Somchai: Hired by SCG directly via Jobmatch ATS
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(1, 1, 1, 2026, 'EMPLOYED_IN_FIELD', 1, 'Junior Fullstack Developer', 45000, datetime('now', '-20 days'), datetime('now', '-3 days'));

-- 2. Natta: Hired by SCG directly via Jobmatch ATS
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(2, 6, 1, 2026, 'EMPLOYED_IN_FIELD', 1, 'Cloud Infrastructure Associate', 48000, datetime('now', '-15 days'), datetime('now', '-4 days'));

-- 3. Napat: Currently actively interviewing / seeking
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(3, 2, 1, 2026, 'SEEKING', NULL, NULL, NULL, datetime('now', '-18 days'), datetime('now', '-1 day'));

-- 4. Ploy: Pursuing postgraduate Master''s Degree (Continuing Education)
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(4, 3, 1, 2026, 'CONTINUING_ED', NULL, 'M.Sc. Information Technology, Chulalongkorn University', NULL, datetime('now', '-15 days'), datetime('now', '-15 days'));

-- 5. Ananda: Received offer, currently pending formal start
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(5, 4, 1, 2026, 'SEEKING', NULL, NULL, NULL, datetime('now', '-12 days'), datetime('now', '-1 day'));

-- 6. Karn: Shortlisted candidate
INSERT OR IGNORE INTO student_employability (id, seeker_id, university_id, cohort_year, status, placed_company_id, placed_job_title, starting_salary, created_at, updated_at) VALUES 
(6, 5, 1, 2026, 'SEEKING', NULL, NULL, NULL, datetime('now', '-10 days'), datetime('now', '-2 days'));

-- ----------------------------------------------------------------------
-- 8. Audit Logs Table Seed
-- ----------------------------------------------------------------------
INSERT OR IGNORE INTO audit_logs (id, actor_id, actor_role, action, target_type, target_id, details, ip_address, created_at) VALUES 
(1, 1, 'ADMIN', 'SYSTEM_INITIALIZATION', 'PLATFORM', 1, '{"version":"1.0.0","environment":"production_ready"}', '127.0.0.1', datetime('now', '-30 days')),
(2, 1, 'ADMIN', 'KYB_VERIFIED', 'COMPANY', 1, '{"company_name":"SCG (Siam Cement Group)","tax_id":"0107536000242","approved_by":"admin@jobmatch.co"}', '127.0.0.1', datetime('now', '-25 days')),
(3, 1, 'ADMIN', 'KYB_VERIFIED', 'COMPANY', 2, '{"company_name":"LINE MAN Wongnai","tax_id":"0105561142589","approved_by":"admin@jobmatch.co"}', '127.0.0.1', datetime('now', '-24 days')),
(4, 2, 'COMPANY', 'CREATE_JOB', 'JOB', 1, '{"title":"Junior Fullstack Developer (Node.js & React)","salary_range":"35,000 - 50,000 THB"}', '192.168.1.101', datetime('now', '-18 days')),
(5, 3, 'COMPANY', 'CREATE_JOB', 'JOB', 2, '{"title":"Frontend Engineer (React / TypeScript)","salary_range":"40,000 - 65,000 THB"}', '192.168.1.102', datetime('now', '-15 days')),
(6, 2, 'COMPANY', 'STAGE_TRANSITION_HIRED', 'APPLICATION', 1, '{"candidate":"Somchai Saetang","job_title":"Junior Fullstack Developer","auto_sync_university":"SUCCESS"}', '192.168.1.101', datetime('now', '-3 days'));

