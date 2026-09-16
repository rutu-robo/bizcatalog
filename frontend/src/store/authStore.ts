import { create } from 'zustand';
import { User, Website } from '../types';
import { api } from '../api/client';

interface AuthState {
  user: User | null;
  website: Website | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, website: Website, token: string) => void;
  updateUser: (user: User) => void;
  updateWebsite: (website: Website) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  website: null,
  token: localStorage.getItem('bizcatalog_token'),
  isLoading: true,

  setAuth: (user, website, token) => {
    localStorage.setItem('bizcatalog_token', token);
    set({ user, website, token, isLoading: false });
  },

  updateUser: (user) => {
    set({ user });
  },

  updateWebsite: (website) => {
    set({ website });
  },

  logout: () => {
    localStorage.removeItem('bizcatalog_token');
    set({ user: null, website: null, token: null, isLoading: false });
  },

  initAuth: async () => {
    const token = localStorage.getItem('bizcatalog_token');
    if (!token) {
      set({ user: null, website: null, isLoading: false });
      return;
    }
    try {
      const [user, website] = await Promise.all([
        api.getProfile(),
        api.getMyWebsite(),
      ]);
      set({ user, website, isLoading: false });
    } catch {
      localStorage.removeItem('bizcatalog_token');
      set({ user: null, website: null, token: null, isLoading: false });
    }
  },
}));
