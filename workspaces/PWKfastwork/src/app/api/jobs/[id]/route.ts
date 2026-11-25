import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getUserFromRequest(request);

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            bio: true,
            companyProfile: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'ไม่พบตำแหน่งงานนี้' }, { status: 404 });
    }

    // Increment views only for normal visitors (skip company owner self-views)
    if (!user || user.id !== job.companyId) {
      await prisma.job.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    console.error('Error fetching job detail:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดงาน' }, { status: 500 });
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
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบตำแหน่งงานนี้' }, { status: 404 });
    }

    // Check ownership or admin
    if (existing.companyId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขตำแหน่งงานนี้' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      category,
      jobType,
      location,
      salaryMin,
      salaryMax,
      salaryType,
      description,
      requirements,
      benefits,
      urgent,
      featured,
      status,
    } = body;

    const safeMin = salaryMin !== undefined
      ? (salaryMin && !isNaN(parseInt(salaryMin, 10)) && parseInt(salaryMin, 10) >= 0 ? parseInt(salaryMin, 10) : null)
      : existing.salaryMin;

    const safeMax = salaryMax !== undefined
      ? (salaryMax && !isNaN(parseInt(salaryMax, 10)) && parseInt(salaryMax, 10) >= 0 ? parseInt(salaryMax, 10) : null)
      : existing.salaryMax;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        category: category !== undefined ? category : existing.category,
        jobType: jobType !== undefined ? jobType : existing.jobType,
        location: location !== undefined ? location : existing.location,
        salaryMin: safeMin,
        salaryMax: safeMax,
        salaryType: salaryType !== undefined ? salaryType : existing.salaryType,
        description: description !== undefined ? description : existing.description,
        requirements: requirements !== undefined ? requirements : existing.requirements,
        benefits: benefits !== undefined ? benefits : existing.benefits,
        urgent: urgent !== undefined ? Boolean(urgent) : existing.urgent,
        featured: featured !== undefined ? Boolean(featured) : existing.featured,
        status: status !== undefined ? status : existing.status,
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขงาน' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบตำแหน่งงานนี้' }, { status: 404 });
    }

    if (existing.companyId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ลบตำแหน่งงานนี้' }, { status: 403 });
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'ลบตำแหน่งงานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบงาน' }, { status: 500 });
  }
}
