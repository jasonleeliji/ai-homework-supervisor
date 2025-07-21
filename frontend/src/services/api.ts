import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 可添加认证token等
api.interceptors.request.use(
  (config) => {
    // 业务逻辑待实现
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 可统一处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 业务逻辑待实现
    return Promise.reject(error);
  }
);

export default api;