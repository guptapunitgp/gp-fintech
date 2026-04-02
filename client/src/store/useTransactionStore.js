import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { useAuthStore } from './useAuthStore';

const defaultFilters = {
  search: '',
  type: 'all',
  sortBy: 'date',
};

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  filters: defaultFilters,
  isLoading: false,
  isSaving: false,
  error: '',

  setFilters: (nextFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...nextFilters },
    })),

  clearError: () => set({ error: '' }),

  fetchTransactions: async () => {
    set({ isLoading: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ transactions: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createTransaction: async (payload) => {
    set({ isSaving: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/transactions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      set((state) => ({
        transactions: [data, ...state.transactions],
        isSaving: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  updateTransaction: async (id, payload) => {
    set({ isSaving: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest(`/transactions/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction._id === id ? data : transaction,
        ),
        isSaving: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isSaving: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      await apiRequest(`/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction._id !== id),
        isSaving: false,
      }));
    } catch (error) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  reset: () =>
    set({
      transactions: [],
      filters: defaultFilters,
      isLoading: false,
      isSaving: false,
      error: '',
    }),
}));
