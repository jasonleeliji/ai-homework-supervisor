import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CreateUserDto, SetParentalCodeDto, VerifyParentalCodeDto, UpdateProfileDto, UpdateSettingsDto, SubscribeDto } from '../types/api';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  todayStudyTime: number;
  isTrialActive: boolean;
  hasActiveSubscription: boolean;
  planName: string;
  effectiveDailyLimit: number;
  
  // 认证方法
  register: (data: CreateUserDto) => Promise<boolean>;
  login: (data: CreateUserDto) => Promise<boolean>;
  logout: () => void;
  
  // 用户管理方法
  setParentalCode: (data: SetParentalCodeDto) => Promise<boolean>;
  verifyParentalCode: (data: VerifyParentalCodeDto) => Promise<boolean>;
  updateProfile: (data: UpdateProfileDto) => Promise<boolean>;
  updateSettings: (data: UpdateSettingsDto) => Promise<boolean>;
  subscribe: (data: SubscribeDto) => Promise<boolean>;
  
  // 刷新用户状态
  refreshUserStatus: () => Promise<void>;
  
  // 清除错误
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [planName, setPlanName] = useState('');
  const [effectiveDailyLimit, setEffectiveDailyLimit] = useState(0);

  // 从localStorage加载用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // 自动刷新用户状态
        refreshUserStatus(userData._id);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 刷新用户状态
  const refreshUserStatus = async (userId?: string) => {
    if (!userId && !user) return;
    
    const targetUserId = userId || user!._id;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.getUserStatus(targetUserId);
      setUser(response.user);
      setTodayStudyTime(response.todayStudyTime);
      setIsTrialActive(response.isTrialActive);
      setHasActiveSubscription(response.hasActiveSubscription);
      setPlanName(response.planName);
      setEffectiveDailyLimit(response.effectiveDailyLimit);
      
      // 保存到localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      setError(error.response?.data?.message || '获取用户状态失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const register = async (data: CreateUserDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(data);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        await refreshUserStatus(response.user._id);
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.response?.data?.message || '注册失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (data: CreateUserDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(data);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        await refreshUserStatus(response.user._id);
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.response?.data?.message || '登录失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = () => {
    setUser(null);
    setTodayStudyTime(0);
    setIsTrialActive(false);
    setHasActiveSubscription(false);
    setPlanName('');
    setEffectiveDailyLimit(0);
    setError(null);
    localStorage.removeItem('user');
  };

  // 设置家长密码
  const setParentalCode = async (data: SetParentalCodeDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.setParentalCode(user._id, data);
      await refreshUserStatus();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '设置家长密码失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 验证家长密码
  const verifyParentalCode = async (data: VerifyParentalCodeDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.verifyParentalCode(user._id, data);
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '家长密码验证失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 更新孩子档案
  const updateProfile = async (data: UpdateProfileDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.updateProfile(user._id, data);
      await refreshUserStatus();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '更新档案失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 更新学习设置
  const updateSettings = async (data: UpdateSettingsDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.updateSettings(user._id, data);
      await refreshUserStatus();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '更新设置失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 订阅
  const subscribe = async (data: SubscribeDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.subscribe(user._id, data);
      await refreshUserStatus();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '订阅失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    todayStudyTime,
    isTrialActive,
    hasActiveSubscription,
    planName,
    effectiveDailyLimit,
    register,
    login,
    logout,
    setParentalCode,
    verifyParentalCode,
    updateProfile,
    updateSettings,
    subscribe,
    refreshUserStatus: () => refreshUserStatus(),
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};