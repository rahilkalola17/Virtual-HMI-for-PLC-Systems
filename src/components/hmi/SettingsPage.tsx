import React, { memo, useEffect, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { Gauge, Package, ShieldCheck, SlidersHorizontal, Wrench, EyeOff, Eye } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

import ControlBar from "./ControlBar";
import type {
  ControlState,
  ConveyorSpeeds,
  ModuleMetric,
  ModuleMetrics,
  StatsData,
} from "../../types/hmi";
import { supabase } from "../../lib/supabaseClient";

interface SettingsPageProps {
  statsData: StatsData;
  controlState: ControlState;
  modules: { module1: boolean; module2: boolean; module3: boolean };
  isMutating: boolean;
  onPageChange: (page: string) => void;
  eStopActive: boolean;
  onEStop: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
  writeTag: (tag: string, value: boolean | number, successMessage?: string) => Promise<boolean>;
  speedInput: number;
  pneumaticPressure: number;

  conveyorSpeeds: ConveyorSpeeds;
  volumeSort: boolean;
  moduleMetrics: ModuleMetrics;
}

const panel =
  "bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-6";

const SettingsPage = memo(
  ({
    statsData,
    controlState,
    modules,
    isMutating,
    onPageChange,
    writeTag,
    speedInput,
    pneumaticPressure,
    eStopActive,
    onEStop,
    onResetStart,
    onResetEnd,
    conveyorSpeeds,
    volumeSort: volumeSortFromBackend,
    moduleMetrics,
  }: SettingsPageProps) => {
    const { toast } = useToast();

    // =========================
    // Admin Sign-In (OLD PAGE)
    // =========================
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // =========================
    // Settings UI (your new page)
    // =========================
    const [mainSpeed, setMainSpeed] = useState<number>(conveyorSpeeds?.main ?? speedInput ?? 0);
    const [sub1Speed, setSub1Speed] = useState<number>(conveyorSpeeds?.sc1 ?? 0);
    const [sub2Speed, setSub2Speed] = useState<number>(conveyorSpeeds?.sc2 ?? 0);
    const [sub3Speed, setSub3Speed] = useState<number>(conveyorSpeeds?.sc3 ?? 0);
    const [volumeSort, setVolumeSort] = useState<boolean>(Boolean(volumeSortFromBackend));

    // Local editable module metric state
    const [m1, setM1] = useState<ModuleMetric>(moduleMetrics.m1);
    const [m2, setM2] = useState<ModuleMetric>(moduleMetrics.m2);
    const [m3, setM3] = useState<ModuleMetric>(moduleMetrics.m3);

    // All hooks must be called unconditionally before any early returns
    useEffect(() => {
      let mounted = true;

      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (!mounted) return;
          setSession(session);
        })
        .finally(() => {
          if (!mounted) return;
          setInitialLoading(false);
        });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => {
        mounted = false;
        data.subscription.unsubscribe();
      };
    }, []);

    useEffect(() => {
      if (!session) return;
      setMainSpeed(conveyorSpeeds?.main ?? speedInput ?? 0);
    }, [conveyorSpeeds?.main, speedInput, session]);

    useEffect(() => {
      if (!session) return;
      setSub1Speed(conveyorSpeeds?.sc1 ?? 0);
      setSub2Speed(conveyorSpeeds?.sc2 ?? 0);
      setSub3Speed(conveyorSpeeds?.sc3 ?? 0);
    }, [conveyorSpeeds?.sc1, conveyorSpeeds?.sc2, conveyorSpeeds?.sc3, session]);

    useEffect(() => {
      if (!session) return;
      setVolumeSort(Boolean(volumeSortFromBackend));
    }, [volumeSortFromBackend, session]);

    useEffect(() => {
      if (!session) return;
      setM1(moduleMetrics.m1);
    }, [moduleMetrics.m1, session]);

    useEffect(() => {
      if (!session) return;
      setM2(moduleMetrics.m2);
    }, [moduleMetrics.m2, session]);

    useEffect(() => {
      if (!session) return;
      setM3(moduleMetrics.m3);
    }, [moduleMetrics.m3, session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAuthLoading(true);

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast({ description: error.message });
      } finally {
        setAuthLoading(false);
      }
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

    if (initialLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <h1 className="text-slate-200">Loading...</h1>
        </div>
      );
    }

    // Only render settings content if authenticated
    if (!session) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-full max-w-lg bg-gradient-to-tr from-slate-900/70 to-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-700">
                <ShieldCheck className="text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Admin Sign In</div>
                <div className="text-sm text-slate-400">Sign in with your email and password</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  className="w-full mt-2 bg-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-800 rounded-lg px-4 py-3 text-white pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-6 py-3 bg-cyan-600 rounded-lg text-white font-semibold shadow"
                >
                  {authLoading ? "Signing in..." : "Sign in"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setPassword("");
                  }}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-white"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    const clampPercent = (n: number) => Math.max(0, Math.min(100, Number.isNaN(n) ? 0 : n));
    const nonNegative = (n: number) => Math.max(0, Number.isNaN(n) ? 0 : n);

    const applySpeed = async (tag: string, value: number, label: string) => {
      const safe = clampPercent(value);
      if (safe !== value) toast({ description: "Speed range is 0 to 100." });
      await writeTag(tag, safe, `${label} set to ${safe}`);
    };

    const applyMetric = async (tag: string, value: number, label: string, unit: string) => {
      const safe = nonNegative(value);
      if (safe !== value) toast({ description: "Value must be 0 or greater." });
      await writeTag(tag, safe, `${label} set to ${safe} ${unit}`);
    };

    // suppress unused warnings (kept because props are part of the contract)
    void statsData;
    void controlState;

    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <ControlBar
          onEStop={onEStop}
          onResetStart={onResetStart}
          onResetEnd={onResetEnd}
          isMutating={isMutating}
          eStopActive={eStopActive}
        />

        <div className={panel}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Wrench className="text-cyan-400" /> Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs uppercase mb-2 flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Pneumatic Pressure
              </div>
              <div className="text-4xl font-bold text-emerald-300">{pneumaticPressure} bar</div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs uppercase mb-2 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Sorting Rule
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-200">Sort by volume</span>
                <button
                  onClick={async () => {
                    const next = !volumeSort;
                    setVolumeSort(next);
                    await writeTag(
                      "V_Volume_Switch",
                      next,
                      `Sort by volume ${next ? "enabled" : "disabled"}`
                    );
                  }}
                  disabled={isMutating}
                  className={`px-4 py-2 rounded font-semibold ${
                    volumeSort ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-white"
                  }`}
                >
                  {volumeSort ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Conveyor speeds */}
            <div className={panel}>
              <div className="text-slate-400 text-xs uppercase mb-3">Conveyor Speed Control</div>
              <div className="space-y-4">
                <SpeedRow
                  label="Main Conveyor"
                  value={mainSpeed}
                  setValue={setMainSpeed}
                  onApply={() => applySpeed("V_Conv_Main_Speed", mainSpeed, "Main conveyor speed")}
                  isMutating={isMutating}
                />
                <SpeedRow
                  label="Sub Conveyor 1"
                  value={sub1Speed}
                  setValue={setSub1Speed}
                  onApply={() => applySpeed("V_Conv_1_Speed", sub1Speed, "Sub conveyor 1 speed")}
                  isMutating={isMutating}
                />
                <SpeedRow
                  label="Sub Conveyor 2"
                  value={sub2Speed}
                  setValue={setSub2Speed}
                  onApply={() => applySpeed("V_Conv_2_Speed", sub2Speed, "Sub conveyor 2 speed")}
                  isMutating={isMutating}
                />
                <SpeedRow
                  label="Sub Conveyor 3"
                  value={sub3Speed}
                  setValue={setSub3Speed}
                  onApply={() => applySpeed("V_Conv_3_Speed", sub3Speed, "Sub conveyor 3 speed")}
                  isMutating={isMutating}
                />
              </div>
            </div>

            {/* Module 1 */}
            <ModuleCard
              title="Module 1"
              enabled={modules.module1}
              onToggle={async () =>
                writeTag(
                  "V_Module_1",
                  !modules.module1,
                  `Module 1 ${!modules.module1 ? "enabled" : "disabled"}`
                )
              }
              metric={m1}
              setMetric={setM1}
              onApplyField={(field, value) => {
                const map = {
                  length: "V_M1_Length",
                  width: "V_M1_Width",
                  height: "V_M1_Height",
                  volume: "V_M1_Volume",
                } as const;

                const unit = field === "volume" ? "mm³" : "mm";
                const label = `Module 1 ${field}`;
                return applyMetric(map[field], value, label, unit);
              }}
              isMutating={isMutating}
            />

            {/* Module 2 */}
            <ModuleCard
              title="Module 2"
              enabled={modules.module2}
              onToggle={async () =>
                writeTag(
                  "V_Module_2",
                  !modules.module2,
                  `Module 2 ${!modules.module2 ? "enabled" : "disabled"}`
                )
              }
              metric={m2}
              setMetric={setM2}
              onApplyField={(field, value) => {
                const map = {
                  length: "V_M2_Length",
                  width: "V_M2_Width",
                  height: "V_M2_Height",
                  volume: "V_M2_Volume",
                } as const;

                const unit = field === "volume" ? "mm³" : "mm";
                const label = `Module 2 ${field}`;
                return applyMetric(map[field], value, label, unit);
              }}
              isMutating={isMutating}
            />

            {/* Module 3 */}
            <ModuleCard
              title="Module 3"
              enabled={modules.module3}
              onToggle={async () =>
                writeTag(
                  "V_Module_3",
                  !modules.module3,
                  `Module 3 ${!modules.module3 ? "enabled" : "disabled"}`
                )
              }
              metric={m3}
              setMetric={setM3}
              onApplyField={(field, value) => {
                const map = {
                  length: "V_M3_Length",
                  width: "V_M3_Width",
                  height: "V_M3_Height",
                  volume: "V_M3_Volume",
                } as const;

                const unit = field === "volume" ? "mm³" : "mm";
                const label = `Module 3 ${field}`;
                return applyMetric(map[field], value, label, unit);
              }}
              isMutating={isMutating}
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-600 rounded-lg text-white font-semibold shadow"
            >
              Sign Out
            </button>
            <button
              onClick={() => onPageChange("home")}
              className="px-4 py-2 bg-slate-800 rounded-lg text-white"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
);

type MetricField = "length" | "width" | "height" | "volume";

type ModuleCardProps = {
  title: string;
  enabled: boolean;
  onToggle: () => Promise<boolean> | Promise<void>;
  metric: ModuleMetric;
  setMetric: (m: ModuleMetric) => void;
  onApplyField: (field: MetricField, value: number) => Promise<void>;
  isMutating: boolean;
};

function ModuleCard({ title, enabled, onToggle, metric, setMetric, onApplyField, isMutating }: ModuleCardProps) {
  return (
    <div className={panel}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-cyan-400" />
          {title}
        </h3>
        <button
          onClick={onToggle}
          disabled={isMutating}
          className={`px-4 py-2 rounded font-semibold ${
            enabled ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-white"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="space-y-3">
        <MetricRow
          label="Length"
          unit="mm"
          value={metric.length}
          isMutating={isMutating}
          onChange={(v) => setMetric({ ...metric, length: v })}
          onApply={() => onApplyField("length", metric.length)}
        />
        <MetricRow
          label="Width"
          unit="mm"
          value={metric.width}
          isMutating={isMutating}
          onChange={(v) => setMetric({ ...metric, width: v })}
          onApply={() => onApplyField("width", metric.width)}
        />
        <MetricRow
          label="Height"
          unit="mm"
          value={metric.height}
          isMutating={isMutating}
          onChange={(v) => setMetric({ ...metric, height: v })}
          onApply={() => onApplyField("height", metric.height)}
        />
        <MetricRow
          label="Volume"
          unit="mm³"
          value={metric.volume}
          isMutating={isMutating}
          onChange={(v) => setMetric({ ...metric, volume: v })}
          onApply={() => onApplyField("volume", metric.volume)}
        />
      </div>
    </div>
  );
}

type MetricRowProps = {
  label: string;
  unit: string;
  value: number;
  isMutating: boolean;
  onChange: (n: number) => void;
  onApply: () => Promise<void>;
};

function MetricRow({ label, unit, value, isMutating, onChange, onApply }: MetricRowProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
      <div className="text-sm text-slate-300 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={isMutating}
          className="w-28 bg-slate-800 rounded px-2 py-1 text-sm text-white"
        />
        <span className="text-xs text-slate-400">{unit}</span>
        <button
          onClick={onApply}
          disabled={isMutating}
          className="ml-auto px-3 py-1 bg-cyan-600 rounded text-white text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

type SpeedRowProps = {
  label: string;
  value: number;
  setValue: (n: number) => void;
  onApply: () => Promise<void>;
  isMutating: boolean;
};

function SpeedRow({ label, value, setValue, onApply, isMutating }: SpeedRowProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
      <div className="text-sm text-slate-300 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={isMutating}
          className="w-24 bg-slate-800 rounded px-2 py-1 text-sm text-white"
        />
        <span className="text-xs text-slate-400">0–100</span>
        <button
          onClick={onApply}
          disabled={isMutating}
          className="ml-auto px-3 py-1 bg-cyan-600 rounded text-white text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

SettingsPage.displayName = "SettingsPage";
export default SettingsPage;
