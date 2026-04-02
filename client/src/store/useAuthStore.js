import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { signOutFirebase } from '../lib/firebase';

const storageKey = 'finance-dashboard-auth';

function loadPersistedAuth() {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

const persistedAuth = typeof window !== 'undefined' ? loadPersistedAuth() : null;

export const useAuthStore = create((set, get) => ({
  token: persistedAuth?.token ?? '',
  user: persistedAuth?.user ?? null,
  role: persistedAuth?.role ?? persistedAuth?.user?.role ?? 'viewer',
  isHydrated: false,
  isSubmitting: false,
  error: '',

  hydrate: () => {
    const nextAuth = loadPersistedAuth();
    set({
      token: nextAuth?.token ?? '',
      user: nextAuth?.user ?? null,
      role: nextAuth?.role ?? nextAuth?.user?.role ?? 'viewer',
      isHydrated: true,
    });
  },

  persistSession: () => {
    const { token, user, role } = get();

    if (!token || !user) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify({ token, user, role }));
  },

  clearError: () => set({ error: '' }),

  applySession: (data) => {
    set({
      token: data.token,
      user: data.user,
      role: data.user.role,
      isSubmitting: false,
      error: '',
    });
    get().persistSession();
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: '' });
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      get().applySession(data);
      return data;
    } catch (error) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: '' });
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      get().applySession(data);
      return data;
    } catch (error) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  googleAuth: async (payload) => {
    set({ isSubmitting: true, error: '' });
    try {
      const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      get().applySession(data);
      return data;
    } catch (error) {
      set({ error: error.message, isSubmitting: false });
      throw error;
    }
  },

  setRole: (role) => {
    set({ role });
    get().persistSession();
  },

  setUser: (user) => {
    set((state) => ({
      user: {
        ...state.user,
        ...user,
      },
      role: state.role || user.role || 'viewer',
    }));
    get().persistSession();
  },

  logout: () => {
    set({ token: '', user: null, role: 'viewer', error: '' });
    localStorage.removeItem(storageKey);
    signOutFirebase().catch(() => null);
  },
}));
