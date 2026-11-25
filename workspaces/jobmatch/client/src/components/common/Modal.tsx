import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl ${maxWidth} w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 shrink-0">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
              {icon}
            </div>
          )}
          <div className="pr-6">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-brand-600 font-semibold mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="py-4 overflow-y-auto flex-1 text-xs text-slate-700">{children}</div>

        {footer && <div className="pt-4 border-t border-slate-100 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};
