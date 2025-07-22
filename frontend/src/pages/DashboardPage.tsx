import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
  const { 
    user, 
    todayStudyTime, 
    effectiveDailyLimit, 
    isTrialActive, 
    hasActiveSubscription, 
    planName 
  } = useAuth();
  
  const { 
    currentSession, 
    isSessionActive, 
    currentStatus, 
    sessionHistory, 
    reportMetrics 
  } = useSession();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const getProgressPercentage = (): number => {
    if (effectiveDailyLimit === 0) return 0;
    return Math.min((todayStudyTime / effectiveDailyLimit) * 100, 100);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'STUDYING': return 'text-green-600 bg-green-100';
      case 'BREAK': return 'text-yellow-600 bg-yellow-100';
      case 'IDLE': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'STUDYING': return '学习中';
      case 'BREAK': return '休息中';
      case 'IDLE': return '空闲';
      default: return '未知';
    }
  };

  // 获取最近的学习会话
  const recentSessions = sessionHistory.slice(0, 3);

  // 计算本周学习统计
  const weeklyStats = reportMetrics ? {
    totalTime: reportMetrics.totalStudyTime,
    avgDaily: Math.round(reportMetrics.totalStudyTime / 7),
    sessionsCount: reportMetrics.totalSessions,
    focusRate: reportMetrics.averageFocusRate
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            欢迎回来，{user?.childProfile?.nickname || '同学'}！
          </h1>
          <p className="mt-2 text-gray-600">
            今天是学习的好日子，让我们开始吧！
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="px-4 sm:px-0">
          {/* 顶部状态卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 当前状态 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                      {getStatusText(currentStatus)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {isSessionActive ? '学习中' : '未开始'}
                  </div>
                  <p className="text-sm text-gray-500">当前状态</p>
                </div>
              </div>
            </div>

            {/* 今日学习时间 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⏰</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(todayStudyTime)}
                  </div>
                  <p className="text-sm text-gray-500">
                    今日学习时间
                    {effectiveDailyLimit > 0 && ` / ${formatTime(effectiveDailyLimit)}`}
                  </p>
                  {effectiveDailyLimit > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 本周统计 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {weeklyStats ? formatTime(weeklyStats.totalTime) : '暂无数据'}
                  </div>
                  <p className="text-sm text-gray-500">本周总学习时间</p>
                  {weeklyStats && (
                    <p className="text-xs text-gray-400 mt-1">
                      日均 {formatTime(weeklyStats.avgDaily)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 专注度 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {weeklyStats ? `${Math.round(weeklyStats.focusRate)}%` : '暂无数据'}
                  </div>
                  <p className="text-sm text-gray-500">平均专注度</p>
                </div>
              </div>
            </div>
          </div>

          {/* 主要操作区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 快速操作 */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/study"
                      className="group relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">📚</span>
                        <div>
                          <h4 className="text-lg font-semibold">开始学习</h4>
                          <p className="text-blue-100 text-sm">开始新的学习会话</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/report"
                      className="group relative bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">📈</span>
                        <div>
                          <h4 className="text-lg font-semibold">学习报告</h4>
                          <p className="text-green-100 text-sm">查看详细学习分析</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/history"
                      className="group relative bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">📊</span>
                        <div>
                          <h4 className="text-lg font-semibold">学习历史</h4>
                          <p className="text-purple-100 text-sm">查看历史学习记录</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      className="group relative bg-gradient-to-r from-gray-500 to-gray-600 p-6 rounded-lg text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">⚙️</span>
                        <div>
                          <h4 className="text-lg font-semibold">学习设置</h4>
                          <p className="text-gray-100 text-sm">调整学习参数</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 账户状态 */}
            <div className="space-y-6">
              {/* 订阅状态 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">账户状态</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-900">当前套餐</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hasActiveSubscription ? 'bg-green-100 text-green-800' : 
                      isTrialActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {planName}
                    </span>
                  </div>
                  
                  {isTrialActive && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        🎉 您正在享受免费试用期
                      </p>
                    </div>
                  )}
                  
                  {!hasActiveSubscription && !isTrialActive && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ 试用期已结束，请升级套餐
                      </p>
                    </div>
                  )}
                  
                  <Link
                    to="/subscription"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    {hasActiveSubscription ? '管理订阅' : '升级套餐'}
                  </Link>
                </div>
              </div>

              {/* 今日目标 */}
              {effectiveDailyLimit > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">今日目标</h3>
                  </div>
                  <div className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {Math.round(getProgressPercentage())}%
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        已完成 {formatTime(todayStudyTime)} / {formatTime(effectiveDailyLimit)}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                      {getProgressPercentage() >= 100 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          🎉 今日目标已达成！
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 最近学习记录 */}
          {recentSessions.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">最近学习记录</h3>
                <Link
                  to="/history"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  查看全部
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {recentSessions.map((session, index) => (
                  <div key={session._id || index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-lg">📚</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            学习会话
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.startTime).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(session.totalDuration)}
                        </p>
                        <p className="text-sm text-gray-500">
                          专注度 {Math.round(session.focusRate)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;