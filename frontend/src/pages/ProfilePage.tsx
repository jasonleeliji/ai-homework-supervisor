import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gender } from '../types/api';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    age: user?.age || 0,
    grade: user?.grade || '',
    gender: user?.gender || Gender.BOY,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '更新失败');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value,
    }));
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                编辑资料
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <input
                  type="text"
                  value={user.phone}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1"
                  max="18"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="例如：小学三年级"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    !isEditing ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                >
                  <option value={Gender.BOY}>男孩</option>
                  <option value={Gender.GIRL}>女孩</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nickname: user?.nickname || '',
                      age: user?.age || 0,
                      grade: user?.grade || '',
                      gender: user?.gender || Gender.BOY,
                    });
                    setError('');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;