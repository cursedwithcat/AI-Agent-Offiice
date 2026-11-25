import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'UNIVERSITY' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เข้าถึงสถิตินี้' }, { status: 403 });
    }

    const whereClause: any = {
      role: 'JOB_SEEKER',
    };

    if (user.role === 'UNIVERSITY') {
      whereClause.jobSeekerProfile = {
        universityId: user.id,
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        jobSeekerProfile: true,
      },
    });

    const totalStudents = students.length;
    let employedCount = 0;
    let interningCount = 0;
    let unemployedCount = 0;
    let studyingCount = 0;

    const facultyMap: Record<string, number> = {};
    const companyMap: Record<string, number> = {};

    students.forEach((s) => {
      const status = s.jobSeekerProfile?.employmentStatus || 'UNEMPLOYED';
      if (status === 'EMPLOYED') employedCount++;
      else if (status === 'INTERNING') interningCount++;
      else if (status === 'STUDYING') studyingCount++;
      else unemployedCount++;

      const faculty = s.jobSeekerProfile?.faculty || 'ไม่ระบุ';
      facultyMap[faculty] = (facultyMap[faculty] || 0) + 1;

      if (s.jobSeekerProfile?.companyEmployed) {
        const comp = s.jobSeekerProfile.companyEmployed;
        companyMap[comp] = (companyMap[comp] || 0) + 1;
      }
    });

    // Calculate employment rate based on graduates / active job seekers (excluding currently studying students)
    const graduatesCount = Math.max(0, totalStudents - studyingCount);
    const employmentRate = graduatesCount > 0
      ? Math.round(((employedCount + interningCount) / graduatesCount) * 100)
      : (totalStudents > 0 ? Math.round(((employedCount + interningCount) / totalStudents) * 100) : 0);

    return NextResponse.json({
      stats: {
        totalStudents,
        graduatesCount,
        employedCount,
        interningCount,
        unemployedCount,
        studyingCount,
        employmentRate,
        overallRate: totalStudents > 0 ? Math.round(((employedCount + interningCount) / totalStudents) * 100) : 0,
        facultyBreakdown: facultyMap,
        topCompanies: Object.entries(companyMap).map(([name, count]) => ({ name, count })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching university stats:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดสถิติ' }, { status: 500 });
  }
}
