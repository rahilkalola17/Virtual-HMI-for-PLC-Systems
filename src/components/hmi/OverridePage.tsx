// OverridePage: manual control UI for pneumatics and conveyors
// Intended for maintenance/testing where direct actuator control is needed.
import React, { memo } from 'react';
import ControlBar from './ControlBar';
import type { PneumaticsState, ConveyorsState } from '../../types/hmi';

// Props for OverridePage
interface OverridePageProps {
  pneumatics: PneumaticsState;
  conveyors: ConveyorsState;
  isMutating: boolean;
  eStopActive: boolean;
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
  onPneumaticControl: (num: number, extend: boolean) => void;
  onConveyorControl: (id: string, active: boolean) => void;
}

const OverridePage = memo(({
  pneumatics,
  conveyors,
  isMutating,
  eStopActive,
  onEStop,
  onResetStart,
  onResetEnd,
  onPneumaticControl,
  onConveyorControl
}: OverridePageProps) => (
  <div className="space-y-6 pb-24 animate-fade-in">
    <ControlBar
      onEStop={onEStop}
      onResetStart={onResetStart}
      onResetEnd={onResetEnd}
      isMutating={isMutating}
      eStopActive={eStopActive}
    />

    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Pneumatics Control</h2>

      <div className="grid grid-cols-3 gap-6">
        {(['p1', 'p2', 'p3'] as const).map((unit, idx) => (
          <div key={unit} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="text-center mb-6">
              <div className="text-slate-400 font-semibold mb-4 uppercase text-sm">Pneumatic {idx + 1}</div>

              <svg viewBox="0 0 100 120" className="w-32 h-32 mx-auto mb-4">
                <rect x="35" y="60" width="30" height="50" fill="#64748b" stroke="#475569" strokeWidth="2"/>
                <rect x="35" y="40" width="30" height="20" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                <rect x="10" y="10" width="80" height="25" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" rx="2"/>
                <line x1="15" y1="15" x2="15" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="25" y1="15" x2="25" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="35" y1="15" x2="35" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="45" y1="15" x2="45" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="55" y1="15" x2="55" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="65" y1="15" x2="65" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="75" y1="15" x2="75" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="85" y1="15" x2="85" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
              </svg>

              <div className="text-lg font-bold text-cyan-400 mb-2">P{idx + 1}</div>
              <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                pneumatics[unit].status === 'extended'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}>
                {pneumatics[unit].status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onPneumaticControl(idx + 1, true)}
                disabled={isMutating || pneumatics[unit].status === 'extended'}
                className={`w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-semibold transition-all duration-300 ${
                  isMutating || pneumatics[unit].status === 'extended' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Extend
              </button>
              <button
                onClick={() => onPneumaticControl(idx + 1, false)}
                disabled={isMutating || pneumatics[unit].status === 'retracted'}
                className={`w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 font-semibold transition-all duration-300 ${
                  isMutating || pneumatics[unit].status === 'retracted' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Retract
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Conveyor Systems</h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'main' as const, label: 'Main Conveyor' },
          { id: 'sc1' as const, label: 'SC 1' },
          { id: 'sc2' as const, label: 'SC 2' },
          { id: 'sc3' as const, label: 'SC 3' }
        ].map((conv) => (
          <div key={conv.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-300 font-semibold mb-1">{conv.label}</div>
                <div className="text-xs text-slate-500">{conveyors[conv.id].active ? 'Running' : 'Stopped'}</div>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                conveyors[conv.id].active
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-slate-700/50 border-slate-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${conveyors[conv.id].active ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
              </div>
            </div>

            <button
              onClick={() => onConveyorControl(conv.id, !conveyors[conv.id].active)}
              disabled={isMutating}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                conveyors[conv.id].active
                  ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400'
              } ${isMutating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {conveyors[conv.id].active ? 'Stop' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
));

OverridePage.displayName = 'OverridePage';

export default OverridePage;
