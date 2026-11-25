import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { resolveUniversityId } from '@/lib/university';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (jobId) {
      whereClause.jobId = jobId;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (user.role === 'JOB_SEEKER') {
      whereClause.applicantId = user.id;
    } else if (user.role === 'COMPANY') {
      whereClause.job = {
        companyId: user.id,
      };
    } else if (user.role === 'UNIVERSITY') {
      // University can view applications of its affiliated students
      whereClause.applicant = {
        jobSeekerProfile: {
          universityId: user.id,
        },
      };
    }
    // ADMIN has no extra user filtering

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                avatar: true,
                companyProfile: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            bio: true,
            jobSeekerProfile: {
              include: {
                university: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'ไม่สามารถโหลดข้อมูลใบสมัครได้' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนสมัครงาน' }, { status: 401 });
    }

    if (user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: 'เฉพาะผู้หางานหรือนักศึกษาเท่านั้นที่สามารถสมัครงานได้' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobId, coverLetter, resumeUrl, expectedSalary, universityName } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'ไม่ระบุตำแหน่งงาน' }, { status: 400 });
    }

    // If applicant provided/updated their university name, resolve and link it automatically
    if (universityName && typeof universityName === 'string' && universityName.trim()) {
      const resolvedUniId = await resolveUniversityId(universityName);
      if (resolvedUniId) {
        await prisma.jobSeekerProfile.upsert({
          where: { userId: user.id },
          update: { universityId: resolvedUniId },
          create: {
            userId: user.id,
            universityId: resolvedUniId,
            employmentStatus: 'UNEMPLOYED',
          },
        });
      }
    }

    // Check if job exists & is active
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'ตำแหน่งงานนี้ปิดรับสมัครแล้วหรือไม่พร้อมให้สมัคร' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'คุณได้ส่งใบสมัครในตำแหน่งงานนี้ไปแล้ว' },
        { status: 409 }
      );
    }

    const parsedSalary = expectedSalary !== undefined && expectedSalary !== null && expectedSalary !== ''
      ? parseInt(String(expectedSalary), 10)
      : null;
    const safeExpectedSalary = parsedSalary !== null && !isNaN(parsedSalary) && parsedSalary >= 0 ? parsedSalary : null;

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: user.id,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || user.jobSeekerProfile?.resumeUrl || null,
        expectedSalary: safeExpectedSalary,
        status: 'PENDING',
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'ส่งใบสมัครงานเรียบร้อยแล้ว!',
        application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครงาน: ' + error.message },
      { status: 500 }
    );
  }
}
