import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 业务逻辑待实现

  return {
    user,
    loading,
    login: async (credentials: any) => {},
    logout: async () => {},
    isAuthenticated: !!user
  };
}