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

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        jobSeekerProfile: {
          include: {
            university: {
              select: { id: true, name: true, universityProfile: true },
            },
          },
        },
        companyProfile: true,
        universityProfile: true,
      },
    });

    return NextResponse.json({ user: fullUser });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, bio, avatar, profileData } = body;

    // Update main user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        phone: phone !== undefined ? phone : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
    });

    // Update role-specific profile
    if (user.role === 'JOB_SEEKER' && profileData) {
      let resolvedUniversityId = profileData.universityId;
      if (profileData.universityName !== undefined) {
        if (typeof profileData.universityName === 'string' && profileData.universityName.trim() === '') {
          resolvedUniversityId = null;
        } else {
          resolvedUniversityId = await resolveUniversityId(profileData.universityName);
        }
      } else if (profileData.universityId) {
        resolvedUniversityId = await resolveUniversityId(profileData.universityId);
      }

      await prisma.jobSeekerProfile.upsert({
        where: { userId: user.id },
        update: {
          title: profileData.title,
          skills: profileData.skills,
          experience: profileData.experience,
          education: profileData.education,
          resumeUrl: profileData.resumeUrl,
          portfolioUrl: profileData.portfolioUrl,
          studentId: profileData.studentId,
          faculty: profileData.faculty,
          major: profileData.major,
          graduationYear: profileData.graduationYear ? parseInt(profileData.graduationYear) : undefined,
          employmentStatus: profileData.employmentStatus,
          universityId: resolvedUniversityId !== undefined ? resolvedUniversityId : undefined,
        },
        create: {
          userId: user.id,
          title: profileData.title || 'ผู้หางาน',
          skills: profileData.skills || '',
          experience: profileData.experience,
          education: profileData.education,
          resumeUrl: profileData.resumeUrl,
          portfolioUrl: profileData.portfolioUrl,
          studentId: profileData.studentId,
          faculty: profileData.faculty,
          major: profileData.major,
          graduationYear: profileData.graduationYear ? parseInt(profileData.graduationYear) : null,
          employmentStatus: profileData.employmentStatus || 'UNEMPLOYED',
          universityId: resolvedUniversityId || null,
        },
      });
    } else if (user.role === 'COMPANY' && profileData) {
      await prisma.companyProfile.upsert({
        where: { userId: user.id },
        update: {
          companyName: profileData.companyName || name || updatedUser.name,
          industry: profileData.industry,
          location: profileData.location,
          website: profileData.website,
          description: profileData.description,
          logo: profileData.logo,
          employeeCount: profileData.employeeCount,
        },
        create: {
          userId: user.id,
          companyName: profileData.companyName || name || updatedUser.name,
          industry: profileData.industry || 'ทั่วไป',
          location: profileData.location || 'กรุงเทพมหานคร',
          website: profileData.website,
          description: profileData.description,
          logo: profileData.logo,
          employeeCount: profileData.employeeCount,
        },
      });
    } else if (user.role === 'UNIVERSITY' && profileData) {
      await prisma.universityProfile.upsert({
        where: { userId: user.id },
        update: {
          universityName: profileData.universityName || name || updatedUser.name,
          campus: profileData.campus,
          contactPerson: profileData.contactPerson,
          phone: profileData.phone,
          website: profileData.website,
          description: profileData.description,
          logo: profileData.logo,
        },
        create: {
          userId: user.id,
          universityName: profileData.universityName || name || updatedUser.name,
          campus: profileData.campus || 'วิทยาเขตหลัก',
          contactPerson: profileData.contactPerson,
          phone: profileData.phone,
          website: profileData.website,
          description: profileData.description,
          logo: profileData.logo,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message }, { status: 500 });
  }
}
