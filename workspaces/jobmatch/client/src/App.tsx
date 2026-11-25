import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { AuthModal } from './components/common/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const AppContent: React.FC = () => {
  const [isMobileSim, setIsMobileSim] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      {/* GLOBAL NAVBAR WITH PERSONA CONTROLLER */}
      <Navbar
        isMobileSim={isMobileSim}
        onToggleMobileSim={() => setIsMobileSim((prev) => !prev)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* MAIN VIEWPORT CANVAS */}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${
          isMobileSim ? 'max-w-[420px] shadow-2xl my-4 rounded-3xl border-4 border-slate-700 bg-white overflow-hidden' : 'max-w-7xl'
        }`}
      >
        <HomePage />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Jobmatch Platform</span>
            <span>•</span>
            <span>ระบบแพลตฟอร์มหางานและติดตามการมีงานทำ 4 บทบาท</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Royal Blue Theme (#2563EB) • SQLite WAL Sync Engine • Thai PDPA Compliant
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
