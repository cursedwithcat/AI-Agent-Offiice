import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (role && role !== 'ALL') {
      whereClause.role = role;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const isPaginated = pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '20', 10) || 20));
    const skip = isPaginated ? (page - 1) * limit : undefined;
    const take = isPaginated ? limit : undefined;

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        include: {
          jobSeekerProfile: {
            include: {
              university: {
                select: { name: true },
              },
            },
          },
          companyProfile: true,
          universityProfile: true,
          _count: {
            select: {
              jobs: true,
              applications: true,
              studentProfiles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const safeUsers = users.map(({ password, ...u }) => u);

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        total,
        page: isPaginated ? page : 1,
        limit: isPaginated ? limit : total,
        totalPages: isPaginated ? (Math.ceil(total / limit) || 1) : 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, role, isVerified } = body;

    if (!id) {
      return NextResponse.json({ error: 'ไม่ระบุ ID ผู้ใช้' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        role: role !== undefined ? role : undefined,
      },
    });

    if (isVerified !== undefined) {
      await prisma.companyProfile.updateMany({
        where: { userId: id },
        data: { isVerified },
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: 'UPDATE_USER',
        target: updatedUser.name,
        details: `อัปเดตสถานะเป็น ${status || 'เดิม'} และบทบาทเป็น ${role || 'เดิม'}`,
      },
    });

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ไม่ระบุ ID ผู้ใช้' }, { status: 400 });
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'ไม่สามารถลบบัญชีตัวเองได้' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });

    await prisma.user.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: 'DELETE_USER',
        target: targetUser?.name || id,
        details: `ลบบัญชีผู้ใช้ ${targetUser?.email}`,
      },
    });

    return NextResponse.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' }, { status: 500 });
  }
}
