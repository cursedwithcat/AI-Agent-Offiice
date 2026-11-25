import React from 'react';
import { ApplicationStage, EmployabilityStatus, KYBStatus } from '../../types';

interface BadgeProps {
  label?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'slate';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'blue',
  className = '',
  children,
}) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-brand-700 border-blue-200',
    emerald: 'bg-emerald-50 text-growth-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-uni-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children || label}
    </span>
  );
};

export const ApplicationStageBadge: React.FC<{ stage: ApplicationStage }> = ({ stage }) => {
  switch (stage) {
    case 'APPLIED':
      return <Badge variant="blue" label="ยื่นสมัครแล้ว (Applied)" />;
    case 'UNDER_REVIEW':
      return <Badge variant="amber" label="กำลังพิจารณา (Under Review)" />;
    case 'SHORTLISTED':
      return <Badge variant="purple" label="นัดสัมภาษณ์ (Shortlisted)" />;
    case 'OFFERED':
      return <Badge variant="blue" label="ยื่นข้อเสนอ (Offered)" />;
    case 'HIRED':
      return <Badge variant="emerald" label="รับเข้าทำงานแล้ว (Hired)" />;
    case 'REJECTED':
      return <Badge variant="red" label="ไม่ผ่านการคัดเลือก (Rejected)" />;
    case 'WITHDRAWN':
      return <Badge variant="slate" label="สละสิทธิ์ (Withdrawn)" />;
    default:
      return <Badge variant="slate" label={stage} />;
  }
};

export const EmployabilityBadge: React.FC<{ status: EmployabilityStatus }> = ({ status }) => {
  switch (status) {
    case 'EMPLOYED_IN_FIELD':
      return <Badge variant="emerald" label="ทำงานตรงสาย (Employed In-Field)" />;
    case 'EMPLOYED_OUT_OF_FIELD':
      return <Badge variant="blue" label="ทำงานต่างสาขา (Employed Out-of-Field)" />;
    case 'CONTINUING_ED':
      return <Badge variant="purple" label="ศึกษาต่อระดับสูง (Continuing Ed)" />;
    case 'FREELANCE_ENTREPRENEUR':
      return <Badge variant="amber" label="ผู้ประกอบการ / ฟรีแลนซ์" />;
    case 'SEEKING':
    default:
      return <Badge variant="amber" label="กำลังหางาน (Actively Seeking)" />;
  }
};

export const KYBBadge: React.FC<{ status: KYBStatus }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return <Badge variant="emerald" label="Corporate Verified" />;
    case 'PENDING':
      return <Badge variant="amber" label="Pending KYB" />;
    case 'REJECTED':
      return <Badge variant="red" label="KYB Rejected" />;
  }
};
