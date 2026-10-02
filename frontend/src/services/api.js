import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mindcraft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Prevent multiple simultaneous 401 redirects
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mindcraft_token');
      localStorage.removeItem('mindcraft_user');

      // Dispatch event so active pollers can stop
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mindcraft_auth_expired'));

        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') && currentPath !== '/admin/login' && !isRedirecting) {
          isRedirecting = true;
          setTimeout(() => {
            window.location.href = '/admin/login';
            isRedirecting = false;
          }, 300);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
