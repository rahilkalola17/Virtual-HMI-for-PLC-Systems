// ErrorsPage: displays current system errors and allows inspection
// Shows grouped fault lists and an active error count badge.
import React, { memo, useMemo } from 'react';
import { Power, RotateCcw } from 'lucide-react';
import ControlBar from './ControlBar';
import { HoldButton } from './ControlButtons';
import type { ErrorsState } from '../../types/hmi';

interface ErrorsPageProps {
  errors: ErrorsState;
  isMutating: boolean;
  eStopActive: boolean;
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
}

const ErrorsPage = memo(({
  errors,
  isMutating,
  eStopActive,
  onEStop,
  onResetStart,
  onResetEnd
}: ErrorsPageProps) => {
  // Compute a list of active error entries for rendering and badge count
  const activeErrors = useMemo(() =>
    Object.entries(errors).filter(([, value]) => value),
    [errors]
  );

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <ControlBar
        onEStop={onEStop}
        onResetStart={onResetStart}
        onResetEnd={onResetEnd}
        isMutating={isMutating}
        eStopActive={eStopActive}
      />

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Error Status</h2>
          <div className={`px-4 py-2 rounded-lg ${
            activeErrors.length > 0
              ? 'bg-red-500/20 border border-red-500/50'
              : 'bg-green-500/20 border border-green-500/50'
          }`}>
            <span className={`text-sm font-bold ${activeErrors.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {activeErrors.length} Active Errors
            </span>
          </div>
        </div>

        {activeErrors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Power className="text-green-400" size={40} />
            </div>
            <p className="text-slate-400 text-lg">No errors detected. System operating normally.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Pneumatic Faults</h3>
          <div className="space-y-3">
            {[
              { key: 'p1FaultBack' as const, label: 'P1 Fault Back' },
              { key: 'p1FaultFront' as const, label: 'P1 Fault Front' },
              { key: 'p2FaultBack' as const, label: 'P2 Fault Back' },
              { key: 'p2FaultFront' as const, label: 'P2 Fault Front' },
              { key: 'p3FaultBack' as const, label: 'P3 Fault Back' },
              { key: 'p3FaultFront' as const, label: 'P3 Fault Front' }
            ].map((error) => (
              <div key={error.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-300 font-semibold">{error.label}</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  errors[error.key]
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-green-700/50 border-green-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${errors[error.key] ? 'bg-red-400 animate-pulse' : 'bg-green-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Conveyor Faults</h3>
          <div className="space-y-3">
            {[
              { key: 'mainConv' as const, label: 'Main Conv' },
              { key: 'subCon1' as const, label: 'Sub Con 1' },
              { key: 'subCon2' as const, label: 'Sub Con 2' },
              { key: 'subCon3' as const, label: 'Sub Con 3' }
            ].map((error) => (
              <div key={error.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-300 font-semibold">{error.label}</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  errors[error.key]
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-green-700/50 border-green-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${errors[error.key] ? 'bg-red-400 animate-pulse' : 'bg-green-500'}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* <HoldButton
            onHoldStart={onResetStart}
            onHoldEnd={onResetEnd}
            disabled={isMutating}
            className={`w-full mt-6 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isMutating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCcw size={20} />
            Reset All Errors
          </HoldButton> */}
        </div>
      </div>
    </div>
  );
});

ErrorsPage.displayName = 'ErrorsPage';

export default ErrorsPage;
