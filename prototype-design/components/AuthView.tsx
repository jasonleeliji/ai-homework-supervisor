
import React, { useState } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';

const AuthView: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">AI 作业监督员</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">欢迎使用！请登录或注册以继续。</p>
      </div>
      
      {isRegistering ? (
        <RegisterView onSwitchToLogin={() => setIsRegistering(false)} />
      ) : (
        <LoginView onSwitchToRegister={() => setIsRegistering(true)} />
      )}
    </div>
  );
};

export default AuthView;
