import { AppSettings } from './types';

export type Plan = 'standard' | 'pro';

export const PLAN_DETAILS: Record<Plan, { name: string; price: number; dailyTimeLimit: number }> = {
  standard: {
    name: '标准版',
    price: 19.9,
    dailyTimeLimit: 3,
  },
  pro: {
    name: '专业版',
    price: 29.9,
    dailyTimeLimit: 5,
  },
};

export const CAPTURE_INTERVAL = 20; // 20 seconds for all subscribers

export const DEFAULT_SETTINGS: AppSettings = {
  nickname: '宝贝',
  age: 8,
  grade: '小学二年级',
  gender: 'boy',
  minSessionDuration: 5,
  dailyTimeLimit: 3, // Default for trial period
  stretchBreak: 5,
  waterBreak: 2,
  restroomBreak: 5,
  workDurationBeforeForcedBreak: 45,
  forcedBreakDuration: 10,
  waterBreakLimit: 4, // default 4 times per hour
  restroomBreakLimit: 2, // default 2 times per hour
};

export const AI_MODEL = 'gemini-2.5-flash';