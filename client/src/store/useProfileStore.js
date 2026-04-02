import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { useAuthStore } from './useAuthStore';

export const useProfileStore = create((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  isCancelingDeletion: false,
  error: '',

  fetchProfile: async () => {
    set({ isLoading: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ profile: data, isLoading: false });
      useAuthStore.getState().setUser(data);
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (payload) => {
    set({ isSaving: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      set({ profile: data, isSaving: false });
      useAuthStore.getState().setUser(data);
      return data;
    } catch (error) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ isDeleting: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/user/profile/deletion-request', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ profile: data.profile, isDeleting: false });
      useAuthStore.getState().setUser(data.profile);
      return data;
    } catch (error) {
      set({ error: error.message, isDeleting: false });
      throw error;
    }
  },

  cancelDeleteAccount: async () => {
    set({ isCancelingDeletion: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/user/profile/deletion-request', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ profile: data.profile, isCancelingDeletion: false });
      useAuthStore.getState().setUser(data.profile);
      return data;
    } catch (error) {
      set({ error: error.message, isCancelingDeletion: false });
      throw error;
    }
  },

  reset: () =>
    set({
      profile: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isCancelingDeletion: false,
      error: '',
    }),
}));
