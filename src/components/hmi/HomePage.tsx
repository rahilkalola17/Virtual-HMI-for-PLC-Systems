// HomePage: dashboard showing system controls and quick navigation
// This file renders main control buttons and module statistics.
import React, { memo } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { ToggleButton, HoldButton } from './ControlButtons';
import type { StatsData, ControlState } from '../../types/hmi';

// Props accepted by HomePage component
interface HomePageProps {
  statsData: StatsData;
  controlState: ControlState;
  isMutating: boolean;
  onStart: () => void;
  onStop: () => void;
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
  onPageChange: (page: string) => void;
}

const HomePage = memo(({
  statsData,
  controlState,
  isMutating,
  onStart,
  onStop,
  onEStop,
  onResetStart,
  onResetEnd,
  onPageChange
}: HomePageProps) => (
  <div className="space-y-6 pb-24 animate-fade-in">
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-8">System Control</h2>

      <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
        <ToggleButton
          isActive={controlState.start}
          onClick={onStart}
          isMutating={isMutating}
          activeClassName="aspect-square bg-green-500 border-4 border-green-300 rounded-lg flex flex-col items-center justify-center shadow-xl shadow-green-500/50 ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900"
          inactiveClassName="aspect-square bg-green-600 hover:bg-green-500 border-4 border-green-700 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-xl shadow-green-900/50"
          activeLabel="ON"
          inactiveLabel="OFF"
          disabled={controlState.eStop || controlState.stop}
        >
          <span className="text-white font-bold text-xl">Start</span>
        </ToggleButton>

        <ToggleButton
          isActive={controlState.stop}
          onClick={onStop}
          isMutating={isMutating}
          activeClassName="aspect-square bg-orange-400 border-4 border-orange-300 rounded-lg flex flex-col items-center justify-center shadow-xl shadow-orange-500/50 ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-900"
          inactiveClassName="aspect-square bg-orange-500 hover:bg-orange-400 border-4 border-orange-600 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-xl shadow-orange-900/50"
          activeLabel="ON"
          inactiveLabel="OFF"
          disabled={controlState.eStop}
        >
          <span className="text-white font-bold text-xl">Stop</span>
        </ToggleButton>

        <ToggleButton
          isActive={controlState.eStop}
          onClick={onEStop}
          isMutating={isMutating}
          activeClassName="aspect-square bg-red-500 border-4 border-red-300 rounded-lg flex flex-col items-center justify-center shadow-xl shadow-red-500/50 ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900 animate-pulse"
          inactiveClassName="aspect-square bg-red-600 hover:bg-red-500 border-4 border-red-700 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-xl shadow-red-900/50"
          activeLabel="ON"
          inactiveLabel="OFF"
        >
          <span className="text-white font-bold text-xl">E-Stop</span>
        </ToggleButton>

        <HoldButton
          onHoldStart={onResetStart}
          onHoldEnd={onResetEnd}
          disabled={isMutating}
          className={`aspect-square bg-teal-600 hover:bg-teal-500 border-4 border-teal-700 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-xl shadow-teal-900/50 ${
            isMutating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-white font-bold text-xl">Reset</span>
          {/* <span className="text-white/70 text-xs mt-1">ON</span> */}
        </HoldButton>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300">
        <div className="text-slate-500 text-sm mb-2 uppercase tracking-wide">Module 1</div>
        <div className="text-4xl font-bold text-cyan-400 mb-1">{statsData.module1.count}</div>
        <div className="text-slate-400 text-xs">{statsData.module1.percentage ? Number(statsData.module1.percentage.toFixed(2)) : 0}% Efficiency</div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300">
        <div className="text-slate-500 text-sm mb-2 uppercase tracking-wide">Module 2</div>
        <div className="text-4xl font-bold text-blue-400 mb-1">{statsData.module2.count}</div>
        <div className="text-slate-400 text-xs">{statsData.module2.percentage ? Number(statsData.module2.percentage.toFixed(2)) : 0}% Efficiency</div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300">
        <div className="text-slate-500 text-sm mb-2 uppercase tracking-wide">Module 3</div>
        <div className="text-4xl font-bold text-purple-400 mb-1">{statsData.module3.count}</div>
        <div className="text-slate-400 text-xs">{statsData.module3.percentage ? Number(statsData.module3.percentage.toFixed(2)) : 0}% Efficiency</div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300">
        <div className="text-slate-500 text-sm mb-2 uppercase tracking-wide">Total</div>
        <div className="text-4xl font-bold text-emerald-400 mb-1">{statsData.total}</div>
        <div className="text-slate-400 text-xs">Total Units</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <button
        onClick={() => onPageChange('statistics')}
        className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 hover:from-blue-800/50 hover:to-blue-900/50 p-8 rounded-2xl border border-blue-500/30 transition-all duration-300 group text-left"
      >
        <BarChart3 className="text-blue-400 mb-3" size={40} />
        <h3 className="text-2xl font-bold text-blue-200 mb-2">Statistics</h3>
        <p className="text-blue-400/60 text-sm">View detailed performance metrics</p>
      </button>

      <button
        onClick={() => onPageChange('override')}
        className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 hover:from-purple-800/50 hover:to-purple-900/50 p-8 rounded-2xl border border-purple-500/30 transition-all duration-300 group text-left"
      >
        <Settings className="text-purple-400 mb-3" size={40} />
        <h3 className="text-2xl font-bold text-purple-200 mb-2">Override Control</h3>
        <p className="text-purple-400/60 text-sm">Manual system control</p>
      </button>

      {/* Configuration button removed from Home page per request */}
    </div>
  </div>
));

HomePage.displayName = 'HomePage';

export default HomePage;
