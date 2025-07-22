import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { SubscriptionPlan, User } from '../types';
import { PLAN_DETAILS, Plan, DEFAULT_SETTINGS } from '../constants';

// --- Types ---
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  register: (phone: string) => Promise<void>;
  logout: () => void;
  subscribe: (plan: SubscriptionPlan) => Promise<void>;
  isTrialActive: boolean;
  hasActiveSubscription: boolean;
  planName: string;
  effectiveDailyLimit: number;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helper Functions ---
const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUserFromStorage());

  useEffect(() => {
    const loggedInUser = getUserFromStorage();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const login = useCallback(async (phone: string): Promise<void> => {
    // Simulate checking a database
    const storedUsers: { [key: string]: User } = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    if (storedUsers[phone]) {
      const foundUser = storedUsers[phone];
      setUser(foundUser);
      saveUserToStorage(foundUser);
    } else {
      throw new Error('手机号码未注册');
    }
  }, []);

  const register = useCallback(async (phone: string): Promise<void> => {
    const storedUsers: { [key: string]: User } = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    if (storedUsers[phone]) {
      throw new Error('该手机号码已被注册');
    }
    const newUser: User = {
      phone,
      plan: 'none',
      trialEndDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5-day trial
    };
    storedUsers[phone] = newUser;
    localStorage.setItem('userDatabase', JSON.stringify(storedUsers));
    setUser(newUser);
    saveUserToStorage(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const subscribe = useCallback(async (plan: SubscriptionPlan): Promise<void> => {
    if (!user || plan === 'none') throw new Error("无效的操作");
    
    // Simulate payment and subscription update
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const updatedUser: User = {
      ...user,
      plan,
      subscriptionEndDate: subscriptionEndDate.getTime(),
    };

    // Update "database"
    const storedUsers: { [key: string]: User } = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    storedUsers[user.phone] = updatedUser;
    localStorage.setItem('userDatabase', JSON.stringify(storedUsers));
    
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  }, [user]);

  const isAuthenticated = !!user;
  const isTrialActive = user?.trialEndDate ? user.trialEndDate > Date.now() : false;
  const hasActiveSubscription = user?.subscriptionEndDate ? user.subscriptionEndDate > Date.now() : false;
  
  let effectiveDailyLimit = 0;
  let planName = '未订阅';

  if (hasActiveSubscription && user?.plan && user.plan !== 'none') {
      const details = PLAN_DETAILS[user.plan as Plan];
      effectiveDailyLimit = details.dailyTimeLimit;
      planName = `${details.name}版`;
  } else if (isTrialActive) {
      effectiveDailyLimit = DEFAULT_SETTINGS.dailyTimeLimit; // Trial gets default limit
      planName = '免费体验版';
  }

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    subscribe,
    isTrialActive,
    hasActiveSubscription,
    planName,
    effectiveDailyLimit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};