import React, { useState, useRef } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { BreakType } from '../types/api';

const StudyPage: React.FC = () => {
  const { user } = useAuth();
  const {
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    addFocusEntry,
    addBreakEntry,
    analyzeImage,
    loading,
    error,
  } = useSession();

  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakType, setBreakType] = useState<BreakType>(BreakType.STRETCH);
  const [breakStartTime, setBreakStartTime] = useState<number>(0);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartSession = async () => {
    try {
      await startSession();
    } catch (err) {
      console.error('启动学习会话失败:', err);
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
    } catch (err) {
      console.error('结束学习会话失败:', err);
    }
  };

  const handleStartBreak = async (type: BreakType) => {
    const now = Date.now();
    setBreakType(type);
    setBreakStartTime(now);
    setIsOnBreak(true);
  };

  const handleEndBreak = async () => {
    if (breakStartTime > 0) {
      try {
        await addBreakEntry({
          startTime: breakStartTime,
          endTime: Date.now(),
          type: breakType,
        });
        setIsOnBreak(false);
        setBreakStartTime(0);
      } catch (err) {
        console.error('记录休息失败:', err);
      }
    }
  };

  const handleFocusCheck = async (isFocused: boolean, isOnSeat: boolean) => {
    try {
      await addFocusEntry({
        timestamp: Date.now(),
        isFocused: isFocused ? 1 : 0,
        isOnSeat: isOnSeat ? 1 : 0,
      });
    } catch (err) {
      console.error('记录专注状态失败:', err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // 移除 data:image/...;base64, 前缀
        
        try {
          await analyzeImage({ imageBase64: base64Data });
        } catch (err) {
          console.error('图像分析失败:', err);
        } finally {
          setImageAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('读取图像失败:', err);
      setImageAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = () => {
    if (!currentSession?.startTime) return 0;
    return Math.floor((Date.now() - currentSession.startTime) / 1000);
  };

  const getBreakTypeLabel = (type: BreakType) => {
    switch (type) {
      case BreakType.STRETCH:
        return '拉伸休息';
      case BreakType.WATER:
        return '喝水休息';
      case BreakType.RESTROOM:
        return '如厕休息';
      case BreakType.FORCED:
        return '强制休息';
      default:
        return '休息';
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 学习状态卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">学习监控</h1>
            
            {isSessionActive ? (
              <div className="space-y-4">
                <div className="text-6xl font-mono text-blue-600">
                  {formatTime(getSessionDuration())}
                </div>
                <div className="text-lg text-gray-600">
                  {isOnBreak ? `${getBreakTypeLabel(breakType)}中...` : '正在学习'}
                </div>
                
                {!isOnBreak ? (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleEndSession}
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      结束学习
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={handleEndBreak}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      结束休息
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-2xl text-gray-600">准备开始学习</div>
                <button
                  onClick={handleStartSession}
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '启动中...' : '开始学习'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 控制面板 */}
        {isSessionActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 休息控制 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">休息控制</h3>
              {!isOnBreak ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartBreak(BreakType.STRETCH)}
                    className="p-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                  >
                    拉伸休息
                  </button>
                  <button
                    onClick={() => handleStartBreak(BreakType.WATER)}
                    className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                  >
                    喝水休息
                  </button>
                  <button
                    onClick={() => handleStartBreak(BreakType.RESTROOM)}
                    className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                  >
                    如厕休息
                  </button>
                  <button
                    onClick={() => handleStartBreak(BreakType.FORCED)}
                    className="p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                  >
                    强制休息
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  正在{getBreakTypeLabel(breakType)}...
                </div>
              )}
            </div>

            {/* 专注状态记录 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">专注状态</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleFocusCheck(true, true)}
                  className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  专注在座
                </button>
                <button
                  onClick={() => handleFocusCheck(true, false)}
                  className="p-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                >
                  专注离座
                </button>
                <button
                  onClick={() => handleFocusCheck(false, true)}
                  className="p-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200"
                >
                  分心在座
                </button>
                <button
                  onClick={() => handleFocusCheck(false, false)}
                  className="p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  分心离座
                </button>
              </div>
            </div>

            {/* 图像分析 */}
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 图像分析</h3>
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageAnalyzing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {imageAnalyzing ? '分析中...' : '上传图片进行分析'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  上传学习环境照片，AI 将分析您的专注状态
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 当前会话信息 */}
        {currentSession && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">当前会话统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentSession.focusHistory?.length || 0}
                </div>
                <div className="text-sm text-gray-600">专注记录</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {currentSession.breakHistory?.length || 0}
                </div>
                <div className="text-sm text-gray-600">休息次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentSession.tokenUsage || 0}
                </div>
                <div className="text-sm text-gray-600">AI 分析次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(currentSession.duration || 0)}
                </div>
                <div className="text-sm text-gray-600">已学习时长</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;