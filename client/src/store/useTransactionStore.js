import { create } from 'zustand';
import { API_BASE_URL, apiRequest } from '../lib/api';
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
  isUploadingCsv: false,
  isDownloadingCsv: false,
  csvImportSummary: null,
  error: '',

  setFilters: (nextFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...nextFilters },
    })),

  clearError: () => set({ error: '' }),

  clearCsvImportSummary: () => set({ csvImportSummary: null }),

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

  uploadTransactionsCsv: async (file) => {
    set({ isUploadingCsv: true, error: '', csvImportSummary: null });
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/transactions/upload-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('finance:unauthorized'));
        }
        throw new Error(data.message || 'Unable to upload CSV.');
      }

      set({
        isUploadingCsv: false,
        csvImportSummary: data,
      });
      await get().fetchTransactions();
      return data;
    } catch (error) {
      set({
        isUploadingCsv: false,
        error: error.message,
      });
      throw error;
    }
  },

  downloadTransactionsCsv: async () => {
    set({ isDownloadingCsv: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/transactions/download-csv`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Unable to download CSV.';
        try {
          const data = await response.json();
          message = data.message || message;
        } catch (error) {
          // ignore parse failure for blob response
        }

        if (response.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('finance:unauthorized'));
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'transactions.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      set({ isDownloadingCsv: false });
    } catch (error) {
      set({
        isDownloadingCsv: false,
        error: error.message,
      });
      throw error;
    }
  },

  reset: () =>
    set({
      transactions: [],
      filters: defaultFilters,
      isLoading: false,
      isSaving: false,
      isUploadingCsv: false,
      isDownloadingCsv: false,
      csvImportSummary: null,
      error: '',
    }),
}));
