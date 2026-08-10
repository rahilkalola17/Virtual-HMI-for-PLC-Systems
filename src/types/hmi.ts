/*
 * File: src/types/hmi.ts
 * Purpose: TypeScript interfaces and types for the HMI application domain.
 * Defines the shape of API payloads, UI statistics, pneumatics/conveyors
 * state and control state. Documentation-only change.
 */
export type SystemStatus = 'standby' | 'running' | 'stopped' | 'emergency';

export interface ConveyorSpeeds {
  main: number;
  sc1: number;
  sc2: number;
  sc3: number;
}

export interface ModuleMetric {
  length: number;
  width: number;
  height: number;
  volume: number;
}

export interface ModuleMetrics {
  m1: ModuleMetric;
  m2: ModuleMetric;
  m3: ModuleMetric;
}

export interface ApiData {
  V_Counter_Reset: boolean;
  V_Start: boolean;
  V_Stop: boolean;
  V_E_Stop: boolean;
  V_Reset: boolean;

  V_num_1: number;
  V_num_2: number;
  V_num_3: number;
  V_Module_Total: number;

  V_S1_percent: number;
  V_S2_percent: number;
  V_S3_percent: number;

  V_P1_ON: boolean;
  V_P2_ON: boolean;
  V_P3_ON: boolean;

  V_Main_Conv_ON: boolean;
  V_Sub_Conv_1_ON: boolean;
  V_Sub_Conv_2_ON: boolean;
  V_Sub_Conv_3_ON: boolean;

  V_Module_1: boolean;
  V_Module_2: boolean;
  V_Module_3: boolean;

  // Existing (keep for backward compat if your backend still sends it)
  V_Speed_Input: number;

  // NEW: conveyor speeds (tags used in SettingsPage)
  V_Conv_Main_Speed: number;
  V_Conv_1_Speed: number;
  V_Conv_2_Speed: number;
  V_Conv_3_Speed: number;

  // NEW: module measurements/volume (tags used in SettingsPage)
  V_M1_Length: number;
  V_M1_Width: number;
  V_M1_Height: number;
  V_M1_Volume: number;

  V_M2_Length: number;
  V_M2_Width: number;
  V_M2_Height: number;
  V_M2_Volume: number;

  V_M3_Length: number;
  V_M3_Width: number;
  V_M3_Height: number;
  V_M3_Volume: number;

  // NEW: volume sorting switch
  V_Volume_Switch: boolean;

  V_Pnematic_Pressure: number;

  V_Fault_Conv_Main: boolean;
  V_Fault_Sub_Conv_1: boolean;
  V_Fault_Sub_Conv_2: boolean;
  V_Fault_Sub_Conv_3: boolean;

  V_Fault_P1_Back: boolean;
  V_Fault_P1_Front: boolean;
  V_Fault_P2_Back: boolean;
  V_Fault_P2_Front: boolean;
  V_Fault_P3_Back: boolean;
  V_Fault_P3_Front: boolean;
}

export interface StatsData {
  module1: { count: number; percentage: number };
  module2: { count: number; percentage: number };
  module3: { count: number; percentage: number };
  total: number;
}

export interface PneumaticsState {
  p1: { status: 'extended' | 'retracted' };
  p2: { status: 'extended' | 'retracted' };
  p3: { status: 'extended' | 'retracted' };
}

export interface ConveyorsState {
  main: { active: boolean };
  sc1: { active: boolean };
  sc2: { active: boolean };
  sc3: { active: boolean };
}

export interface ErrorsState {
  p1FaultBack: boolean;
  p1FaultFront: boolean;
  p2FaultBack: boolean;
  p2FaultFront: boolean;
  p3FaultBack: boolean;
  p3FaultFront: boolean;
  mainConv: boolean;
  subCon1: boolean;
  subCon2: boolean;
  subCon3: boolean;
}

export interface ControlState {
  start: boolean;
  stop: boolean;
  eStop: boolean;
}
