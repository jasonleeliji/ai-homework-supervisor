import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionPlan } from '../types/api';

const SubscriptionPage: React.FC = () => {
  const { user, subscribe, loading } = useAuth();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      await subscribe({ plan });
    } catch (err) {
      console.error('订阅失败:', err);
    }
  };

  const plans = [
    {
      id: SubscriptionPlan.STANDARD,
      name: '标准版',
      price: '¥29/月',
      features: [
        '无限学习时长',
        'AI 智能分析',
        '详细学习报告',
        '专注度监控',
        '休息提醒',
        '基础数据统计',
      ],
      recommended: false,
    },
    {
      id: SubscriptionPlan.PRO,
      name: '专业版',
      price: '¥49/月',
      features: [
        '标准版所有功能',
        '高级AI分析',
        '个性化学习建议',
        '家长监控面板',
        '学习习惯分析',
        '优先客服支持',
        '数据导出功能',
        '多设备同步',
      ],
      recommended: true,
    },
  ];

  const getCurrentPlanName = () => {
    switch (user?.plan) {
      case SubscriptionPlan.STANDARD:
        return '标准版';
      case SubscriptionPlan.PRO:
        return '专业版';
      default:
        return '免费试用';
    }
  };

  const isTrialActive = () => {
    if (!user?.trialEndDate) return false;
    return new Date(user.trialEndDate) > new Date();
  };

  const hasActiveSubscription = () => {
    if (!user?.subscriptionEndDate) return false;
    return new Date(user.subscriptionEndDate) > new Date();
  };

  const getSubscriptionStatus = () => {
    if (hasActiveSubscription()) {
      return {
        status: '已订阅',
        endDate: new Date(user!.subscriptionEndDate!).toLocaleDateString('zh-CN'),
        color: 'text-green-600',
      };
    } else if (isTrialActive()) {
      return {
        status: '试用中',
        endDate: new Date(user!.trialEndDate!).toLocaleDateString('zh-CN'),
        color: 'text-blue-600',
      };
    } else {
      return {
        status: '未订阅',
        endDate: '',
        color: 'text-gray-600',
      };
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 当前订阅状态 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">订阅管理</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">当前套餐</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {getCurrentPlanName()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">状态</div>
              <div className={`text-2xl font-bold mt-1 ${subscriptionStatus.color}`}>
                {subscriptionStatus.status}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">
                {subscriptionStatus.status === '已订阅' ? '到期时间' : 
                 subscriptionStatus.status === '试用中' ? '试用到期' : ''}
              </div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {subscriptionStatus.endDate || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* 套餐选择 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            选择适合您的套餐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    推荐套餐
                  </div>
                )}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{plan.price}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || user.plan === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      user.plan === plan.id
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.recommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50`}
                  >
                    {loading
                      ? '处理中...'
                      : user.plan === plan.id
                      ? '当前套餐'
                      : '立即订阅'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 免费试用说明 */}
        {!hasActiveSubscription() && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">免费试用说明</h3>
            <div className="space-y-2 text-blue-800">
              <p>• 新用户可免费试用 7 天专业版功能</p>
              <p>• 试用期间享受完整的 AI 分析和学习报告</p>
              <p>• 试用结束后可选择订阅或继续使用基础功能</p>
              <p>• 随时可以升级到付费套餐</p>
            </div>
          </div>
        )}

        {/* 常见问题 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">常见问题</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">如何取消订阅？</h4>
              <p className="text-gray-600 mt-1">
                您可以随时在设置页面取消订阅，取消后将在当前计费周期结束时停止续费。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">支持哪些支付方式？</h4>
              <p className="text-gray-600 mt-1">
                支持微信支付、支付宝、银行卡等多种支付方式。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">可以更换套餐吗？</h4>
              <p className="text-gray-600 mt-1">
                可以随时升级套餐，降级将在当前计费周期结束时生效。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">数据安全如何保障？</h4>
              <p className="text-gray-600 mt-1">
                我们采用银行级别的数据加密和安全措施，确保您的学习数据安全。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;