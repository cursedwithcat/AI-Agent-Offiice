export function formatSalary(min?: number | null, max?: number | null, type = 'MONTHLY') {
  const typeText = type === 'MONTHLY' ? '/เดือน' : type === 'PROJECT' ? '/งาน' : '/ชม.';
  if (min == null && max == null) return 'ตามตกลง';
  if (min != null && max == null) return `฿${min.toLocaleString()} ขึ้นไป${typeText}`;
  if (min == null && max != null) return `ไม่เกิน ฿${max.toLocaleString()}${typeText}`;
  if (min != null && max != null) return `฿${min.toLocaleString()} - ฿${max.toLocaleString()}${typeText}`;
  return 'ตามตกลง';
}

export function formatThaiDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatThaiDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ROLE_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  JOB_SEEKER: { label: 'ผู้หางาน / นักศึกษา', color: 'blue', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPANY: { label: 'บริษัท / นายจ้าง', color: 'emerald', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  UNIVERSITY: { label: 'มหาวิทยาลัย / สถาบัน', color: 'purple', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  ADMIN: { label: 'ผู้ดูแลระบบ (Admin)', color: 'rose', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export const APPLICATION_STATUS_MAP: Record<string, { label: string; badge: string; desc: string }> = {
  PENDING: {
    label: 'รอการพิจารณา',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'ใบสมัครถูกส่งแล้ว กำลังรอฝ่ายบุคคลเปิดตรวจเอกสาร',
  },
  REVIEWED: {
    label: 'เปิดดูแล้ว',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'ฝ่ายบุคคลเปิดอ่านประวัติและพอร์ตโฟลิโอของคุณแล้ว',
  },
  INTERVIEW: {
    label: 'นัดสัมภาษณ์งาน',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'ยินดีด้วย! บริษัทได้ส่งกำหนดการนัดสัมภาษณ์ให้คุณแล้ว',
  },
  ACCEPTED: {
    label: 'ผ่านการคัดเลือก',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'ยินดีด้วย! คุณได้รับการคัดเลือกเข้าทำงานในตำแหน่งนี้',
  },
  REJECTED: {
    label: 'ไม่ผ่านการคัดเลือก',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: 'บริษัทขอเก็บประวัติของคุณไว้สำหรับตำแหน่งที่เหมาะสมในโอกาสถัดไป',
  },
};

export const EMPLOYMENT_STATUS_MAP: Record<string, { label: string; badge: string }> = {
  EMPLOYED: { label: 'มีงานทำแล้ว', badge: 'bg-emerald-100 text-emerald-800' },
  STUDYING: { label: 'กำลังศึกษาอยู่', badge: 'bg-blue-100 text-blue-800' },
  INTERNING: { label: 'กำลังฝึกงาน / สหกิจ', badge: 'bg-purple-100 text-purple-800' },
  UNEMPLOYED: { label: 'กำลังมองหางาน', badge: 'bg-amber-100 text-amber-800' },
};
