import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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
            createdAt: true,
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
    });

    if (!application) {
      return NextResponse.json({ error: 'ไม่พบใบสมัครงานนี้' }, { status: 404 });
    }

    // Check permission: Company who owns the job, Applicant themselves, University of the applicant, or Admin
    if (
      application.job.companyId !== user.id &&
      application.applicantId !== user.id &&
      application.applicant.jobSeekerProfile?.universityId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลใบสมัครนี้' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลใบสมัคร' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'ไม่พบใบสมัครงานนี้' }, { status: 404 });
    }

    // Check permission: Company who owns the job or Admin
    if (application.job.companyId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์จัดการใบสมัครนี้' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, interviewDate, notes } = body;

    let safeInterviewDate = application.interviewDate;
    if (interviewDate !== undefined) {
      if (!interviewDate) {
        safeInterviewDate = null;
      } else {
        const d = new Date(interviewDate);
        safeInterviewDate = !isNaN(d.getTime()) ? d : null;
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        status: status || application.status,
        interviewDate: safeInterviewDate,
        notes: notes !== undefined ? notes : application.notes,
      },
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
            createdAt: true,
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
    });

    // If accepted, also automatically update applicant profile to EMPLOYED with company name
    if (status === 'ACCEPTED') {
      await prisma.jobSeekerProfile.updateMany({
        where: { userId: application.applicantId },
        data: {
          employmentStatus: application.job.jobType === 'Internship' ? 'INTERNING' : 'EMPLOYED',
          companyEmployed: application.job.company.name,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะใบสมัครเรียบร้อยแล้ว',
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + error.message },
      { status: 500 }
    );
  }
}
