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

    const [
      totalUsers,
      seekersCount,
      companiesCount,
      universitiesCount,
      totalJobs,
      activeJobs,
      totalApplications,
      acceptedApplications,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.user.count({ where: { role: 'UNIVERSITY' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        seekersCount,
        companiesCount,
        universitiesCount,
        totalJobs,
        activeJobs,
        totalApplications,
        acceptedApplications,
      },
      recentLogs,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดสถิติ' }, { status: 500 });
  }
}
