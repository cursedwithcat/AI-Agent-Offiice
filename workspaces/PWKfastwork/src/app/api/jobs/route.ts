import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const jobType = searchParams.get('jobType') || '';
    const location = searchParams.get('location') || '';
    const companyId = searchParams.get('companyId') || '';
    const featured = searchParams.get('featured');
    const urgent = searchParams.get('urgent');
    const status = searchParams.get('status') || 'ACTIVE';

    const whereClause: any = {};

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    if (companyId) {
      whereClause.companyId = companyId;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (jobType && jobType !== 'ALL') {
      whereClause.jobType = jobType;
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (urgent === 'true') {
      whereClause.urgent = true;
    }

    if (location) {
      whereClause.location = {
        contains: location,
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { requirements: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const isPaginated = pageParam !== null || limitParam !== null;

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '12', 10) || 12));
    const skip = isPaginated ? (page - 1) * limit : undefined;
    const take = isPaginated ? limit : undefined;

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where: whereClause }),
      prisma.job.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              avatar: true,
              companyProfile: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: [
          { urgent: 'desc' },
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page: isPaginated ? page : 1,
        limit: isPaginated ? limit : total,
        totalPages: isPaginated ? (Math.ceil(total / limit) || 1) : 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'ไม่สามารถโหลดข้อมูลงานได้' }, { status: 500 });
  }
}

function parseSafeSalary(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) || num < 0 ? null : num;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || (user.role !== 'COMPANY' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ในการลงประกาศงาน (สำหรับบริษัทหรือแอดมินเท่านั้น)' },
        { status: 403 }
      );
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
    } = body;

    if (!title || !category || !jobType || !location || !description || !requirements) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลตำแหน่งงานและรายละเอียดให้ครบถ้วน' },
        { status: 400 }
      );
    }

    let sMin = parseSafeSalary(salaryMin);
    let sMax = parseSafeSalary(salaryMax);
    if (sMin !== null && sMax !== null && sMin > sMax) {
      [sMin, sMax] = [sMax, sMin];
    }

    const job = await prisma.job.create({
      data: {
        companyId: user.id,
        title,
        category,
        jobType,
        location,
        salaryMin: sMin,
        salaryMax: sMax,
        salaryType: salaryType || 'MONTHLY',
        description,
        requirements,
        benefits: benefits || null,
        urgent: Boolean(urgent),
        featured: Boolean(featured),
        status: 'ACTIVE',
      },
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
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลงประกาศงาน: ' + error.message },
      { status: 500 }
    );
  }
}
