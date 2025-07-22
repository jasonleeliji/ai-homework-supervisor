
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, StudyStatus, BreakType, StudySession, TokenUsage, AnalysisResult, FocusEntry, BreakEntry, SubscriptionPlan } from './types';
import { DEFAULT_SETTINGS, CAPTURE_INTERVAL } from './constants';
import { analyzeImage } from './services/geminiService';
import SupervisionView from './components/SupervisionView';
import SettingsView from './components/SettingsView';
import ReportView from './components/ReportView';
import SubscriptionView from './components/SubscriptionView';
import AuthView from './components/AuthView';
import { useSpeech } from './hooks/useSpeech';
import { useAuth } from './contexts/AuthContext';
import { CameraHandle } from './components/Camera';
import { LogoutIcon } from './components/Icons';

type View = 'supervision' | 'settings' | 'report' | 'subscription';

const loadState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) { console.error(`Error loading state for key "${key}"`, error); }
  return defaultValue;
};

const saveState = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) { console.error(`Error saving state for key "${key}"`, error); }
};

const AppContent: React.FC = () => {
  const { user, logout, isTrialActive, hasActiveSubscription, planName, effectiveDailyLimit } = useAuth();
  const userPhone = user?.phone || 'default';

  const [settings, setSettings] = useState<AppSettings>(() => loadState(`appSettings_${userPhone}`, DEFAULT_SETTINGS));
  const [allSessions, setAllSessions] = useState<StudySession[]>(() => loadState(`studySessions_${userPhone}`, []));
  const [totalTokens, setTotalTokens] = useState<TokenUsage>(() => loadState(`totalTokens_${userPhone}`, { input: 0, output: 0, total: 0 }));

  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [status, setStatus] = useState<StudyStatus>(StudyStatus.Idle);
  const [view, setView] = useState<View>('supervision');
  
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [lastTokenUsage, setLastTokenUsage] = useState<TokenUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [timer, setTimer] = useState(0);
  const [studyTimer, setStudyTimer] = useState(0);

  const { speak } = useSpeech();
  const captureFrameRef = useRef<CameraHandle>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => saveState(`appSettings_${userPhone}`, settings), [settings, userPhone]);
  useEffect(() => saveState(`studySessions_${userPhone}`, allSessions), [allSessions, userPhone]);
  useEffect(() => saveState(`totalTokens_${userPhone}`, totalTokens), [totalTokens, userPhone]);
  
  const getTodaysStudyTime = useCallback(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    // Per requirement, daily limit now includes break times.
    return allSessions
      .filter(s => s.startTime >= today && s.endTime)
      .reduce((total, s) => total + (s.endTime! - s.startTime), 0) / 1000;
  }, [allSessions]);
  
  const handleAnalysis = useCallback(async () => {
    if (!captureFrameRef.current) return;
    const base64Image = captureFrameRef.current.captureFrame();
    if (!base64Image) { setError('无法捕获摄像头画面。'); return; }
    setError(null);
    setIsLoading(true);

    try {
      const { analysis, usage } = await analyzeImage(base64Image, settings);
      setLastAnalysis(analysis);
      setLastTokenUsage(usage);
      setTotalTokens(prev => ({ input: prev.input + usage.input, output: prev.output + usage.output, total: prev.total + usage.total }));

      setCurrentSession(prev => {
        if (!prev) return null;
        const newFocusEntry: FocusEntry = { timestamp: Date.now(), isFocused: analysis.isFocused, isOnSeat: analysis.isOnSeat };
        return { ...prev, focusHistory: [...prev.focusHistory, newFocusEntry] };
      });

      if (!analysis.isFocused || !analysis.isOnSeat) speak(analysis.reminder);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发生未知错误。';
      setError(`AI分析失败: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [settings, speak]);

  const stopSupervision = useCallback((endStatus: StudyStatus = StudyStatus.Idle) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;
    setStatus(endStatus);
    setTimer(0);
    setStudyTimer(0);
    if (currentSession) {
        const finalSession = { ...currentSession, endTime: Date.now() };
        if ((finalSession.endTime - finalSession.startTime) / 1000 / 60 >= settings.minSessionDuration) {
             setAllSessions(prev => [...prev, finalSession]);
        }
        setCurrentSession(null);
    }
  }, [currentSession, settings.minSessionDuration]);

  const startSupervision = useCallback(() => {
    if (!isTrialActive && !hasActiveSubscription) {
      setError('您的试用已结束或未订阅。请前往订阅页面购买计划。');
      speak('请先订阅一个计划才能开始哦。');
      setView('subscription');
      return;
    }

    const todaysTime = getTodaysStudyTime();
    if (todaysTime / 3600 >= effectiveDailyLimit) {
      setError(`今天已经学习满${effectiveDailyLimit}小时，请好好休息！`);
      speak(`今天已经学习满${effectiveDailyLimit}小时，要劳逸结合哦！`);
      setStatus(StudyStatus.Finished);
      return;
    }
    
    setStatus(StudyStatus.Studying);
    setCurrentSession({ startTime: Date.now(), endTime: null, focusHistory: [], breakHistory: [] });
    setLastAnalysis(null);
    setLastTokenUsage(null);
    setError(null);
    speak(`${settings.nickname}，我们要开始学习咯，加油！`);

    setTimeout(() => handleAnalysis(), 1000); 
    intervalRef.current = setInterval(() => handleAnalysis(), CAPTURE_INTERVAL * 1000);

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
      setStudyTimer(prev => {
          const newStudyTime = prev + 1;
          if (newStudyTime >= settings.workDurationBeforeForcedBreak * 60) {
              startBreak(BreakType.Forced);
              return 0;
          }
          return newStudyTime;
      });
    }, 1000);
  }, [getTodaysStudyTime, settings, speak, handleAnalysis, isTrialActive, hasActiveSubscription, effectiveDailyLimit]);

  const startBreak = useCallback((type: BreakType) => {
    if (!currentSession) return;
    
    // Check break limits per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (type === BreakType.Water || type === BreakType.Restroom) {
      const limit = type === BreakType.Water ? settings.waterBreakLimit : settings.restroomBreakLimit;
      const recentBreaks = currentSession.breakHistory.filter(b => b.type === type && b.startTime > oneHourAgo).length;
      if (recentBreaks >= limit) {
        const breakName = type === BreakType.Water ? '喝水' : '上厕所';
        setError(`每小时${breakName}次数已达上限(${limit}次)。`);
        speak(`休息太频繁咯，我们再坚持一下吧！`);
        return;
      }
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;

    let breakDuration = 0, breakMessage = '';
    switch (type) {
      case BreakType.Stretch: breakDuration = settings.stretchBreak * 60; breakMessage = `好了，我们伸个懒腰，活动一下吧！你有${settings.stretchBreak}分钟。`; break;
      case BreakType.Water: breakDuration = settings.waterBreak * 60; breakMessage = `去喝点水吧，补充水分很重要哦！你有${settings.waterBreak}分钟。`; break;
      case BreakType.Restroom: breakDuration = settings.restroomBreak * 60; breakMessage = `需要去一下洗手间吗？快去快回哦！你有${settings.restroomBreak}分钟。`; break;
      case BreakType.Forced: breakDuration = settings.forcedBreakDuration * 60; breakMessage = `${settings.nickname}，你已经连续学习${settings.workDurationBeforeForcedBreak}分钟了，非常棒！现在让我们强制休息${settings.forcedBreakDuration}分钟。`; break;
    }
    
    speak(breakMessage);
    setStatus(StudyStatus.Break);
    setTimer(breakDuration);
    setStudyTimer(0);
    const breakStart = Date.now();
    
    timerRef.current = setInterval(() => {
        setTimer(prev => {
            if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                const breakEnd = Date.now();
                setCurrentSession(prevSession => {
                  if (!prevSession) return null;
                  const newBreakEntry: BreakEntry = { startTime: breakStart, endTime: breakEnd, type };
                  return { ...prevSession, breakHistory: [...prevSession.breakHistory, newBreakEntry]};
                });
                startSupervision();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  }, [settings, speak, startSupervision, currentSession]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setView('supervision');
    speak('设置已保存！');
  };

  const renderView = () => {
    switch (view) {
      case 'settings': return <SettingsView settings={settings} onSave={handleSaveSettings} onCancel={() => setView('supervision')} />;
      case 'report': return <ReportView allSessions={allSessions} onBack={() => setView('supervision')} />;
      case 'subscription': return <SubscriptionView onBack={() => setView('supervision')} />;
      case 'supervision':
      default:
        return (
          <SupervisionView
            status={status}
            timer={timer}
            isLoading={isLoading}
            error={error}
            lastAnalysis={lastAnalysis}
            lastTokenUsage={lastTokenUsage}
            totalTokens={totalTokens}
            settings={settings}
            captureFrameRef={captureFrameRef}
            onStart={startSupervision}
            onStop={() => stopSupervision()}
            onBreak={startBreak}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">AI 作业监督员</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">{planName}</span>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setView('supervision')} className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors ${view === 'supervision' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600'}`}>监督</button>
            <button onClick={() => setView('report')} className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors ${view === 'report' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600'}`}>报告</button>
            <button onClick={() => setView('subscription')} className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors ${view === 'subscription' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600'}`}>订阅</button>
            <button onClick={() => setView('settings')} className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors ${view === 'settings' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600'}`}>设置</button>
          </nav>
          <button onClick={logout} title="退出登录" className="p-2 rounded-full bg-white dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"><LogoutIcon/></button>
        </div>
      </header>
      <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6">{renderView()}</main>
    </div>
  );
};

const App: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            {isAuthenticated ? <AppContent /> : <AuthView />}
             <footer className="mt-8 text-center text-xs text-slate-400">
                <p>请确保在光线充足、环境安静的地方使用本系统。家长应在附近陪同。</p>
                <p>&copy; {new Date().getFullYear()} AI Homework Supervisor. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default App;