const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PWKfastwork database...');

  // Clear existing
  await prisma.adminLog.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.jobSeekerProfile.deleteMany({});
  await prisma.companyProfile.deleteMany({});
  await prisma.universityProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pwkfastwork.com',
      password: defaultPassword,
      name: 'ผู้ดูแลระบบ PWKfastwork',
      role: 'ADMIN',
      phone: '02-123-4567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'System Administrator of PWKfastwork Portal',
      status: 'ACTIVE',
    },
  });

  // 2. Universities
  const uni1 = await prisma.user.create({
    data: {
      email: 'career@pwk-uni.ac.th',
      password: defaultPassword,
      name: 'มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK',
      role: 'UNIVERSITY',
      phone: '02-888-9900',
      avatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80',
      bio: 'ศูนย์พัฒนาทักษะวิชาชีพและการมีงานทำของนักศึกษา มหาวิทยาลัยนวัตกรรม PWK',
      status: 'ACTIVE',
      universityProfile: {
        create: {
          universityName: 'มหาวิทยาลัยนวัตกรรมและเทคโนโลยี PWK',
          campus: 'วิทยาเขตหลัก กรุงเทพฯ (พระราม 9)',
          contactPerson: 'อาจารย์ ดร. ปิติ พัฒนวิทย์ (ผู้อำนวยการฝ่ายแนะแนวและส่งเสริมอาชีพ)',
          phone: '02-888-9901',
          website: 'https://www.pwk-uni.ac.th',
          description: 'มหาวิทยาลัยมุ่งเน้นการผลิตบัณฑิตสายเทคโนโลยี นวัตกรรมธุรกิจ และความคิดสร้างสรรค์ มีโครงการส่งเสริมการมีงานทำร่วมกับภาคเอกชนชั้นนำ',
          logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80',
        },
      },
    },
  });

  const uni2 = await prisma.user.create({
    data: {
      email: 'placement@cmu-lanna.ac.th',
      password: defaultPassword,
      name: 'มหาวิทยาลัยเทคโนโลยีล้านนา',
      role: 'UNIVERSITY',
      phone: '053-999-111',
      avatar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
      bio: 'หน่วยงานประสานงานสหกิจศึกษาและการจัดหางาน',
      status: 'ACTIVE',
      universityProfile: {
        create: {
          universityName: 'มหาวิทยาลัยเทคโนโลยีล้านนา',
          campus: 'วิทยาเขตเชียงใหม่',
          contactPerson: 'ผศ. สุรชัย ชัยมงคล',
          phone: '053-999-112',
          website: 'https://www.cmu-lanna.ac.th',
          description: 'ศูนย์กลางการศึกษาสายไอทีและดิจิทัลมีเดียภาคเหนือ',
          logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
        },
      },
    },
  });

  // 3. Companies
  const comp1 = await prisma.user.create({
    data: {
      email: 'hr@techsiam.co.th',
      password: defaultPassword,
      name: 'TechSiam Innovation Co., Ltd.',
      role: 'COMPANY',
      phone: '02-765-4321',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      bio: 'ผู้นำด้านเทคโนโลยี Cloud Native, AI Solutions และ Enterprise Web Applications ในเอเชียตะวันออกเฉียงใต้',
      status: 'ACTIVE',
      companyProfile: {
        create: {
          companyName: 'TechSiam Innovation Co., Ltd.',
          industry: 'เทคโนโลยีและซอฟต์แวร์ (IT & Software)',
          location: 'กรุงเทพฯ (BTS พร้อมพงษ์)',
          website: 'https://techsiam.example.com',
          description: 'บริษัทเทคโนโลยีชั้นนำที่ขับเคลื่อน Digital Transformation ให้แก่องค์กรขนาดใหญ่ บรรยากาศการทำงานแบบ Agile และ Hybrid Work',
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          isVerified: true,
          employeeCount: '50-200 คน',
        },
      },
    },
  });

  const comp2 = await prisma.user.create({
    data: {
      email: 'talent@creativefast.co',
      password: defaultPassword,
      name: 'CreativeFast Digital Agency',
      role: 'COMPANY',
      phone: '02-456-7890',
      avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&auto=format&fit=crop&q=80',
      bio: 'ดิจิทัลเอเจนซีที่ได้รับรางวัลมากมาย เชี่ยวชาญ UX/UI, Branding, Digital Campaign และ Motion Graphics',
      status: 'ACTIVE',
      companyProfile: {
        create: {
          companyName: 'CreativeFast Digital Agency',
          industry: 'มีเดียและโฆษณา (Design & Creative)',
          location: 'กรุงเทพฯ (BTS อารีย์)',
          website: 'https://creativefast.example.com',
          description: 'เราเชื่อมั่นในพลังของความคิดสร้างสรรค์และงานดีไซน์ที่ตอบโจทย์ธุรกิจ ออฟฟิศสไตล์ Loft ชิลๆ มีสวัสดิการขนม เครื่องดื่ม และ Flexible Hours',
          logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80',
          isVerified: true,
          employeeCount: '20-50 คน',
        },
      },
    },
  });

  const comp3 = await prisma.user.create({
    data: {
      email: 'careers@nexusfintech.com',
      password: defaultPassword,
      name: 'Nexus Fintech Group',
      role: 'COMPANY',
      phone: '02-999-5555',
      avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
      bio: 'แพลตฟอร์มการเงินยุคใหม่ Payment Gateway และระบบ Wealth Management ระดับโลก',
      status: 'ACTIVE',
      companyProfile: {
        create: {
          companyName: 'Nexus Fintech Group',
          industry: 'ฟินเทคและการเงิน (Fintech & Banking)',
          location: 'กรุงเทพฯ (สาทร / BTS ช่องนนทรี)',
          website: 'https://nexusfintech.example.com',
          description: 'มุ่งมั่นสร้างระบบนิเวศทางการเงินที่ปลอดภัยและเข้าถึงง่ายสำหรับทุกคน พร้อมทีมวิศวกรและนักวิเคราะห์ข้อมูลชั้นนำ',
          logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=80',
          isVerified: true,
          employeeCount: '200-500 คน',
        },
      },
    },
  });

  // 4. Job Seekers (Students & General Job Seekers)
  const seeker1 = await prisma.user.create({
    data: {
      email: 'seeker1@gmail.com',
      password: defaultPassword,
      name: 'ธนกฤต วงศ์สว่าง',
      role: 'JOB_SEEKER',
      phone: '081-234-5678',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      bio: 'Full Stack Web Developer หลงใหลในการพัฒนา Web Application ด้วย Next.js, Node.js และ Cloud',
      status: 'ACTIVE',
      jobSeekerProfile: {
        create: {
          title: 'Full Stack Developer',
          skills: 'React, Next.js, TypeScript, Node.js, PostgreSQL, TailwindCSS, Docker',
          experience: '2 ปี ประสบการณ์พัฒนาเว็บแอพพลิเคชันและโปรเจกต์เชิงพาณิชย์',
          education: 'ปริญญาตรี วิศวกรรมคอมพิวเตอร์ (เกียรตินิยมอันดับ 1)',
          studentId: 'PWK64-00128',
          faculty: 'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
          major: 'วิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์',
          graduationYear: 2024,
          employmentStatus: 'EMPLOYED',
          companyEmployed: 'TechSiam Innovation Co., Ltd.',
          universityId: uni1.id,
          resumeUrl: 'https://example.com/resumes/thanakrit.pdf',
          portfolioUrl: 'https://github.com/thanakrit-dev',
        },
      },
    },
  });

  const seeker2 = await prisma.user.create({
    data: {
      email: 'seeker2@gmail.com',
      password: defaultPassword,
      name: 'พิมพ์ชนก พัฒนพาณิชย์',
      role: 'JOB_SEEKER',
      phone: '089-876-5432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bio: 'UI/UX Designer ชอบแก้ปัญหาความต้องการของผู้ใช้ด้วย Design Thinking และ Figma Prototype',
      status: 'ACTIVE',
      jobSeekerProfile: {
        create: {
          title: 'UI/UX & Product Designer',
          skills: 'Figma, Adobe XD, User Research, Wireframing, Prototyping, Design Systems',
          experience: '1 ปี ประสบการณ์ฝึกงานและรับฟรีแลนซ์ออกแบบแอปพลิเคชัน',
          education: 'ปริญญาตรี ศิลปกรรมศาสตร์และการสื่อสารดิจิทัล',
          studentId: 'PWK65-00432',
          faculty: 'คณะนิเทศศาสตร์และสื่อดิจิทัล',
          major: 'การออกแบบมัลติมีเดียและอินเทอร์แอคทีฟ',
          graduationYear: 2025,
          employmentStatus: 'INTERNING',
          companyEmployed: 'CreativeFast Digital Agency',
          universityId: uni1.id,
          resumeUrl: 'https://example.com/resumes/pimchanok.pdf',
          portfolioUrl: 'https://behance.net/pimchanok-ux',
        },
      },
    },
  });

  const seeker3 = await prisma.user.create({
    data: {
      email: 'seeker3@gmail.com',
      password: defaultPassword,
      name: 'ศุภชัย กิตติคุณ',
      role: 'JOB_SEEKER',
      phone: '086-111-2233',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'บัณฑิตใหม่พร้อมทำงาน มีความสนใจอย่างแรงกล้าด้าน Data Analysis, BI Dashboard และ Machine Learning',
      status: 'ACTIVE',
      jobSeekerProfile: {
        create: {
          title: 'Junior Data Analyst',
          skills: 'Python, SQL, Power BI, Pandas, Scikit-Learn, Excel Advance, Tableau',
          experience: 'เพิ่งสำเร็จการศึกษา ทำโปรเจกต์วิเคราะห์พฤติกรรมผู้บริโภค',
          education: 'ปริญญาตรี วิทยาการข้อมูลและการวิเคราะห์เชิงธุรกิจ',
          studentId: 'PWK64-00891',
          faculty: 'คณะวิทยาศาสตร์และเทคโนโลยีสารสนเทศ',
          major: 'วิทยาการข้อมูล (Data Science)',
          graduationYear: 2024,
          employmentStatus: 'UNEMPLOYED',
          universityId: uni1.id,
          resumeUrl: 'https://example.com/resumes/suphachai.pdf',
          portfolioUrl: 'https://kaggle.com/suphachai-k',
        },
      },
    },
  });

  const seeker4 = await prisma.user.create({
    data: {
      email: 'seeker4@gmail.com',
      password: defaultPassword,
      name: 'วริศรา รัตนไพศาล',
      role: 'JOB_SEEKER',
      phone: '085-555-7890',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      bio: 'Digital Marketing & Content Strategy เชี่ยวชาญการวางแผนโฆษณา Facebook, TikTok, SEO และการสร้างยอดขาย',
      status: 'ACTIVE',
      jobSeekerProfile: {
        create: {
          title: 'Digital Marketing Specialist',
          skills: 'Meta Ads, Google Ads, SEO, Content Marketing, TikTok For Business, GA4',
          experience: '3 ปี ทำงานกับแบรนด์ FMCG และ E-Commerce',
          education: 'ปริญญาตรี บริหารธุรกิจ สาขาการตลาด',
          studentId: 'CMU63-00512',
          faculty: 'คณะบริหารธุรกิจ',
          major: 'การตลาดดิจิทัล',
          graduationYear: 2023,
          employmentStatus: 'EMPLOYED',
          companyEmployed: 'Nexus Fintech Group',
          universityId: uni2.id,
          resumeUrl: 'https://example.com/resumes/warisara.pdf',
          portfolioUrl: 'https://warisara-marketing.com',
        },
      },
    },
  });

  // 5. Jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: comp1.id,
      title: 'Senior Full Stack Developer (Next.js & Node.js)',
      category: 'Web & Programming',
      jobType: 'Full-time',
      location: 'กรุงเทพฯ (BTS พร้อมพงษ์ / Hybrid ทำงานที่บ้าน 2 วัน)',
      salaryMin: 55000,
      salaryMax: 85000,
      salaryType: 'MONTHLY',
      featured: true,
      urgent: true,
      views: 342,
      status: 'ACTIVE',
      description: `TechSiam กำลังมองหา Senior Full Stack Developer ผู้มีไฟในการสร้างสรรค์ Modern Web Application ขนาดใหญ่ร่วมกับทีมผู้เชี่ยวชาญ คุณจะได้ออกแบบสถาปัตยกรรมระบบ วางแผน API และพัฒนา UI ประสิทธิภาพสูงด้วย Next.js`,
      requirements: `- ปริญญาตรีขึ้นไป สาขาวิศวกรรมคอมพิวเตอร์ วิทยาการคอมพิวเตอร์ หรือสาขาที่เกี่ยวข้อง
- มีประสบการณ์ Next.js, React, Node.js หรือ TypeScript อย่างน้อย 3 ปี
- เชี่ยวชาญ Relational Database (PostgreSQL / MySQL) และ REST / GraphQL APIs
- คุ้นเคยกับ Docker, CI/CD Pipeline และ Cloud (AWS / GCP)
- มีทักษะการทำงานเป็นทีมและเปิดรับเทคโนโลยีใหม่ๆ`,
      benefits: `- โบนัสประจำปีตามผลงาน (เฉลี่ย 2-4 เดือน)
- ประกันสุขภาพกลุ่มระดับพรีเมียม ครอบคลุมผู้ป่วยนอกและทันตกรรม
- งบอบรมและสอบใบรับรองทางวิชาชีพ 25,000 บาท/ปี
- เวลาทำงานยืดหยุ่น (Flexible Hours) และ Hybrid Work
- ขนม กาแฟสด และผลไม้ฟรีในออฟฟิศ`,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: comp2.id,
      title: 'UI/UX Designer (Web & Mobile Application)',
      category: 'Design & Creative',
      jobType: 'Full-time',
      location: 'กรุงเทพฯ (BTS อารีย์)',
      salaryMin: 35000,
      salaryMax: 55000,
      salaryType: 'MONTHLY',
      featured: true,
      urgent: false,
      views: 289,
      status: 'ACTIVE',
      description: `ร่วมงานกับ CreativeFast Studio เพื่อออกแบบประสบการณ์ดิจิทัลที่น่าประทับใจ คุณจะได้ทำงานร่วมกับ Product Manager และ Developer ในการคิดค้น User Journey, Wireframe และ High-fidelity Prototype`,
      requirements: `- มีประสบการณ์ออกแบบ UI/UX อย่างน้อย 1-2 ปี พร้อมแนบ Portfolio ผลงาน
- มีความชำนาญในโปรแกรม Figma, Design Systems และ Interactive Prototyping
- เข้าใจหลักการ Design Thinking, User Centered Design และ Accessibility
- มีมนุษยสัมพันธ์ดี สามารถสื่อสารแนวคิดและรับฟังฟีดแบ็กได้อย่างสร้างสรรค์`,
      benefits: `- อุปกรณ์ทำงาน MacBook Pro ตัวท็อป
- วันลาพักร้อน 12 วันต่อปี (สะสมเพิ่มตามอายุงาน)
- ปาร์ตี้บริษัททุกวันศุกร์สิ้นเดือน และทริปเอาท์ติ้งประจำปี
- สนับสนุนคอร์สเรียนออนไลน์บน Coursera / Udemy ฟรีไม่จำกัด`,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: comp3.id,
      title: 'Data Analyst / Business Intelligence Specialist',
      category: 'Data & AI',
      jobType: 'Full-time',
      location: 'กรุงเทพฯ (สาทร / BTS ช่องนนทรี)',
      salaryMin: 42000,
      salaryMax: 68000,
      salaryType: 'MONTHLY',
      featured: false,
      urgent: true,
      views: 215,
      status: 'ACTIVE',
      description: `Nexus Fintech ต้องการนักวิเคราะห์ข้อมูลที่จะมาช่วยแปลงข้อมูลธุรกรรมมหาศาลให้กลายเป็น Actionable Insights เชิงกลยุทธ์ สร้าง Dashboard แบบ Real-time และทำงานร่วมกับทีม Product เพื่อปรับปรุงบริการ`,
      requirements: `- วุฒิปริญญาตรี สาขาวิทยาการข้อมูล สถิติ เศรษฐศาสตร์ หรือสาขาที่เกี่ยวข้อง
- ชำนาญการเขียน SQL ขั้นสูง (Window Functions, CTE, Query Optimization)
- มีประสบการณ์ใช้งาน Power BI หรือ Tableau ในการทำ Data Visualization
- มีความรู้ภาษา Python (Pandas, Numpy) สำหรับ Data Cleansing และ Analytics
- ทักษะการคิดเชิงวิเคราะห์และการนำเสนอข้อมูลต่อผู้บริหาร`,
      benefits: `- เงินสนับสนุนค่าเดินทางและค่าโทรศัพท์
- กองทุนสำรองเลี้ยงชีพสูงสุด 8%
- ประกันชีวิตและอุบัติเหตุ
- ตรวจสุขภาพประจำปีในโรงพยาบาลเอกชนชั้นนำ`,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      companyId: comp1.id,
      title: 'นักศึกษาฝึกงาน Frontend Developer (Internship รับเบี้ยเลี้ยง)',
      category: 'Web & Programming',
      jobType: 'Internship',
      location: 'กรุงเทพฯ (BTS พร้อมพงษ์)',
      salaryMin: 12000,
      salaryMax: 18000,
      salaryType: 'MONTHLY',
      featured: true,
      urgent: false,
      views: 512,
      status: 'ACTIVE',
      description: `เปิดรับนิสิต/นักศึกษาฝึกงานที่ต้องการเรียนรู้การทำงานจริงในสายซอฟต์แวร์ระดับโปรดักชัน มี Senior คอยเป็น Mentor ดูแลอย่างใกล้ชิด โอกาสได้รับการเสนองานประจำทันทีหลังฝึกงานเสร็จสิ้น`,
      requirements: `- กำลังศึกษาชั้นปีที่ 3 หรือ 4 ในสาขาที่เกี่ยวข้องกับคอมพิวเตอร์และเทคโนโลยี
- มีพื้นฐาน HTML, CSS, JavaScript / TypeScript และเคยลองเขียน React หรือ Vue
- กระตือรือร้น ชอบค้นคว้า และตั้งใจเรียนรู้สิ่งใหม่ๆ
- สามารถฝึกงานได้ระยะเวลาอย่างน้อย 3-4 เดือน`,
      benefits: `- เบี้ยเลี้ยงรายเดือนตามความสามารถ
- หนังสือรับรองการฝึกงานและประเมินผลสหกิจศึกษา
- ฟรีเครื่องดื่ม อาหารว่าง และกิจกรรมเสริมสร้างทักษะ`,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      companyId: comp2.id,
      title: 'Digital Content Creator & Social Media Strategist',
      category: 'Marketing',
      jobType: 'Full-time',
      location: 'กรุงเทพฯ (BTS อารีย์ / ทำงานจากบ้านสัปดาห์ละ 1 วัน)',
      salaryMin: 28000,
      salaryMax: 42000,
      salaryType: 'MONTHLY',
      featured: false,
      urgent: false,
      views: 198,
      status: 'ACTIVE',
      description: `สร้างสรรค์คอนเทนต์วิดีโอสั้นและบทความที่กลายเป็นไวรัลบนแพลตฟอร์ม TikTok, Instagram Reels และ Facebook ดูแลแคมเปญให้แก่แบรนด์ชื่อดังระดับประเทศ`,
      requirements: `- ประสบการณ์ 1 ปีขึ้นไปด้าน Social Media Management หรือ Content Writing
- สามารถถ่ายทำและตัดต่อวิดีโอสั้นด้วย CapCut หรือ Premiere Pro ได้คล่องแคล่ว
- เกาะติดเทรนด์โซเชียล มีไอเดียแปลกใหม่ และเข้าใจจิตวิทยาผู้บริโภค
- มีไหวพริบในการตอบแชทและสร้าง Engagement กับกลุ่มเป้าหมาย`,
      benefits: `- โบนัส Performance ตามยอดวิวและ Engagement
- สิทธิ์ซื้อสินค้าแบรนด์พันธมิตรในราคาพิเศษ
- กิจกรรม Team Building บรรยากาศเป็นกันเอง`,
    },
  });

  const job6 = await prisma.job.create({
    data: {
      companyId: comp3.id,
      title: 'Cybersecurity Analyst (Junior - Mid Level)',
      category: 'Engineering',
      jobType: 'Full-time',
      location: 'กรุงเทพฯ (สาทร)',
      salaryMin: 45000,
      salaryMax: 70000,
      salaryType: 'MONTHLY',
      featured: false,
      urgent: false,
      views: 145,
      status: 'ACTIVE',
      description: `ดูแลความปลอดภัยโครงสร้างพื้นฐานระบบฟินเทค ตรวจจับช่องโหว่ ทำ Vulnerability Assessment และประสานงานตรวจสอบความปลอดภัยตามมาตรฐาน PCI-DSS และ ISO 27001`,
      requirements: `- ปริญญาตรีสาขา Cybersecurity, Computer Science หรือสาขาที่เกี่ยวข้อง
- มีความรู้ด้าน Network Security, Firewalls, WAF และ SIEM Tools
- หากมีใบรับรอง CompTIA Security+, CEH หรือ CISSP จะได้รับการพิจารณาเป็นพิเศษ
- มีความรอบคอบ ละเอียด และมีความรับผิดชอบสูง`,
      benefits: `- กองทุนสำรองเลี้ยงชีพ
- งบสนับสนุนสอบใบประกาศนียบัตรระดับสากล 50,000 บาท/ปี
- สวัสดิการทันตกรรมและสายตา`,
    },
  });

  // 6. Applications
  await prisma.application.create({
    data: {
      jobId: job1.id,
      applicantId: seeker1.id,
      coverLetter: 'ดิฉัน/กระผมมีความสนใจอย่างยิ่งในตำแหน่ง Full Stack Developer ของ TechSiam โดยมีประสบการณ์ตรงในการพัฒนาแอปพลิเคชัน Next.js และ REST APIs ขนาดใหญ่ ขอโอกาสในการนำทักษะมาสร้างคุณค่าให้กับองค์กรครับ',
      resumeUrl: 'https://example.com/resumes/thanakrit.pdf',
      expectedSalary: 65000,
      status: 'ACCEPTED',
      notes: 'สัมภาษณ์ผ่าน ทักษะทางเทคนิคยอดเยี่ยม ได้รับการตอบรับเข้าทำงาน',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job4.id,
      applicantId: seeker3.id,
      coverLetter: 'สวัสดีครับ ผมสนใจสมัครตำแหน่งฝึกงาน Frontend Developer ต้องการฝึกฝนทักษะการทำงานจริงร่วมกับทีมผู้เชี่ยวชาญครับ',
      resumeUrl: 'https://example.com/resumes/suphachai.pdf',
      expectedSalary: 15000,
      status: 'INTERVIEW',
      interviewDate: new Date('2026-11-05T10:00:00Z'),
      notes: 'นัดสัมภาษณ์ออนไลน์ผ่าน Google Meet วันที่ 5 พ.ย. 10:00 น.',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      applicantId: seeker2.id,
      coverLetter: 'ยินดีที่ได้รู้จักค่ะ มีความชื่นชอบในผลงานของ CreativeFast Studio มาโดยตลอด ขอส่งผลงาน Portfolio ออกแบบ UX/UI ให้พิจารณาค่ะ',
      resumeUrl: 'https://example.com/resumes/pimchanok.pdf',
      expectedSalary: 45000,
      status: 'REVIEWED',
      notes: 'เปิดดูเรซูเมและพอร์ตโฟลิโอแล้ว ผลงานดีเด่น น่าเรียกสัมภาษณ์รอบต่อไป',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job3.id,
      applicantId: seeker3.id,
      coverLetter: 'ต้องการร่วมงานในตำแหน่ง Data Analyst มีความชำนาญ SQL, Python และ Power BI พร้อมเริ่มงานทันทีครับ',
      resumeUrl: 'https://example.com/resumes/suphachai.pdf',
      expectedSalary: 42000,
      status: 'PENDING',
    },
  });

  // 7. Admin Logs
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'APPROVE_COMPANY',
      target: comp1.name,
      details: 'อนุมัติยืนยันตัวตนบริษัท TechSiam Innovation Co., Ltd.',
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'VERIFY_UNIVERSITY',
      target: uni1.name,
      details: 'ตรวจสอบและผูกระบบบันทึกสถานะนักศึกษาของมหาวิทยาลัย PWK',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
