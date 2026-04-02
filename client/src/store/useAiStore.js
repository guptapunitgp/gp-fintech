import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { useAuthStore } from './useAuthStore';

export const useAiStore = create((set, get) => ({
  financeAnswer: '',
  financeQuestion: '',
  financeModel: '',
  financeError: '',
  isLoadingFinanceHelp: false,
  stockAnalysisBySymbol: {},
  stockError: '',
  isLoadingStockAnalysis: false,

  setFinanceQuestion: (financeQuestion) => set({ financeQuestion }),

  requestFinanceHelp: async ({ question, profile, transactions, portfolio }) => {
    set({
      isLoadingFinanceHelp: true,
      financeError: '',
      financeQuestion: question,
    });

    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/ai/finance-help', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          profile,
          transactions,
          portfolio,
        }),
      });

      set({
        financeAnswer: data.answer,
        financeModel: data.model,
        isLoadingFinanceHelp: false,
      });
      return data;
    } catch (error) {
      set({
        financeError: error.message,
        isLoadingFinanceHelp: false,
      });
      throw error;
    }
  },

  requestStockAnalysis: async (stock) => {
    const symbol = stock?.symbol;
    if (!symbol) {
      throw new Error('Select a stock first.');
    }

    set({
      isLoadingStockAnalysis: true,
      stockError: '',
    });

    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/ai/stock-analysis', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock }),
      });

      set((state) => ({
        stockAnalysisBySymbol: {
          ...state.stockAnalysisBySymbol,
          [symbol]: {
            answer: data.answer,
            model: data.model,
            updatedAt: new Date().toISOString(),
          },
        },
        isLoadingStockAnalysis: false,
      }));
      return data;
    } catch (error) {
      set({
        stockError: error.message,
        isLoadingStockAnalysis: false,
      });
      throw error;
    }
  },

  clearAiErrors: () => set({ financeError: '', stockError: '' }),

  reset: () =>
    set({
      financeAnswer: '',
      financeQuestion: '',
      financeModel: '',
      financeError: '',
      isLoadingFinanceHelp: false,
      stockAnalysisBySymbol: {},
      stockError: '',
      isLoadingStockAnalysis: false,
    }),
}));
