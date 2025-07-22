import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">页面未找到</h2>
          <p className="text-gray-600 mt-2">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          
          <div className="text-sm text-gray-500">
            或者您可以访问以下页面：
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              to="/dashboard"
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              学习概览
            </Link>
            <Link
              to="/study"
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              开始学习
            </Link>
            <Link
              to="/history"
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              学习历史
            </Link>
            <Link
              to="/report"
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              学习报告
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          如果您认为这是一个错误，请联系我们的技术支持。
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;