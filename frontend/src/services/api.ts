import axios from 'axios';
import {
  CreateUserDto,
  SetParentalCodeDto,
  VerifyParentalCodeDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  SubscribeDto,
  StartSessionDto,
  EndSessionDto,
  AddFocusEntryDto,
  AddBreakEntryDto,
  AnalyzeImageDto,
  ApiResponse,
  UserStatusResponse,
  CurrentSessionResponse,
  SessionHistoryResponse,
  ReportResponse,
} from '../types/api';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// 认证相关API
export const authApi = {
  // 注册
  register: (data: CreateUserDto): Promise<ApiResponse> => 
    api.post('/auth/register', data),

  // 登录
  login: (data: CreateUserDto): Promise<ApiResponse> => 
    api.post('/auth/login', data),

  // 设置家长密码
  setParentalCode: (userId: string, data: SetParentalCodeDto): Promise<ApiResponse> => 
    api.post(`/auth/${userId}/parental-code`, data),

  // 验证家长密码
  verifyParentalCode: (userId: string, data: VerifyParentalCodeDto): Promise<ApiResponse> => 
    api.post(`/auth/${userId}/verify-parental-code`, data),

  // 更新孩子档案
  updateProfile: (userId: string, data: UpdateProfileDto): Promise<ApiResponse> => 
    api.put(`/auth/${userId}/profile`, data),

  // 更新学习设置
  updateSettings: (userId: string, data: UpdateSettingsDto): Promise<ApiResponse> => 
    api.put(`/auth/${userId}/settings`, data),

  // 订阅
  subscribe: (userId: string, data: SubscribeDto): Promise<ApiResponse> => 
    api.post(`/auth/${userId}/subscribe`, data),

  // 获取用户状态
  getUserStatus: (userId: string): Promise<UserStatusResponse> => 
    api.get(`/auth/${userId}/status`),
};

// 学习会话相关API
export const sessionApi = {
  // 开始学习会话
  startSession: (userId: string, data: StartSessionDto): Promise<ApiResponse> => 
    api.post(`/session/${userId}/start`, data),

  // 结束学习会话
  endSession: (userId: string, data: EndSessionDto): Promise<ApiResponse> => 
    api.post(`/session/${userId}/end`, data),

  // 添加专注记录
  addFocusEntry: (userId: string, data: AddFocusEntryDto): Promise<ApiResponse> => 
    api.post(`/session/${userId}/focus`, data),

  // 添加休息记录
  addBreakEntry: (userId: string, data: AddBreakEntryDto): Promise<ApiResponse> => 
    api.post(`/session/${userId}/break`, data),

  // 分析图像
  analyzeImage: (userId: string, data: AnalyzeImageDto): Promise<ApiResponse> => 
    api.post(`/session/${userId}/analyze`, data),

  // 获取当前会话
  getCurrentSession: (userId: string): Promise<CurrentSessionResponse> => 
    api.get(`/session/${userId}/current`),

  // 获取会话历史
  getSessionHistory: (userId: string): Promise<SessionHistoryResponse> => 
    api.get(`/session/${userId}/history`),

  // 获取学习报告
  getReport: (userId: string): Promise<ReportResponse> => 
    api.get(`/session/${userId}/report`),
};

export default api;