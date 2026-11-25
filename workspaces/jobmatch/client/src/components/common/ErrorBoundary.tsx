import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Jobmatch Uncaught UI Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">เกิดข้อผิดพลาดในการแสดงผล</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              ขออภัย ระบบพบข้อผิดพลาดที่ไม่คาดคิดในหน้านี้ รายละเอียด:
            </p>
            <div className="bg-slate-100 text-left p-3 rounded-xl font-mono text-[11px] text-red-600 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรชหน้าเว็บใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
