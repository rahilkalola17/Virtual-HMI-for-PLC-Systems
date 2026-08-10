/*
 * File: src/pages/Index.tsx
 * Purpose: Main application page that composes the HMI views and manages
 * page navigation. Uses the `useHmiData` hook to fetch and mutate HMI state.
 * This is a documentation header only; no logic changes.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHmiData } from '../hooks/useHmiData';
import {
  Navigation,
  BottomNav,
  HomePage,
  StatisticsPage,
  OverridePage,
  ErrorsPage,
  SettingsPage
} from '../components/hmi';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const {
    systemStatus,
    statsData,
    pneumatics,
    conveyors,
    modules,
    errors,
    controlState,
    isLoading,
    isMutating,
    fetchData,
    handleStart,
    handleStop,
    handleEStop,
    handleResetStart,
    handleResetEnd,
    handleCounterReset,
    handlePneumaticControl,
    handleConveyorControl,
    writeTag,
    speedInput,
    pneumaticPressure,
    handleCounterResetStart,
    handleCounterResetEnd,

    // ✅ ADD: new settings values from backend (provided by useHmiData)
    conveyorSpeeds,
    volumeSort,
    moduleMetrics,
  } = useHmiData();

  // Initial data fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate error count for badge
  const errorCount = useMemo(() =>
    Object.values(errors).filter(Boolean).length,
    [errors]
  );

  const handlePageChange = useCallback((page: string) => {
    // Prevent leaving Override while pneumatics or conveyors are active.
    if (currentPage === 'override' && page !== 'override') {
      const pneumaticsActive = Object.values(pneumatics).some(p => p.status === 'extended');
      const conveyorsActive = Object.values(conveyors).some(c => c.active);
      if (pneumaticsActive || conveyorsActive) {
        toast.error('Disable pneumatics and conveyors before navigating away from Override');
        return;
      }
    }

    // Prevent entering Override unless system is explicitly stopped and not in E-Stop or running.
    if (page === 'override') {
      const isStopped = controlState.stop === true;
      const isRunningOrEStop = controlState.start === true || controlState.eStop === true;
      if (!isStopped || isRunningOrEStop) {
        toast.error('Enable Stop (and release Start/E-Stop) before entering Override');
        return;
      }
    }

    setCurrentPage(page);
  }, [currentPage, pneumatics, conveyors, controlState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation systemStatus={systemStatus} />

        <div className="transition-all duration-300 ease-in-out">
          {currentPage === 'home' && (
            <HomePage
              statsData={statsData}
              controlState={controlState}
              isMutating={isMutating}
              onStart={handleStart}
              onStop={handleStop}
              onEStop={handleEStop}
              onResetStart={handleResetStart}
              onResetEnd={handleResetEnd}
              onPageChange={handlePageChange}
            />
          )}
          {currentPage === 'statistics' && (
            <StatisticsPage
              statsData={statsData}
              isMutating={isMutating}
              eStopActive={controlState.eStop}
              onEStop={handleEStop}
              onResetStart={handleResetStart}
              onResetEnd={handleResetEnd}
              onCounterReset={handleCounterReset}
              onCounterResetStart={handleCounterResetStart}
              onCounterResetEnd={handleCounterResetEnd}
            />
          )}
          {currentPage === 'override' && (
            <OverridePage
              pneumatics={pneumatics}
              conveyors={conveyors}
              isMutating={isMutating}
              eStopActive={controlState.eStop}
              onEStop={handleEStop}
              onResetStart={handleResetStart}
              onResetEnd={handleResetEnd}
              onPneumaticControl={handlePneumaticControl}
              onConveyorControl={handleConveyorControl}
            />
          )}
          {currentPage === 'settings' && (
            <SettingsPage
              statsData={statsData}
              controlState={controlState}
              isMutating={isMutating}
              onPageChange={handlePageChange}
              eStopActive={controlState.eStop}
              onEStop={handleEStop}
              onResetStart={handleResetStart}
              onResetEnd={handleResetEnd}
              modules={modules}
              writeTag={writeTag}
              speedInput={speedInput}
              pneumaticPressure={pneumaticPressure}

              // ✅ ADD: required props for your updated SettingsPage
              conveyorSpeeds={conveyorSpeeds}
              volumeSort={volumeSort}
              moduleMetrics={moduleMetrics}
            />
          )}
          {currentPage === 'errors' && (
            <ErrorsPage
              errors={errors}
              isMutating={isMutating}
              eStopActive={controlState.eStop}
              onEStop={handleEStop}
              onResetStart={handleResetStart}
              onResetEnd={handleResetEnd}
            />
          )}
        </div>

        <BottomNav
          currentPage={currentPage}
          onPageChange={handlePageChange}
          allowOverride={controlState.stop === true && controlState.start !== true && controlState.eStop !== true}
          errorCount={errorCount}
        />
      </div>
    </div>
  );
};

export default Index;
