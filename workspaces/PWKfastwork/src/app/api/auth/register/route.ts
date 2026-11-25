import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { resolveUniversityId } from '@/lib/university';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role,
      phone,
      // Seeker fields
      title,
      skills,
      faculty,
      major,
      studentId,
      universityId,
      // Company fields
      companyName,
      industry,
      location,
      website,
      // University fields
      universityName,
      campus,
      contactPerson,
    } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่ถูกต้อง (เช่น user@example.com)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    let user;

    if (role === 'JOB_SEEKER') {
      const resolvedUniversityId = await resolveUniversityId(universityName || universityId);

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name,
          role: 'JOB_SEEKER',
          phone: phone || null,
          avatar: defaultAvatar,
          jobSeekerProfile: {
            create: {
              title: title || 'ผู้หางาน',
              skills: skills || '',
              faculty: faculty || null,
              major: major || null,
              studentId: studentId || null,
              universityId: resolvedUniversityId,
              employmentStatus: 'UNEMPLOYED',
            },
          },
        },
        include: { jobSeekerProfile: true },
      });
    } else if (role === 'COMPANY') {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: companyName || name,
          role: 'COMPANY',
          phone: phone || null,
          avatar: defaultAvatar,
          companyProfile: {
            create: {
              companyName: companyName || name,
              industry: industry || 'เทคโนโลยีและธุรกิจ',
              location: location || 'กรุงเทพมหานคร',
              website: website || null,
              isVerified: true,
            },
          },
        },
        include: { companyProfile: true },
      });
    } else if (role === 'UNIVERSITY') {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: universityName || name,
          role: 'UNIVERSITY',
          phone: phone || null,
          avatar: defaultAvatar,
          universityProfile: {
            create: {
              universityName: universityName || name,
              campus: campus || 'วิทยาเขตหลัก',
              contactPerson: contactPerson || name,
              phone: phone || null,
              website: website || null,
            },
          },
        },
        include: { universityProfile: true },
      });
    } else if (role === 'ADMIN') {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name,
          role: 'ADMIN',
          phone: phone || null,
          avatar: defaultAvatar,
        },
      });
    } else {
      return NextResponse.json({ error: 'บทบาทไม่ถูกต้อง' }, { status: 400 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });

    const isLocalHttp = request.url.startsWith('http://localhost') || request.url.startsWith('http://127.0.0.1');

    response.cookies.set('pwk_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isLocalHttp,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + error.message },
      { status: 500 }
    );
  }
}
