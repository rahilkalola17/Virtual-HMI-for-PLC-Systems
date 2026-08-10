// BottomNav: fixed bottom navigation bar for switching HMI views
// Shows quick access buttons and an error badge when errors exist.
import React, { memo } from 'react';
import { Home, Settings, AlertTriangle, BarChart3, Wrench } from 'lucide-react';
import { toast } from 'sonner';

// Props for BottomNav
interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  errorCount: number;
  allowOverride?: boolean;
}

const BottomNav = memo(({ currentPage, onPageChange, errorCount, allowOverride = true }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <button
        onClick={() => onPageChange('home')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-300 ${
          currentPage === 'home'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home size={24} />
        <span className="text-xs font-semibold">Home</span>
      </button>

      <button
        onClick={() => onPageChange('statistics')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-300 ${
          currentPage === 'statistics'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 size={24} />
        <span className="text-xs font-semibold">Statistics</span>
      </button>

      <button
        onClick={() => {
          if (!allowOverride) {
            toast.error('Override entry disabled — enable Stop and release Start/E-Stop');
            return;
          }
          onPageChange('override');
        }}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-300 ${
          currentPage === 'override'
            ? 'bg-cyan-500/20 text-cyan-400'
            : allowOverride
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-500/70 cursor-not-allowed opacity-60'
        }`}
        aria-disabled={!allowOverride}
      >
        <Settings size={24} />
        <span className="text-xs font-semibold">Override</span>
      </button>

      <button
        onClick={() => onPageChange('settings')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-300 ${
          currentPage === 'settings'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Wrench size={24} />
        <span className="text-xs font-semibold">Config</span>
      </button>

      <button
        onClick={() => onPageChange('errors')}
        className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-300 ${
          currentPage === 'errors'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <AlertTriangle size={24} />
        <span className="text-xs font-semibold">Errors</span>
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {errorCount}
          </span>
        )}
      </button>
    </div>
  </div>
));

BottomNav.displayName = 'BottomNav';

export default BottomNav;
