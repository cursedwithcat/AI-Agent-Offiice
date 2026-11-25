import React, { useState } from 'react';
import { PlusCircle, Check, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Job, JobType, WorkplaceType } from '../../types';
import { jobApi } from '../../services/jobApi';
import { useToast } from '../../context/ToastContext';

interface JobRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newJob: Job) => void;
}

export const JobRequisitionModal: React.FC<JobRequisitionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Software Engineering',
    job_type: 'FULL_TIME' as JobType,
    workplace_type: 'HYBRID' as WorkplaceType,
    location: 'กรุงเทพฯ (Bangkok)',
    salary_min: 35000,
    salary_max: 55000,
    salary_currency: 'THB',
    experience_level: '0-2 ปี (ยินดีรับนักศึกษาจบใหม่)',
    description: '',
    requirements: '',
    skills_required: 'React, TypeScript, Node.js, Tailwind CSS',
    status: 'PUBLISHED' as const,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'salary_min' || name === 'salary_max' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('กรุณากรอกชื่อตำแหน่งและรายละเอียดงานให้ครบถ้วน', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await jobApi.createJob(formData);
      showToast('สร้างประกาศรับสมัครงานใหม่และเผยแพร่สำเร็จเรียบร้อย!', 'success');
      onSuccess(created);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถสร้างประกาศรับสมัครงานได้', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="สร้างประกาศรับสมัครงานใหม่ (New Job Requisition)"
      subtitle="ระบบจะเผยแพร่สู่กระดานงานของผู้หางานและเครือข่ายมหาวิทยาลัยทันที"
      icon={<PlusCircle className="w-5 h-5 text-brand-600" />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TITLE & DEPARTMENT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อตำแหน่งงาน *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="เช่น Junior Frontend Developer"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              แผนก / ฝ่าย (Department)
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="เช่น Digital Technology & Innovation"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* JOB TYPE & WORKPLACE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ประเภทการจ้างงาน
            </label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="FULL_TIME">งานประจำ (Full-time)</option>
              <option value="INTERNSHIP">ฝึกงาน (Internship)</option>
              <option value="PART_TIME">พาร์ทไทม์ (Part-time)</option>
              <option value="CONTRACT">สัญญาจ้าง (Contract)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รูปแบบการทำงาน
            </label>
            <select
              name="workplace_type"
              value={formData.workplace_type}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="HYBRID">Hybrid (ผสมผสาน)</option>
              <option value="ON_SITE">On-Site (ประจำสำนักงาน)</option>
              <option value="REMOTE">Remote 100%</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              สถานที่ปฏิบัติงาน
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="เช่น บางซื่อ, กรุงเทพฯ"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* SALARY RANGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              เงินเดือนเริ่มต้น (บาท / เดือน)
            </label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              เงินเดือนสูงสุด (บาท / เดือน)
            </label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* SKILLS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ทักษะที่ต้องการ (ระบุคั่นด้วยเครื่องหมายจุลภาค ,)
          </label>
          <input
            type="text"
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            placeholder="TypeScript, React, Node.js, SQL"
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            รายละเอียดงานและความรับผิดชอบ *
          </label>
          <textarea
            rows={3}
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="ระบุภาพรวมของตำแหน่งงาน หน้าที่ความรับผิดชอบ และสิ่งที่ผู้สมัครจะได้เรียนรู้..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* REQUIREMENTS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            คุณสมบัติผู้สมัคร (Requirements)
          </label>
          <textarea
            rows={2}
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="เช่น วุฒิ ป.ตรี สาขาคอมพิวเตอร์ หรือเทียบเท่า, มีความกระตือรือร้นในการเรียนรู้เทคโนโลยีใหม่ๆ..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* ACTIONS */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>เผยแพร่ประกาศงาน</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
