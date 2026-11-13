import { create } from 'zustand';
import adminApi from '../api/adminClient';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAdminAuthStore = create<AuthStore>((set) => ({
  admin: (() => {
    try {
      const stored = localStorage.getItem('eterna_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('eterna_admin_token'),
  isAuthenticated: !!localStorage.getItem('eterna_admin_token'),

  login: (token, admin) => {
    localStorage.setItem('eterna_admin_token', token);
    localStorage.setItem('eterna_admin_user', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('eterna_admin_token');
    localStorage.removeItem('eterna_admin_user');
    set({ token: null, admin: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('eterna_admin_token');
    if (!token) {
      set({ token: null, admin: null, isAuthenticated: false });
      return false;
    }
    try {
      const res = await adminApi.get('/auth/me');
      const admin = res.data.data;
      set({ admin, isAuthenticated: true });
      return true;
    } catch {
      localStorage.removeItem('eterna_admin_token');
      localStorage.removeItem('eterna_admin_user');
      set({ token: null, admin: null, isAuthenticated: false });
      return false;
    }
  },
}));

