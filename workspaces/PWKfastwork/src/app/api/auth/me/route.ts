import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { password, ...safeUser } = user;

    return NextResponse.json({
      user: {
        ...safeUser,
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
  } catch (error: any) {
    console.error('Error fetching me:', error);
    return NextResponse.json({ user: null });
  }
}
