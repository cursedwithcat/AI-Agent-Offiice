import React from 'react';
import Link from 'next/link';
import { MapPin, Building, Flame, Star, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatSalary, formatThaiDate } from '@/lib/utils';

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    category: string;
    jobType: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryType: string;
    description: string;
    urgent?: boolean;
    featured?: boolean;
    createdAt: string | Date;
    company: {
      id: string;
      name: string;
      avatar?: string | null;
      companyProfile?: {
        companyName?: string;
        isVerified?: boolean;
        location?: string | null;
      } | null;
    };
    _count?: {
      applications?: number;
    };
  };
  onApplyClick?: (jobId: string) => void;
}

export default function JobCard({ job, onApplyClick }: JobCardProps) {
  const companyName = job.company.companyProfile?.companyName || job.company.name;
  const isVerified = job.company.companyProfile?.isVerified ?? true;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-400 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Company info & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={job.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`}
              alt={companyName}
              className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition truncate max-w-[180px]">
                  {companyName}
                </span>
                {isVerified && (
                  <span title="บริษัทที่ได้รับการยืนยัน">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[160px]">{job.location}</span>
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            {job.urgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                <Flame className="w-3 h-3" /> ด่วน
              </span>
            )}
            {job.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> แนะนำ
              </span>
            )}
          </div>
        </div>

        {/* Job Title */}
        <Link href={`/jobs/${job.id}`}>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-base line-clamp-2 leading-snug">
            {job.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Tags / Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            {job.category}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-700">
            {job.jobType}
          </span>
          {job._count?.applications !== undefined && (
            <span className="px-2 py-1 text-[10px] text-slate-400 font-medium ml-auto">
              {job._count.applications} ผู้สมัคร
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Salary and Action */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">เงินเดือน</span>
          <span className="text-sm font-extrabold text-blue-600">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </span>
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-blue-600 hover:text-white transition group-hover:bg-blue-600 group-hover:text-white"
        >
          <span>ดูงาน</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
