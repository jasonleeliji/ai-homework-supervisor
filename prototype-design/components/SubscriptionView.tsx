import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLAN_DETAILS, Plan } from '../constants';
import { SubscriptionPlan } from '../types';

const SubscriptionView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { subscribe, user, isTrialActive, hasActiveSubscription, planName } = useAuth();
    const [isLoading, setIsLoading] = useState<SubscriptionPlan | null>(null);
    const [error, setError] = useState('');

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        setIsLoading(plan);
        setError('');
        try {
            await subscribe(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : '订阅失败，请稍后重试。');
        } finally {
            setIsLoading(null);
        }
    };

    const getPlanStatusText = () => {
        if (hasActiveSubscription && user?.subscriptionEndDate) {
            return `您当前的计划是：${planName}，有效期至 ${new Date(user.subscriptionEndDate).toLocaleDateString()}。`;
        }
        if (isTrialActive && user?.trialEndDate) {
            return `您正在免费体验中，有效期至 ${new Date(user.trialEndDate).toLocaleDateString()}。`;
        }
        return '您当前没有有效的订阅计划，试用期已结束。';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">订阅计划</h2>
                <button onClick={onBack} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                    返回
                </button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg mb-8 text-center">
                <p>{getPlanStatusText()}</p>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(PLAN_DETAILS).map(([planKey, details]) => {
                    const plan = planKey as Plan;
                    const isCurrentPlan = user?.plan === plan && hasActiveSubscription;
                    return (
                        <div key={plan} className={`border-2 rounded-2xl p-6 flex flex-col ${isCurrentPlan ? 'border-green-500 ring-2 ring-green-500/50' : 'border-slate-300 dark:border-slate-600'}`}>
                            <h3 className="text-2xl font-bold text-center">{details.name}</h3>
                            
                            <p className="text-5xl font-extrabold text-center my-4">
                                ¥{details.price}<span className="text-lg font-medium text-slate-500">/月</span>
                            </p>
                            <ul className="space-y-2 text-sm mb-6 flex-grow">
                                <li className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg><span>每日可用 {details.dailyTimeLimit} 小时</span></li>
                                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg><span>AI 专注度分析 (20秒/次)</span></li>
                                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg><span>智能语音提醒</span></li>
                                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg><span>完整学习报告</span></li>
                            </ul>
                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={isLoading !== null || isCurrentPlan}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 ${isCurrentPlan ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading === plan ? '处理中...' : (isCurrentPlan ? '当前计划' : '选择此计划')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionView;