import React, { useState } from 'react';
import { UploadCloud, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { uploadApi } from '../../services/uploadApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];

    if (selected.type !== 'application/pdf') {
      setError('ต้องเป็นไฟล์เอกสารนามสกุล .PDF เท่านั้น');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 5MB) กรุณาเลือกไฟล์ใหม่');
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadApi.uploadResume(file);
      showToast('อัปโหลดและอัปเดตไฟล์เรซูเม่สำเร็จเรียบร้อย!', 'success');
      await refreshProfile();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
      showToast(err.message || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="อัปโหลดเรซูเม่ใหม่ (Upload Resume)"
      subtitle="ระบบรองรับเฉพาะไฟล์ .PDF ขนาดไม่เกิน 5MB"
      icon={<UploadCloud className="w-5 h-5 text-brand-600" />}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-sm"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>บันทึกไฟล์เรซูเม่</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50 hover:bg-brand-50/30 group">
          <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-brand-600 transition-colors" />
          <span className="mt-2 text-xs font-bold text-slate-800">
            คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 font-mono">
            PDF Document (Max 5MB)
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {file && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-growth-900">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-growth-600 shrink-0" />
              <div>
                <div className="font-bold truncate max-w-[200px]">{file.name}</div>
                <div className="text-[10px] text-growth-700">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • พร้อมอัปโหลด
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-growth-200 text-growth-800 px-2 py-0.5 rounded font-mono font-bold">
              READY
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
