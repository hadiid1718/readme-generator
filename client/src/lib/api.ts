/**
 * Axios API Client
 * Configured with base URL, interceptors, and auth token management
 */
import axios from 'axios';

const DEFAULT_PROD_API_URL = 'https://readme-generator-aylm.onrender.com/api';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : '/api')
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----- Request Interceptor: Attach JWT -----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Response Interceptor: Handle errors -----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      localStorage.removeItem('token');
      // Don't redirect if already on auth pages
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ----- Auth API -----
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  updateMe: (data: { name?: string; avatar?: string }) =>
    api.patch('/auth/me', data),
};

// ----- README API -----
export const readmeAPI = {
  generate: (data: { input: any; templateId: string; themeVariant?: string }) =>
    api.post('/readmes/generate', data),

  preview: (data: { input: any; templateId: string }) =>
    api.post('/readmes/preview', data),

  getAll: (page = 1, limit = 10) =>
    api.get(`/readmes?page=${page}&limit=${limit}`),

  getOne: (id: string) => api.get(`/readmes/${id}`),

  update: (id: string, data: any) => api.patch(`/readmes/${id}`, data),

  delete: (id: string) => api.delete(`/readmes/${id}`),

  getTemplates: () => api.get('/readmes/templates'),
};

// ----- Payment API -----
export const paymentAPI = {
  createCheckout: () => api.post('/payments/create-checkout'),

  createPortal: () => api.post('/payments/create-portal'),

  cancelSubscription: () => api.post('/payments/cancel-subscription'),

  getStatus: () => api.get('/payments/status'),

  getHistory: (page = 1, limit = 10) =>
    api.get(`/payments/history?page=${page}&limit=${limit}`),
};

// ----- Admin API -----
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),

  getSubscriptionStats: () => api.get('/admin/subscription-stats'),

  getHealth: () => api.get('/admin/health'),

  getUsers: (page = 1, limit = 10, search = '', plan = '', role = '') => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (plan) params.set('plan', plan);
    if (role) params.set('role', role);
    return api.get(`/admin/users?${params.toString()}`);
  },

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: { role?: string; plan?: string; subscriptionStatus?: string }) =>
    api.patch(`/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export default api;
