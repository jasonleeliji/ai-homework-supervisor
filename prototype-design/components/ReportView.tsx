import React, { useMemo } from 'react';
import { StudySession, ReportMetrics } from '../types';
import { CAPTURE_INTERVAL } from '../constants';

interface ReportViewProps {
  allSessions: StudySession[];
  onBack: () => void;
}

const calculateMetrics = (sessions: StudySession[]): ReportMetrics => {
  if (sessions.length === 0) {
    return { totalStudyTime: 0, focusedTime: 0, focusRate: 0, totalBreakTime: 0, breakTimePercentage: 0, breakCount: 0, medianBreakInterval: 0 };
  }

  let totalStudyTime = 0;
  let focusedTime = 0;
  let totalBreakTime = 0;
  let breakCount = 0;
  const studyIntervals: number[] = [];

  sessions.forEach(session => {
    if(!session.endTime) return;
    
    // Calculate total study time and break time
    const sessionDuration = (session.endTime - session.startTime) / 1000;
    const sessionBreakTime = session.breakHistory.reduce((acc, br) => acc + (br.endTime - br.startTime) / 1000, 0);
    totalStudyTime += (sessionDuration - sessionBreakTime);
    totalBreakTime += sessionBreakTime;
    breakCount += session.breakHistory.length;

    // Calculate focused time
    focusedTime += session.focusHistory.filter(f => f.isFocused).length * CAPTURE_INTERVAL;

    // Calculate study intervals for median calculation
    let lastEventTime = session.startTime;
    session.breakHistory.forEach(br => {
        studyIntervals.push((br.startTime - lastEventTime) / 1000);
        lastEventTime = br.endTime;
    });
    studyIntervals.push((session.endTime - lastEventTime) / 1000);
  });
  
  const focusRate = totalStudyTime > 0 ? (focusedTime / totalStudyTime) * 100 : 0;
  const grandTotalTime = totalStudyTime + totalBreakTime;
  const breakTimePercentage = grandTotalTime > 0 ? (totalBreakTime / grandTotalTime) * 100 : 0;

  // Calculate median break interval
  let medianBreakInterval = 0;
  if(studyIntervals.length > 0){
    const sortedIntervals = [...studyIntervals].sort((a,b) => a-b);
    const mid = Math.floor(sortedIntervals.length / 2);
    medianBreakInterval = sortedIntervals.length % 2 !== 0 ? sortedIntervals[mid] : (sortedIntervals[mid-1] + sortedIntervals[mid]) / 2;
  }

  return {
    totalStudyTime,
    focusedTime,
    focusRate: Math.min(100, focusRate), // Cap at 100
    totalBreakTime,
    breakTimePercentage,
    breakCount,
    medianBreakInterval
  };
};

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let result = '';
    if(h > 0) result += `${h}时`;
    if(m > 0) result += `${m}分`;
    if(h === 0 && m === 0 && s > 0) result += `${s}秒`;
    if (result === '') return '0分';
    return result;
};


const ReportCard: React.FC<{ title: string; value: string; subtext?: string; children?: React.ReactNode }> = ({ title, value, subtext, children }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col justify-between">
        <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
            {subtext && <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>}
        </div>
        {children && <div className="mt-2">{children}</div>}
    </div>
);

const ProgressBar: React.FC<{ value: number, colorClass: string }> = ({ value, colorClass }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}></div>
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ allSessions, onBack }) => {
    
    const reports = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))).setHours(0,0,0,0); // Monday as start of week

        const recentSession = allSessions.length > 0 ? [allSessions[allSessions.length-1]] : [];
        const todaySessions = allSessions.filter(s => s.startTime >= startOfToday);
        const weekSessions = allSessions.filter(s => s.startTime >= startOfWeek);

        return {
            session: calculateMetrics(recentSession),
            daily: calculateMetrics(todaySessions),
            weekly: calculateMetrics(weekSessions)
        };
    }, [allSessions]);

    const renderReportSection = (title: string, data: ReportMetrics) => {
        if (data.totalStudyTime === 0) {
            return (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">{title}</h3>
                    <p className="text-slate-500">暂无数据。完成一次有效的学习后，这里会生成报告。</p>
                </div>
            );
        }

        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ReportCard title="专注率" value={`${data.focusRate.toFixed(1)}%`}>
                        <ProgressBar value={data.focusRate} colorClass="bg-green-500" />
                    </ReportCard>
                    <ReportCard title="总学习时长" value={formatDuration(data.totalStudyTime)} subtext={`专注: ${formatDuration(data.focusedTime)}`} />
                    <ReportCard title="总休息时长" value={formatDuration(data.totalBreakTime)} subtext={`占总时间: ${data.breakTimePercentage.toFixed(1)}%`} />
                    <ReportCard title="休息间隔中位数" value={formatDuration(data.medianBreakInterval)} subtext={`共休息 ${data.breakCount} 次`} />
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">学习专注度报告</h2>
                <button onClick={onBack} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                    返回
                </button>
            </div>
            {renderReportSection('上次学习', reports.session)}
            {renderReportSection('今日报告', reports.daily)}
            {renderReportSection('本周报告', reports.weekly)}
        </div>
    );
};

export default ReportView;