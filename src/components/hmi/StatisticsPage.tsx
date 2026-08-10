// StatisticsPage: shows production counters and percentage metrics
// Includes counter-reset controls and visual performance bars.
import React, { memo } from 'react';
import { RefreshCw } from 'lucide-react';
import ControlBar from './ControlBar';
import type { StatsData } from '../../types/hmi';
import { HoldButton } from './ControlButtons';

// Props accepted by StatisticsPage
interface StatisticsPageProps {
  statsData: StatsData;
  isMutating: boolean;
  eStopActive: boolean;
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
  onCounterReset: () => void;
  onCounterResetStart: () => void;
  onCounterResetEnd: () => void;
}

const StatisticsPage = memo(({
  statsData,
  isMutating,
  eStopActive,
  onEStop,
  onResetStart,
  onResetEnd,
  onCounterReset,
  onCounterResetStart,
  onCounterResetEnd,

}: StatisticsPageProps) => (
  <div className="space-y-6 pb-24 animate-fade-in">
    <ControlBar
      onEStop={onEStop}
      onResetStart={onResetStart}
      onResetEnd={onResetEnd}
      isMutating={isMutating}
      eStopActive={eStopActive}
    />

    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Production Statistics</h2>
        {/* <button
          onClick={onCounterReset}
          disabled={isMutating}
          className={`px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-semibold transition-all duration-300 flex items-center gap-2 ${
            isMutating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={20} className={isMutating ? 'animate-spin' : ''} />
          Counter Reset
        </button> */}
        <HoldButton
          onHoldStart={onCounterResetStart}
          onHoldEnd={onCounterResetEnd}
          disabled={isMutating}
          showToggle={false}
          className={(isHolding) => `px-6 py-3 border border-cyan-500/30 rounded-xl text-cyan-400 font-semibold transition-all duration-300 flex items-center gap-2 ${
            isHolding ? 'bg-green-700/50 cursor-not-allowed' : 'bg-cyan-500/10 hover:bg-cyan-500/20'
          }`}
        >
          <RefreshCw size={20} className={isMutating ? 'animate-spin' : ''} />
          Counter Reset
        </HoldButton>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="text-left p-4 text-slate-400 font-semibold border-b border-slate-700"></th>
              <th className="text-center p-4 text-slate-400 font-semibold border-b border-slate-700">Count</th>
              <th className="text-center p-4 text-slate-400 font-semibold border-b border-slate-700">Percent</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4 text-cyan-400 font-semibold border-b border-slate-700/50">Module 1:</td>
              <td className="p-4 text-center text-white text-2xl font-mono border-b border-slate-700/50">{statsData.module1.count}</td>
              <td className="p-4 text-center text-cyan-400 text-xl font-bold border-b border-slate-700/50">{statsData.module1.percentage ? Number(statsData.module1.percentage.toFixed(2)) : 0} %</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4 text-blue-400 font-semibold border-b border-slate-700/50">Module 2:</td>
              <td className="p-4 text-center text-white text-2xl font-mono border-b border-slate-700/50">{statsData.module2.count}</td>
              <td className="p-4 text-center text-blue-400 text-xl font-bold border-b border-slate-700/50">{statsData.module2.percentage ? Number(statsData.module2.percentage.toFixed(2)) : 0} %</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4 text-purple-400 font-semibold border-b border-slate-700/50">Module 3:</td>
              <td className="p-4 text-center text-white text-2xl font-mono border-b border-slate-700/50">{statsData.module3.count}</td>
              <td className="p-4 text-center text-purple-400 text-xl font-bold border-b border-slate-700/50">{statsData.module3.percentage ? Number(statsData.module3.percentage.toFixed(2)) : 0} %</td>
            </tr>
            <tr className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
              <td className="p-4 text-emerald-400 font-bold">Total</td>
              <td className="p-4 text-center text-emerald-400 text-2xl font-mono font-bold">{statsData.total}</td>
              <td className="p-4 text-center text-slate-500"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
      <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
      <div className="space-y-6">
        {[
          { name: 'Module 1', value: statsData.module1.percentage, color: 'cyan' },
          { name: 'Module 2', value: statsData.module2.percentage, color: 'blue' },
          { name: 'Module 3', value: statsData.module3.percentage, color: 'purple' }
        ].map((module, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 font-semibold">{module.name}</span>
              <span className="text-2xl font-bold text-cyan-400">{module.value === null ? '0' : Number(Math.floor(Math.abs(module.value)))}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${module.value === null ? '0' : Number(module.value)}%` }}
              ></div>
              <div>
                {module.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

StatisticsPage.displayName = 'StatisticsPage';

export default StatisticsPage;
