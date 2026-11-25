import React from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';

interface JobSearchFiltersProps {
  keyword: string;
  location: string;
  jobType: string;
  onKeywordChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onJobTypeChange: (val: string) => void;
  onSearch: () => void;
}

export const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({
  keyword,
  location,
  jobType,
  onKeywordChange,
  onLocationChange,
  onJobTypeChange,
  onSearch,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 text-slate-900"
    >
      <div className="sm:col-span-5 relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="ค้นหาตำแหน่งงาน เช่น Frontend Developer, Data Analyst..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm border-0 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 shadow-sm outline-none transition-all"
        />
      </div>

      <div className="sm:col-span-3 relative">
        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl text-sm border-0 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 shadow-sm outline-none transition-all cursor-pointer"
        >
          <option value="ALL">ทุกสถานที่ (All Locations)</option>
          <option value="Bangkok">กรุงเทพฯ & ปริมณฑล</option>
          <option value="Hybrid">Hybrid / ทำงานผสมผสาน</option>
          <option value="Remote">Remote 100%</option>
        </select>
      </div>

      <div className="sm:col-span-2 relative">
        <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <select
          value={jobType}
          onChange={(e) => onJobTypeChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm border-0 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 shadow-sm outline-none transition-all cursor-pointer"
        >
          <option value="ALL">ประเภทงาน (All)</option>
          <option value="FULL_TIME">งานประจำ (Full-time)</option>
          <option value="INTERNSHIP">ฝึกงาน (Internship)</option>
          <option value="PART_TIME">พาร์ทไทม์ (Part-time)</option>
          <option value="CONTRACT">สัญญาจ้าง (Contract)</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-growth-600 hover:bg-growth-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <Filter className="w-4 h-4" />
          <span>ค้นหางาน</span>
        </button>
      </div>
    </form>
  );
};
