import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        jobSeekerProfile: true,
        companyProfile: true,
        universityProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้งานนี้ในระบบ' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        profile:
          user.role === 'JOB_SEEKER'
            ? user.jobSeekerProfile
            : user.role === 'COMPANY'
            ? user.companyProfile
            : user.role === 'UNIVERSITY'
            ? user.universityProfile
            : null,
      },
    });

    const isLocalHttp = request.url.startsWith('http://localhost') || request.url.startsWith('http://127.0.0.1');

    response.cookies.set('pwk_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isLocalHttp,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
