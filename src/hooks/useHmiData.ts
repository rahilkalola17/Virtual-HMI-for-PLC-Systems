import { useState, useCallback, useRef } from 'react';
import { fetcher } from '../lib/utils';
import { toast } from 'sonner';
import type {
  ApiData,
  SystemStatus,
  StatsData,
  PneumaticsState,
  ConveyorsState,
  ErrorsState,
  ControlState,
  ConveyorSpeeds,
  ModuleMetrics
} from '../types/hmi';

interface HmiState {
  systemStatus: SystemStatus;
  statsData: StatsData;
  pneumatics: PneumaticsState;
  conveyors: ConveyorsState;
  errors: ErrorsState;
  controlState: ControlState;

  // NEW: settings fields used by SettingsPage
  conveyorSpeeds: ConveyorSpeeds;
  volumeSort: boolean;
  moduleMetrics: ModuleMetrics;

  speedInput: number;
  pneumaticPressure: number;
  modules: { module1: boolean; module2: boolean; module3: boolean };
  isLoading: boolean;
  isMutating: boolean;
}

// Initial in-memory state used by the hook until the first successful API fetch
const initialState: HmiState = {
  systemStatus: 'standby',
  statsData: {
    module1: { count: 0, percentage: 0 },
    module2: { count: 0, percentage: 0 },
    module3: { count: 0, percentage: 0 },
    total: 0
  },
  pneumatics: {
    p1: { status: 'retracted' },
    p2: { status: 'retracted' },
    p3: { status: 'retracted' }
  },
  conveyors: {
    main: { active: false },
    sc1: { active: false },
    sc2: { active: false },
    sc3: { active: false }
  },
  modules: { module1: false, module2: false, module3: false },
  errors: {
    p1FaultBack: false,
    p1FaultFront: false,
    p2FaultBack: false,
    p2FaultFront: false,
    p3FaultBack: false,
    p3FaultFront: false,
    mainConv: false,
    subCon1: false,
    subCon2: false,
    subCon3: false
  },
  controlState: {
    start: false,
    stop: false,
    eStop: false
  },

  conveyorSpeeds: { main: 0, sc1: 0, sc2: 0, sc3: 0 },
  volumeSort: false,
  moduleMetrics: {
    m1: { length: 0, width: 0, height: 0, volume: 0 },
    m2: { length: 0, width: 0, height: 0, volume: 0 },
    m3: { length: 0, width: 0, height: 0, volume: 0 }
  },

  speedInput: 0,
  pneumaticPressure: 0,
  isLoading: true,
  isMutating: false
};

// `useHmiData` hook: fetches/parses HMI API data and exposes control helpers.
export function useHmiData() {
  const [state, setState] = useState<HmiState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const toNumber = (v: unknown, fallback = 0) => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      // Handle Siemens-style hex strings like "16#10" if your backend returns them
      const hex = v.match(/^16#([0-9a-fA-F]+)$/);
      if (hex) return parseInt(hex[1], 16);
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  };

  // Parse the raw API payload into the local HMI state structure
  const parseApiData = useCallback((data: ApiData): Partial<HmiState> => {
    // Determine system status
    let systemStatus: SystemStatus = 'standby';
    if (data.V_E_Stop) {
      systemStatus = 'emergency';
    } else if (data.V_Start && !data.V_Stop) {
      systemStatus = 'running';
    } else if (data.V_Stop && !data.V_Start) {
      systemStatus = 'stopped';
    } else if (!data.V_Start && !data.V_Stop && !data.V_E_Stop) {
      systemStatus = 'standby';
    }

    const convMain = toNumber(data.V_Conv_Main_Speed, toNumber(data.V_Speed_Input, 0));

    return {
      systemStatus,
      statsData: {
        module1: { count: toNumber(data.V_num_1), percentage: toNumber(data.V_S1_percent) },
        module2: { count: toNumber(data.V_num_2), percentage: toNumber(data.V_S2_percent) },
        module3: { count: toNumber(data.V_num_3), percentage: toNumber(data.V_S3_percent) },
        total: toNumber(data.V_Module_Total)
      },
      pneumatics: {
        p1: { status: data.V_P1_ON ? 'extended' : 'retracted' },
        p2: { status: data.V_P2_ON ? 'extended' : 'retracted' },
        p3: { status: data.V_P3_ON ? 'extended' : 'retracted' }
      },
      modules: {
        module1: data.V_Module_1,
        module2: data.V_Module_2,
        module3: data.V_Module_3
      },

      // NEW: settings
      conveyorSpeeds: {
        main: convMain,
        sc1: toNumber(data.V_Conv_1_Speed, 0),
        sc2: toNumber(data.V_Conv_2_Speed, 0),
        sc3: toNumber(data.V_Conv_3_Speed, 0)
      },
      volumeSort: Boolean(data.V_Volume_Switch),
      moduleMetrics: {
        m1: {
          length: toNumber(data.V_M1_Length, 0),
          width: toNumber(data.V_M1_Width, 0),
          height: toNumber(data.V_M1_Height, 0),
          volume: toNumber(data.V_M1_Volume, 0)
        },
        m2: {
          length: toNumber(data.V_M2_Length, 0),
          width: toNumber(data.V_M2_Width, 0),
          height: toNumber(data.V_M2_Height, 0),
          volume: toNumber(data.V_M2_Volume, 0)
        },
        m3: {
          length: toNumber(data.V_M3_Length, 0),
          width: toNumber(data.V_M3_Width, 0),
          height: toNumber(data.V_M3_Height, 0),
          volume: toNumber(data.V_M3_Volume, 0)
        }
      },

      // Keep existing fields
      speedInput: convMain,
      pneumaticPressure: toNumber(data.V_Pnematic_Pressure, 0),

      conveyors: {
        main: { active: data.V_Main_Conv_ON },
        sc1: { active: data.V_Sub_Conv_1_ON },
        sc2: { active: data.V_Sub_Conv_2_ON },
        sc3: { active: data.V_Sub_Conv_3_ON }
      },
      errors: {
        p1FaultBack: data.V_Fault_P1_Back,
        p1FaultFront: data.V_Fault_P1_Front,
        p2FaultBack: data.V_Fault_P2_Back,
        p2FaultFront: data.V_Fault_P2_Front,
        p3FaultBack: data.V_Fault_P3_Back,
        p3FaultFront: data.V_Fault_P3_Front,
        mainConv: data.V_Fault_Conv_Main,
        subCon1: data.V_Fault_Sub_Conv_1,
        subCon2: data.V_Fault_Sub_Conv_2,
        subCon3: data.V_Fault_Sub_Conv_3
      },
      controlState: {
        start: data.V_Start,
        stop: data.V_Stop,
        eStop: data.V_E_Stop
      }
    };
  }, []);

  // Fetch latest state from the HMI API and merge into hook state
  const fetchData = useCallback(async () => {
    try {
      const data = await fetcher('/read') as ApiData;
      const parsedData = parseApiData(data);
      setState(prev => ({ ...prev, ...parsedData, isLoading: false }));
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [parseApiData]);

  // Write a tag to the backend API, show toast feedback and refetch on success
  const writeTag = useCallback(async (
    tag: string,
    value: boolean | number,
    successMessage?: string
  ): Promise<boolean> => {
    // Prevent multiple mutations
    if (state.isMutating) {
      toast.warning('Please wait for the previous operation to complete');
      return false;
    }

    setState(prev => ({ ...prev, isMutating: true }));

    try {
      await fetcher('/write', {
        method: 'POST',
        body: JSON.stringify({ tag, value })
      });

      // Refetch data after mutation
      await fetchData();

      if (successMessage) {
        toast.success(successMessage);
      }

      return true;
    } catch (error) {
      console.error(`Error writing ${tag}:`, error);
      toast.error(`Failed to update ${tag}`);
      return false;
    } finally {
      setState(prev => ({ ...prev, isMutating: false }));
    }
  }, [state.isMutating, fetchData]);

  // Toggle handlers that pass the opposite value
  const handleStart = useCallback(async () => {
    const newValue = !state.controlState.start;
    await writeTag('V_Start', newValue, newValue ? 'System Started' : 'Start Released');
  }, [state.controlState.start, writeTag]);

  const handleStop = useCallback(async () => {
    const newValue = !state.controlState.stop;
    await writeTag('V_Stop', newValue, newValue ? 'System Stopped' : 'Stop Released');
  }, [state.controlState.stop, writeTag]);

  const handleEStop = useCallback(async () => {
    const newValue = !state.controlState.eStop;
    await writeTag('V_E_Stop', newValue, newValue ? '⚠️ Emergency Stop Activated!' : 'Emergency Stop Released');
  }, [state.controlState.eStop, writeTag]);

  // Reset is a hold button - separate start/stop handlers
  const handleResetStart = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    await writeTag('V_Reset', true, 'Reset Engaged');
  }, [writeTag]);

  const handleResetEnd = useCallback(async () => {
    await writeTag('V_Reset', false, 'Reset Released');
  }, [writeTag]);

  const handleCounterResetStart = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    await writeTag('V_Counter_Reset', true, 'Reset Engaged');
  }, [writeTag]);

  const handleCounterResetEnd = useCallback(async () => {
    await writeTag('V_Counter_Reset', false, 'Reset Released');
  }, [writeTag]);

  const handleCounterReset = useCallback(async () => {
    await writeTag('V_Counter_Reset', true, 'Counters Reset');
  }, [writeTag]);

  const handlePneumaticControl = useCallback(async (pneumaticNum: number, extend: boolean) => {
    const tag = `V_P${pneumaticNum}_ON`;
    const action = extend ? 'Extended' : 'Retracted';
    await writeTag(tag, extend, `Pneumatic ${pneumaticNum} ${action}`);
  }, [writeTag]);

  const handleConveyorControl = useCallback(async (conveyorId: string, active: boolean) => {
    const tagMap: Record<string, string> = {
      main: 'V_Main_Conv_ON',
      sc1: 'V_Sub_Conv_1_ON',
      sc2: 'V_Sub_Conv_2_ON',
      sc3: 'V_Sub_Conv_3_ON'
    };
    const labelMap: Record<string, string> = {
      main: 'Main Conveyor',
      sc1: 'Sub Conveyor 1',
      sc2: 'Sub Conveyor 2',
      sc3: 'Sub Conveyor 3'
    };
    const action = active ? 'Started' : 'Stopped';
    await writeTag(tagMap[conveyorId], active, `${labelMap[conveyorId]} ${action}`);
  }, [writeTag]);

  return {
    ...state,
    fetchData,
    handleStart,
    handleStop,
    handleEStop,
    handleResetStart,
    handleResetEnd,
    handleCounterReset,
    handlePneumaticControl,
    handleConveyorControl,
    handleCounterResetStart,
    handleCounterResetEnd,
    writeTag,
  };
}
