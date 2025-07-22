import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { ReportMetrics } from '../types/api';

const ReportPage: React.FC = () => {
  const { getReport, loading, error } = useSession();
  const [report, setReport] = useState<ReportMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    loadReport();
  }, [timeRange]);

  const loadReport = async () => {
    try {
      const response = await getReport(timeRange);
      if (response.report) {
        setReport(response.report);
      }
    } catch (err) {
      console.error('加载报告失败:', err);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'week':
        return '最近一周';
      case 'month':
        return '最近一月';
      case 'all':
        return '全部时间';
      default:
        return '最近一周';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">生成报告中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">学习报告</h1>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">时间范围:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="all">全部时间</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!report ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">暂无报告数据</div>
              <p className="text-gray-400 mt-2">开始学习后将生成详细报告</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 总体统计 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {getTimeRangeLabel(timeRange)}总体统计
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatTime(report.totalStudyTime)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">总学习时长</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {report.averageFocusRate}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">平均专注率</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {report.totalSessions}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">学习次数</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {report.totalBreaks}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">休息次数</div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600">
                      {report.totalTokenUsage}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">AI 分析次数</div>
                  </div>
                </div>
              </div>

              {/* 每日详细数据 */}
              {report.dailyBreakdown && report.dailyBreakdown.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">每日详细数据</h2>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              日期
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              学习时长
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              专注率
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              学习次数
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              休息次数
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              AI 分析
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {report.dailyBreakdown
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((day, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatDate(day.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatTime(day.studyTime)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${day.focusRate}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium">{day.focusRate}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {day.sessions}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {day.breaks}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {day.tokenUsage}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 学习建议 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">学习建议</h2>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="space-y-3">
                    {report.averageFocusRate < 70 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                        <p className="text-gray-700">
                          您的平均专注率为 {report.averageFocusRate}%，建议减少学习环境中的干扰因素，提高专注度。
                        </p>
                      </div>
                    )}
                    
                    {report.totalStudyTime < 60 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <p className="text-gray-700">
                          建议增加每日学习时长，保持良好的学习习惯。
                        </p>
                      </div>
                    )}
                    
                    {report.totalBreaks > report.totalSessions * 3 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        <p className="text-gray-700">
                          休息次数较多，建议调整学习节奏，减少不必要的休息。
                        </p>
                      </div>
                    )}
                    
                    {report.averageFocusRate >= 80 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <p className="text-gray-700">
                          专注率很高！继续保持这种良好的学习状态。
                        </p>
                      </div>
                    )}
                    
                    {report.totalSessions > 0 && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <p className="text-gray-700">
                          平均每次学习时长为 {formatTime(Math.round(report.totalStudyTime / report.totalSessions))}，
                          建议保持规律的学习节奏。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;