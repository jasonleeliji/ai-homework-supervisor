export type SubscriptionPlan = 'none' | 'standard' | 'pro';

export interface User {
  phone: string;
  plan: SubscriptionPlan;
  trialEndDate?: number;
  subscriptionEndDate?: number;
}

export interface ChildProfile {
  nickname: string;
  age: number;
  grade: string;
  gender: 'boy' | 'girl';
}

export interface AppSettings extends ChildProfile {
  minSessionDuration: number; // in minutes
  dailyTimeLimit: number; // in hours, now serves as a fallback or for non-subscribed states
  stretchBreak: number; // in minutes
  waterBreak: number; // in minutes
  restroomBreak: number; // in minutes
  forcedBreakDuration: number; // in minutes
  workDurationBeforeForcedBreak: number; // in minutes
  waterBreakLimit: number; // per hour
  restroomBreakLimit: number; // per hour
}

export enum StudyStatus {
  Idle = 'IDLE',
  Studying = 'STUDYING',
  Paused = 'PAUSED',
  Break = 'BREAK',
  Finished = 'FINISHED',
}

export enum BreakType {
  Stretch = 'STRETCH',
  Water = 'WATER',
  Restroom = 'RESTROOM',
  Forced = 'FORCED',
}

export interface FocusEntry {
  timestamp: number;
  isFocused: boolean;
  isOnSeat: boolean;
}

export interface BreakEntry {
  startTime: number;
  endTime: number;
  type: BreakType;
}

export interface StudySession {
  startTime: number;
  endTime: number | null;
  focusHistory: FocusEntry[];
  breakHistory: BreakEntry[];
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface AnalysisResult {
  isFocused: boolean;
  isOnSeat: boolean;
  reminder: string;
}

export interface ReportMetrics {
  totalStudyTime: number; // in seconds
  focusedTime: number; // in seconds
  focusRate: number;
  totalBreakTime: number; // in seconds
  breakTimePercentage: number;
  breakCount: number;
  medianBreakInterval: number; // in seconds
}