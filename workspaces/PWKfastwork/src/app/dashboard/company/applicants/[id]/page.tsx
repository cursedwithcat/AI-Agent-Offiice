'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ApplicantAliasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      // Forward to the applications detail page
      router.replace(`/dashboard/company/applications/${id}`);
    }
  }, [id, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm font-semibold text-slate-500">กำลังนำคุณไปยังหน้าข้อมูลผู้สมัคร...</p>
    </div>
  );
}
