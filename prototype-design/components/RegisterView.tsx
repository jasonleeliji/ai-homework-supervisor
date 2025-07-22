
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterViewProps {
    onSwitchToLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!/^\d{11}$/.test(phone)) {
            setError('请输入有效的11位手机号码。');
            return;
        }
        setIsLoading(true);
        try {
            await register(phone);
        } catch (err) {
            setError(err instanceof Error ? err.message : '注册失败');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-center">新用户注册</h2>
            <p className="text-center text-sm text-green-600 dark:text-green-400">注册即送5天免费体验！</p>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label htmlFor="phone-register" className="block text-sm font-medium">手机号码</label>
                <input
                    id="phone-register"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入11位手机号码"
                    className="mt-1 block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
            >
                {isLoading ? '注册中...' : '注册'}
            </button>
            <p className="text-center text-sm">
                已有账户？{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500">
                    返回登录
                </button>
            </p>
        </form>
    );
};

export default RegisterView;
