import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, updateSettings, loading } = useAuth();
  const [formData, setFormData] = useState({
    minSessionDuration: user?.minSessionDuration || 30,
    dailyTimeLimit: user?.dailyTimeLimit || 120,
    stretchBreak: user?.stretchBreak || 5,
    waterBreak: user?.waterBreak || 3,
    restroomBreak: user?.restroomBreak || 5,
    forcedBreakDuration: user?.forcedBreakDuration || 10,
    workDurationBeforeForcedBreak: user?.workDurationBeforeForcedBreak || 45,
    waterBreakLimit: user?.waterBreakLimit || 3,
    restroomBreakLimit: user?.restroomBreakLimit || 2,
    voiceRemindersEnabled: user?.voiceRemindersEnabled || false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateSettings(formData);
      setSuccess('设置已保存');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || '保存失败');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value) || 0,
    }));
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">学习设置</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 基础设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基础设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最短学习时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="minSessionDuration"
                      value={formData.minSessionDuration}
                      onChange={handleInputChange}
                      min="10"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">每次学习的最短时间</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      每日学习时长限制 (分钟)
                    </label>
                    <input
                      type="number"
                      name="dailyTimeLimit"
                      value={formData.dailyTimeLimit}
                      onChange={handleInputChange}
                      min="30"
                      max="480"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">每天最多学习时间</p>
                  </div>
                </div>
              </div>

              {/* 休息设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">休息设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      拉伸休息时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="stretchBreak"
                      value={formData.stretchBreak}
                      onChange={handleInputChange}
                      min="1"
                      max="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      喝水休息时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="waterBreak"
                      value={formData.waterBreak}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      如厕休息时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="restroomBreak"
                      value={formData.restroomBreak}
                      onChange={handleInputChange}
                      min="1"
                      max="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      强制休息时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="forcedBreakDuration"
                      value={formData.forcedBreakDuration}
                      onChange={handleInputChange}
                      min="5"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      强制休息前的学习时长 (分钟)
                    </label>
                    <input
                      type="number"
                      name="workDurationBeforeForcedBreak"
                      value={formData.workDurationBeforeForcedBreak}
                      onChange={handleInputChange}
                      min="20"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 休息次数限制 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">休息次数限制</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      每日喝水次数限制
                    </label>
                    <input
                      type="number"
                      name="waterBreakLimit"
                      value={formData.waterBreakLimit}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      每日如厕次数限制
                    </label>
                    <input
                      type="number"
                      name="restroomBreakLimit"
                      value={formData.restroomBreakLimit}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 其他设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">其他设置</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="voiceRemindersEnabled"
                    checked={formData.voiceRemindersEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    启用语音提醒
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存设置'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;