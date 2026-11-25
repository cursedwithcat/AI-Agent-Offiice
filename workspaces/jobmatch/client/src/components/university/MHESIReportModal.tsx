import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { universityApi } from '../../services/universityApi';
import { useToast } from '../../context/ToastContext';

interface MHESIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MHESIReportModal: React.FC<MHESIReportModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportedData, setExportedData] = useState<any | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await universityApi.exportMHESI();
      setExportedData(data);
      showToast('สร้างรายงานมาตรฐาน สกอ. (MHESI) สำเร็จเรียบร้อย!', 'success');
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถส่งออกรายงานได้', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!exportedData) return;
    const jsonStr = JSON.stringify(exportedData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MHESI_Accreditation_Report_2026.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์ข้อมูลรายงานเรียบร้อยแล้ว', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รายงานข้อมูลการมีงานทำเพื่อการประกันคุณภาพหลักสูตร (MHESI Standard)"
      subtitle="ส่งมอบข้อมูลตามเกณฑ์กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)"
      icon={<FileSpreadsheet className="w-5 h-5 text-growth-600" />}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            ปิดหน้าต่าง
          </button>
          {exportedData ? (
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-growth-600 hover:bg-growth-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์รายงาน (.JSON / CSV)</span>
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-uni-600 hover:bg-uni-500 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>ประมวลผลรายงาน สกอ. ทันที</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-growth-600" />
            <span>การรับรองความถูกต้องของชุดข้อมูล (Cryptographically Verified)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            ชุดข้อมูลนี้รวบรวมจากประวัติการยืนยันสถานะการจ้างงานโดยองค์กรธุรกิจที่มีการตรวจสอบตัวตน (KYB Verified) สอดคล้องตามประกาศคณะกรรมการมาตรฐานการอุดมศึกษา พ.ศ. 2565
          </p>
        </div>

        {exportedData ? (
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto">
            <pre>{JSON.stringify(exportedData, null, 2)}</pre>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 space-y-2">
            <p className="text-xs">กดปุ่ม "ประมวลผลรายงาน สกอ. ทันที" เพื่อดึงข้อมูลล่าสุดจากระบบ</p>
            <p className="text-[11px] text-slate-400">ระบบจะจัดทำตารางจำแนกตามสาขาวิชาและคำนวณร้อยละการมีงานทำอัตโนมัติ</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
