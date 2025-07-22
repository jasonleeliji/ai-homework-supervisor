
import React, { forwardRef, useCallback } from 'react';
import { StudyStatus, BreakType, TokenUsage, AnalysisResult, AppSettings } from '../types';
import Camera, { CameraHandle } from './Camera';
import { ClockIcon, SparklesIcon, CpuChipIcon, UserIcon, InformationCircleIcon, PauseIcon, PlayIcon, StopIcon, ArrowPathIcon } from './Icons';

interface SupervisionViewProps {
  status: StudyStatus;
  timer: number;
  isLoading: boolean;
  error: string | null;
  lastAnalysis: AnalysisResult | null;
  lastTokenUsage: TokenUsage | null;
  totalTokens: TokenUsage;
  settings: AppSettings;
  captureFrameRef: React.Ref<CameraHandle>;
  onStart: () => void;
  onStop: () => void;
  onBreak: (type: BreakType) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const StatusIndicator: React.FC<{ status: StudyStatus }> = ({ status }) => {
    let bgColor = 'bg-gray-400';
    let text = '空闲';
    switch (status) {
        case StudyStatus.Studying: bgColor = 'bg-green-500'; text = '正在学习'; break;
        case StudyStatus.Break: bgColor = 'bg-yellow-500'; text = '正在休息'; break;
        case StudyStatus.Finished: bgColor = 'bg-blue-500'; text = '今日已完成'; break;
        case StudyStatus.Idle: bgColor = 'bg-gray-400'; text = '准备开始'; break;
        case StudyStatus.Paused: bgColor = 'bg-orange-500'; text = '已暂停'; break;
    }
    return (
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${bgColor} animate-pulse`}></span>
            <span className="font-medium">{text}</span>
        </div>
    );
};

const SupervisionView: React.FC<SupervisionViewProps> = (props) => {
  const { status, timer, isLoading, error, lastAnalysis, lastTokenUsage, totalTokens, settings, captureFrameRef, onStart, onStop, onBreak } = props;

  const handleCameraError = useCallback((err: string) => {
      // This is a placeholder; The main error state is managed in App.tsx
      console.error(err);
  }, []);
  
  const isSessionActive = status === StudyStatus.Studying || status === StudyStatus.Break;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Camera ref={captureFrameRef} onCameraError={handleCameraError} />
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-lg flex items-center gap-2"><SparklesIcon /> AI 助手说：</h3>
            {isLoading ? (
                <p className="italic text-slate-500 dark:text-slate-400">正在分析中...</p>
            ) : lastAnalysis ? (
                <p className={`text-base ${lastAnalysis.isFocused && lastAnalysis.isOnSeat ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {lastAnalysis.reminder}
                </p>
            ) : (
                <p className="italic text-slate-500 dark:text-slate-400">准备就绪，开始学习后将进行分析。</p>
            )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
            <h3 className="font-bold mb-3 text-lg">状态面板</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><InformationCircleIcon/>状态</span> <StatusIndicator status={status} /></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><ClockIcon/>计时器</span> <span className="font-mono text-base">{formatTime(timer)}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><UserIcon/>昵称</span> <span>{settings.nickname}</span></div>
            </div>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
          <h3 className="font-bold mb-3 text-lg">控制面板</h3>
          <div className="space-y-3">
             {status === StudyStatus.Idle || status === StudyStatus.Finished ? (
                 <button onClick={onStart} disabled={isLoading || status === StudyStatus.Finished} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300">
                    <PlayIcon/> 开始学习
                 </button>
             ) : (
                <button onClick={onStop} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300">
                    <StopIcon/> 结束本次学习
                </button>
             )}
             
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onBreak(BreakType.Stretch)} disabled={!isSessionActive} className="text-xs sm:text-sm p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 transition">伸懒腰</button>
                <button onClick={() => onBreak(BreakType.Water)} disabled={!isSessionActive} className="text-xs sm:text-sm p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 transition">喝水</button>
                <button onClick={() => onBreak(BreakType.Restroom)} disabled={!isSessionActive} className="text-xs sm:text-sm p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 transition">上厕所</button>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
          <h3 className="font-bold mb-3 text-lg flex items-center gap-2"><CpuChipIcon/> Token 消耗</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>上次消耗:</span> <span className="font-mono">{lastTokenUsage ? `${lastTokenUsage.total} (I:${lastTokenUsage.input} O:${lastTokenUsage.output})` : 'N/A'}</span></div>
            <div className="flex justify-between font-semibold"><span>累计消耗:</span> <span className="font-mono">{totalTokens.total} (I:{totalTokens.input} O:{totalTokens.output})</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisionView;