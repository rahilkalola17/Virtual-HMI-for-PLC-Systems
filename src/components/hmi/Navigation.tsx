// Navigation: small header component that shows system title, status badge and clock
import React, { memo, useMemo } from 'react';
import type { SystemStatus } from '../../types/hmi';

interface NavigationProps {
  systemStatus: SystemStatus;
}

const Navigation = memo(({ systemStatus }: NavigationProps) => {
  const statusConfig = useMemo(() => {
    switch (systemStatus) {
      case 'running':
        return { bg: 'bg-green-500/20 border-green-500/50', dot: 'bg-green-400', text: 'text-green-400', label: 'RUNNING' };
      case 'stopped':
        return { bg: 'bg-orange-500/20 border-orange-500/50', dot: 'bg-orange-400', text: 'text-orange-400', label: 'STOPPED' };
      case 'emergency':
        return { bg: 'bg-red-500/20 border-red-500/50', dot: 'bg-red-400', text: 'text-red-400', label: 'EMERGENCY' };
      default:
        return { bg: 'bg-slate-700/50 border-slate-600', dot: 'bg-slate-500', text: 'text-slate-400', label: 'STANDBY' };
    }
  }, [systemStatus]);

  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">AMSL Control System</h1>
        <p className="text-slate-400 text-sm">Industrial Automation Interface</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`px-4 py-2 rounded-lg border ${statusConfig.bg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusConfig.dot} ${systemStatus !== 'standby' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-sm font-semibold ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-cyan-400">{time.toLocaleTimeString()}</div>
          <div className="text-xs text-slate-500">{time.toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
