import { useState } from 'react';
import api from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // 业务逻辑待实现

  return {
    loading,
    error,
    request: async (method: string, url: string, data?: any) => {
      setLoading(true);
      setError(null);
      try {
        // 业务逻辑待实现
        return null;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
}