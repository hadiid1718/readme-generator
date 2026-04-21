/**
 * Auth Store (Zustand)
 * Manages authentication state, user data, and auth actions
 */
import { create } from 'zustand';
import { authAPI } from '../lib/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  handleOAuthToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  adminLogin: async (email: string, password: string) => {
    const response = await authAPI.adminLogin({ email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await authAPI.register({ name, email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await authAPI.getMe();
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  handleOAuthToken: async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const response = await authAPI.getMe();
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
