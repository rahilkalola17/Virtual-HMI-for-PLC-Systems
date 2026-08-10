// ControlBar: shared top control bar with E-Stop and Reset controls
// Used on multiple pages to provide emergency and reset operations.
import React, { memo } from 'react';
import { HoldButton } from './ControlButtons';

// Props for ControlBar component
interface ControlBarProps {
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
  isMutating: boolean;
  eStopActive: boolean;
}

const ControlBar = memo(({
  onEStop,
  onResetStart,
  onResetEnd,
  isMutating,
  eStopActive
}: ControlBarProps) => (
  <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-800 p-4 mb-6">
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onEStop}
        disabled={isMutating}
        className={`px-8 py-4 border-2 rounded-lg text-white font-bold text-lg transition-all hover:scale-105 shadow-lg ${
          eStopActive
            ? 'bg-red-700 border-red-500 ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900'
            : 'bg-red-600 hover:bg-red-500 border-red-700'
        } ${isMutating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {eStopActive ? 'E-Stop Active' : 'E-Stop'}
      </button>
      <HoldButton
        onHoldStart={onResetStart}
        onHoldEnd={onResetEnd}
        showToggle={false}
        disabled={isMutating}
        className={`px-8 py-4 bg-teal-600 hover:bg-teal-500 border-2 border-teal-700 rounded-lg text-white font-bold text-lg shadow-lg ${
          isMutating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Reset
      </HoldButton>
    </div>
  </div>
));

ControlBar.displayName = 'ControlBar';

export default ControlBar;
