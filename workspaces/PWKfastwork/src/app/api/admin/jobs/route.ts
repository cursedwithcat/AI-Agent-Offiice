import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
    }

    const jobs = await prisma.job.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            companyProfile: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error fetching admin jobs:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดงาน' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, featured, urgent } = body;

    if (!id) {
      return NextResponse.json({ error: 'ไม่ระบุ ID ของงาน' }, { status: 400 });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        featured: featured !== undefined ? featured : undefined,
        urgent: urgent !== undefined ? urgent : undefined,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: 'MODERATE_JOB',
        target: updated.title,
        details: `อัปเดตสถานะงานเป็น ${status || 'เดิม'} (Featured: ${featured}, Urgent: ${urgent})`,
      },
    });

    return NextResponse.json({ success: true, message: 'อัปเดตงานเรียบร้อยแล้ว', job: updated });
  } catch (error: any) {
    console.error('Error moderating job:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' }, { status: 500 });
  }
}
