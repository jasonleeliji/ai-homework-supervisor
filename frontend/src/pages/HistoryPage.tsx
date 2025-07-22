import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { StudySession } from '../types/api';

const HistoryPage: React.FC = () => {
  const { getSessionHistory, loading, error } = useSession();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getSessionHistory();
      if (response.sessions) {
        setSessions(response.sessions);
      }
    } catch (err) {
      console.error('加载历史记录失败:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateFocusRate = (session: StudySession) => {
    if (!session.focusHistory || session.focusHistory.length === 0) return 0;
    
    const focusedCount = session.focusHistory.filter(entry => entry.isFocused).length;
    return Math.round((focusedCount / session.focusHistory.length) * 100);
  };

  const getBreakTypeLabel = (type: string) => {
    switch (type) {
      case 'stretch':
        return '拉伸';
      case 'water':
        return '喝水';
      case 'restroom':
        return '如厕';
      case 'forced':
        return '强制';
      default:
        return '休息';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (!dateFilter) return true;
    const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
    return sessionDate === dateFilter;
  });

  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, StudySession[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">学习历史</h1>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">筛选日期:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {Object.keys(groupedSessions).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">暂无学习记录</div>
              <p className="text-gray-400 mt-2">开始您的第一次学习吧！</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSessions)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, daySessions]) => (
                  <div key={date}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {formatDate(new Date(date).getTime())}
                    </h2>
                    
                    {/* 日统计 */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {daySessions.length}
                          </div>
                          <div className="text-sm text-gray-600">学习次数</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatTime(
                              daySessions.reduce((total, session) => 
                                total + (session.totalDuration || 0), 0
                              )
                            )}
                          </div>
                          <div className="text-sm text-gray-600">总学习时长</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(
                              daySessions.reduce((total, session) => 
                                total + calculateFocusRate(session), 0
                              ) / daySessions.length
                            )}%
                          </div>
                          <div className="text-sm text-gray-600">平均专注率</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {daySessions.reduce((total, session) => 
                              total + (session.breakHistory?.length || 0), 0
                            )}
                          </div>
                          <div className="text-sm text-gray-600">总休息次数</div>
                        </div>
                      </div>
                    </div>

                    {/* 会话列表 */}
                    <div className="space-y-4">
                      {daySessions
                        .sort((a, b) => b.startTime - a.startTime)
                        .map((session) => (
                          <div
                            key={session._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="text-lg font-medium text-gray-900">
                                  {formatDateTime(session.startTime)} - {' '}
                                  {session.endTime ? formatDateTime(session.endTime) : '进行中'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  学习时长: {formatTime(session.totalDuration || 0)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-blue-600">
                                  {calculateFocusRate(session)}%
                                </div>
                                <div className="text-sm text-gray-500">专注率</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">专注记录:</span>
                                <span className="ml-1 font-medium">
                                  {session.focusHistory?.length || 0} 次
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">休息次数:</span>
                                <span className="ml-1 font-medium">
                                  {session.breakHistory?.length || 0} 次
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">AI 分析:</span>
                                <span className="ml-1 font-medium">
                                  {session.totalTokensUsed || 0} 次
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">会话ID:</span>
                                <span className="ml-1 font-mono text-xs">
                                  {session._id.slice(-8)}
                                </span>
                              </div>
                            </div>

                            {/* 休息详情 */}
                            {session.breakHistory && session.breakHistory.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-sm text-gray-600 mb-2">休息详情:</div>
                                <div className="flex flex-wrap gap-2">
                                  {session.breakHistory.map((breakEntry, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                    >
                                      {getBreakTypeLabel(breakEntry.type)} (
                                      {formatTime(
                                        Math.floor((breakEntry.endTime - breakEntry.startTime) / 1000)
                                      )})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;