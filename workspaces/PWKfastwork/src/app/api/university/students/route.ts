import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'UNIVERSITY' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนักศึกษา' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const faculty = searchParams.get('faculty') || '';

    let whereClause: any = {
      role: 'JOB_SEEKER',
    };

    if (user.role === 'UNIVERSITY') {
      whereClause.jobSeekerProfile = {
        universityId: user.id,
      };
    }

    if (status && status !== 'ALL') {
      whereClause.jobSeekerProfile = {
        ...(whereClause.jobSeekerProfile || {}),
        employmentStatus: status,
      };
    }

    if (faculty && faculty !== 'ALL') {
      whereClause.jobSeekerProfile = {
        ...(whereClause.jobSeekerProfile || {}),
        faculty: faculty,
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        {
          jobSeekerProfile: {
            studentId: { contains: search },
          },
        },
        {
          jobSeekerProfile: {
            major: { contains: search },
          },
        },
      ];
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        jobSeekerProfile: true,
        applications: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Error fetching university students:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'UNIVERSITY' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เพิ่มข้อมูลนักศึกษา' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      studentId,
      faculty,
      major,
      graduationYear,
      employmentStatus,
      companyEmployed,
      phone,
      title,
      skills,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อและอีเมล' }, { status: 400 });
    }

    const universityId = user.role === 'UNIVERSITY' ? user.id : body.universityId || null;

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      // If user exists, connect/update their student profile
      const updated = await prisma.jobSeekerProfile.upsert({
        where: { userId: existing.id },
        update: {
          universityId,
          studentId: studentId || undefined,
          faculty: faculty || undefined,
          major: major || undefined,
          graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
          employmentStatus: employmentStatus || undefined,
          companyEmployed: companyEmployed || undefined,
        },
        create: {
          userId: existing.id,
          universityId,
          studentId: studentId || null,
          faculty: faculty || null,
          major: major || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          employmentStatus: employmentStatus || 'UNEMPLOYED',
          companyEmployed: companyEmployed || null,
        },
      });

      return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ', student: updated });
    }

    // Create new student user
    const defaultPassword = await bcrypt.hash('student123', 10);
    const newStudent = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: defaultPassword,
        name,
        role: 'JOB_SEEKER',
        phone: phone || null,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        jobSeekerProfile: {
          create: {
            title: title || 'นักศึกษา / บัณฑิตใหม่',
            skills: skills || '',
            universityId,
            studentId: studentId || null,
            faculty: faculty || null,
            major: major || null,
            graduationYear: graduationYear ? parseInt(graduationYear) : null,
            employmentStatus: employmentStatus || 'UNEMPLOYED',
            companyEmployed: companyEmployed || null,
          },
        },
      },
      include: {
        jobSeekerProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลนักศึกษาเข้าสู่ระบบเรียบร้อยแล้ว',
      student: newStudent,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'UNIVERSITY' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูล' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, employmentStatus, companyEmployed, faculty, major, graduationYear } = body;

    if (!body.id) {
      return NextResponse.json({ error: 'ไม่พบ ID ของนักศึกษา' }, { status: 400 });
    }

    // Verify ownership: University can only update its affiliated students
    if (user.role === 'UNIVERSITY') {
      const targetStudent = await prisma.jobSeekerProfile.findUnique({
        where: { userId: body.id },
      });

      if (!targetStudent || targetStudent.universityId !== user.id) {
        return NextResponse.json(
          { error: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนักศึกษานอกสถาบันของคุณ' },
          { status: 403 }
        );
      }
    }

    const parsedGradYear = graduationYear !== undefined
      ? (graduationYear && !isNaN(parseInt(graduationYear, 10)) ? parseInt(graduationYear, 10) : null)
      : undefined;

    const updatedProfile = await prisma.jobSeekerProfile.update({
      where: { userId: body.id },
      data: {
        studentId: studentId !== undefined ? studentId : undefined,
        employmentStatus: employmentStatus !== undefined ? employmentStatus : undefined,
        companyEmployed: companyEmployed !== undefined ? companyEmployed : undefined,
        faculty: faculty !== undefined ? faculty : undefined,
        major: major !== undefined ? major : undefined,
        graduationYear: parsedGradYear,
      },
    });

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', profile: updatedProfile });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดต: ' + error.message }, { status: 500 });
  }
}
