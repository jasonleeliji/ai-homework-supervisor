// 与后端API匹配的类型定义

// 枚举类型
export enum SubscriptionPlan {
  NONE = 'none',
  STANDARD = 'standard',
  PRO = 'pro',
}

export enum Gender {
  BOY = 'boy',
  GIRL = 'girl',
}

export enum BreakType {
  STRETCH = 'stretch',
  WATER = 'water',
  RESTROOM = 'restroom',
  FORCED = 'forced',
}

export enum StudyStatus {
  IDLE = 'idle',
  STUDYING = 'studying',
  BREAK = 'break',
}

// 用户相关类型
export interface User {
  _id: string;
  phone: string;
  parentalCode?: string;
  plan: SubscriptionPlan;
  trialEndDate?: string;
  subscriptionEndDate?: string;
  nickname: string;
  age: number;
  grade: string;
  gender: Gender;
  minSessionDuration: number;
  dailyTimeLimit: number;
  stretchBreak: number;
  waterBreak: number;
  restroomBreak: number;
  forcedBreakDuration: number;
  workDurationBeforeForcedBreak: number;
  waterBreakLimit: number;
  restroomBreakLimit: number;
  voiceRemindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTO类型
export interface CreateUserDto {
  phone: string;
  code: string;
}

export interface SetParentalCodeDto {
  parentalCode: string;
}

export interface VerifyParentalCodeDto {
  parentalCode: string;
}

export interface UpdateProfileDto {
  nickname?: string;
  age?: number;
  grade?: string;
  gender?: Gender;
}

export interface UpdateSettingsDto {
  minSessionDuration?: number;
  dailyTimeLimit?: number;
  stretchBreak?: number;
  waterBreak?: number;
  restroomBreak?: number;
  forcedBreakDuration?: number;
  workDurationBeforeForcedBreak?: number;
  waterBreakLimit?: number;
  restroomBreakLimit?: number;
  voiceRemindersEnabled?: boolean;
}

export interface SubscribeDto {
  plan: SubscriptionPlan;
}

export interface StartSessionDto {
  // 空对象，系统自动生成
}

export interface EndSessionDto {
  endTime: number;
}

export interface AddFocusEntryDto {
  timestamp: number;
  isFocused: number; // 0 或 1
  isOnSeat: number; // 0 或 1
}

export interface AddBreakEntryDto {
  startTime: number;
  endTime: number;
  type: BreakType;
}

export interface AnalyzeImageDto {
  imageBase64: string;
}

// 学习会话相关类型
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
  _id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  focusHistory: FocusEntry[];
  breakHistory: BreakEntry[];
  totalTokensUsed: number;
  totalDuration: number;
  focusRate: number;
  createdAt: string;
  updatedAt: string;
}

// 报告指标类型
export interface ReportMetrics {
  totalStudyTime: number;
  averageFocusRate: number;
  totalSessions: number;
  totalBreaks: number;
  totalTokenUsage: number;
  dailyBreakdown: Array<{
    date: string;
    studyTime: number;
    focusRate: number;
    sessions: number;
    breaks: number;
    tokenUsage: number;
  }>;
}

// API响应类型
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  user?: User;
  session?: any;
  sessions?: StudySession[];
  report?: any;
  todayStudyTime?: number;
  isTrialActive?: boolean;
  hasActiveSubscription?: boolean;
  planName?: string;
  effectiveDailyLimit?: number;
}

// 用户状态响应
export interface UserStatusResponse extends ApiResponse {
  user: User;
  todayStudyTime: number;
  isTrialActive: boolean;
  hasActiveSubscription: boolean;
  planName: string;
  effectiveDailyLimit: number;
}

// 当前会话响应
export interface CurrentSessionResponse extends ApiResponse {
  session: {
    id: string;
    startTime: number;
    duration: number;
    focusHistory: FocusEntry[];
    breakHistory: BreakEntry[];
    tokenUsage: number;
  };
}

// 会话历史响应
export interface SessionHistoryResponse extends ApiResponse {
  sessions: Array<{
    id: string;
    startTime: number;
    endTime: number;
    duration: number;
    focusHistory: FocusEntry[];
    breakHistory: BreakEntry[];
    tokenUsage: number;
  }>;
}

// 报告响应
export interface ReportResponse extends ApiResponse {
  report: ReportMetrics;
}