import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  StudySession, 
  FocusEntry, 
  BreakEntry, 
  StartSessionDto, 
  EndSessionDto, 
  AddFocusEntryDto, 
  AddBreakEntryDto, 
  AnalyzeImageDto,
  ReportMetrics,
  StudyStatus,
  BreakType 
} from '../types/api';
import { sessionApi } from '../services/api';
import { useAuth } from './AuthContext';

interface SessionContextType {
  // 当前会话状态
  currentSession: StudySession | null;
  isSessionActive: boolean;
  currentStatus: StudyStatus;
  isLoading: boolean;
  error: string | null;
  
  // 会话历史和报告
  sessionHistory: StudySession[];
  reportMetrics: ReportMetrics | null;
  
  // 会话管理方法
  startSession: (data: StartSessionDto) => Promise<boolean>;
  endSession: (data: EndSessionDto) => Promise<boolean>;
  addFocusEntry: (data: AddFocusEntryDto) => Promise<boolean>;
  addBreakEntry: (data: AddBreakEntryDto) => Promise<boolean>;
  analyzeImage: (data: AnalyzeImageDto) => Promise<boolean>;
  
  // 数据获取方法
  refreshCurrentSession: () => Promise<void>;
  refreshSessionHistory: () => Promise<void>;
  refreshReport: () => Promise<void>;
  
  // 清除错误
  clearError: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StudyStatus>(StudyStatus.IDLE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<StudySession[]>([]);
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(null);

  // 当用户登录时，自动获取当前会话
  useEffect(() => {
    if (user) {
      refreshCurrentSession();
      refreshSessionHistory();
      refreshReport();
    } else {
      // 用户登出时清空状态
      setCurrentSession(null);
      setIsSessionActive(false);
      setCurrentStatus(StudyStatus.IDLE);
      setSessionHistory([]);
      setReportMetrics(null);
    }
  }, [user]);

  // 刷新当前会话
  const refreshCurrentSession = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sessionApi.getCurrentSession(user._id);
      setCurrentSession(response.session);
      setIsSessionActive(response.isActive);
      setCurrentStatus(response.currentStatus);
    } catch (error: any) {
      // 如果没有当前会话，这是正常的
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || '获取当前会话失败');
      }
      setCurrentSession(null);
      setIsSessionActive(false);
      setCurrentStatus(StudyStatus.IDLE);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新会话历史
  const refreshSessionHistory = async () => {
    if (!user) return;
    
    try {
      const response = await sessionApi.getSessionHistory(user._id);
      setSessionHistory(response.sessions);
    } catch (error: any) {
      console.error('Failed to fetch session history:', error);
    }
  };

  // 刷新学习报告
  const refreshReport = async () => {
    if (!user) return;
    
    try {
      const response = await sessionApi.getReport(user._id);
      setReportMetrics(response.metrics);
    } catch (error: any) {
      console.error('Failed to fetch report:', error);
    }
  };

  // 开始学习会话
  const startSession = async (data: StartSessionDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionApi.startSession(user._id, data);
      await refreshCurrentSession();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '开始学习会话失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 结束学习会话
  const endSession = async (data: EndSessionDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionApi.endSession(user._id, data);
      await refreshCurrentSession();
      await refreshSessionHistory();
      await refreshReport();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '结束学习会话失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 添加专注记录
  const addFocusEntry = async (data: AddFocusEntryDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionApi.addFocusEntry(user._id, data);
      await refreshCurrentSession();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '添加专注记录失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 添加休息记录
  const addBreakEntry = async (data: AddBreakEntryDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionApi.addBreakEntry(user._id, data);
      await refreshCurrentSession();
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '添加休息记录失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 分析图像
  const analyzeImage = async (data: AnalyzeImageDto): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionApi.analyzeImage(user._id, data);
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || '图像分析失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  const value: SessionContextType = {
    currentSession,
    isSessionActive,
    currentStatus,
    isLoading,
    error,
    sessionHistory,
    reportMetrics,
    startSession,
    endSession,
    addFocusEntry,
    addBreakEntry,
    analyzeImage,
    refreshCurrentSession,
    refreshSessionHistory,
    refreshReport,
    clearError,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};