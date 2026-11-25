import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-800';
          let icon = <CheckCircle2 className="w-4 h-4 text-growth-400 shrink-0" />;

          if (toast.type === 'error') {
            bgClass = 'bg-red-900/95 text-white border-red-700';
            icon = <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-900/95 text-white border-amber-700';
            icon = <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-brand-900/95 text-white border-brand-700';
            icon = <Info className="w-4 h-4 text-brand-300 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs font-medium border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgClass}`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white ml-2 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
