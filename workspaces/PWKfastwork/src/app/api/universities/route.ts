import { NextResponse } from 'next/server';
import { getUniversityList } from '@/lib/university';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const universities = await getUniversityList();
    return NextResponse.json({ universities });
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'ไม่สามารถโหลดรายชื่อมหาวิทยาลัยได้' }, { status: 500 });
  }
}
