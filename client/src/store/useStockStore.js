import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { useAuthStore } from './useAuthStore';

function mergeStocksBySymbol(existingStocks, incomingStocks) {
  const stockMap = new Map(existingStocks.map((stock) => [stock.symbol, stock]));
  incomingStocks.forEach((stock) => {
    stockMap.set(stock.symbol, stock);
  });
  return Array.from(stockMap.values());
}

export const useStockStore = create((set, get) => ({
  stocks: [],
  searchQuery: '',
  searchResults: [],
  searchCache: {},
  recentSearches: [],
  portfolio: [],
  selectedSymbol: 'TCS',
  isLoadingStocks: false,
  isLoadingPortfolio: false,
  isSearching: false,
  isBuying: false,
  error: '',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),

  fetchStocks: async () => {
    set({ isLoadingStocks: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/stocks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        stocks: mergeStocksBySymbol(state.stocks, data),
        searchResults: state.searchResults.length ? state.searchResults : data.slice(0, 6),
        selectedSymbol:
          state.selectedSymbol || data[0]?.symbol || 'TCS',
        isLoadingStocks: false,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoadingStocks: false });
      throw error;
    }
  },

  searchStocks: async (query) => {
    set({ isSearching: true, error: '' });
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        const defaultResults = get().stocks.slice(0, 6);
        set((state) => ({
          searchResults: defaultResults,
          isSearching: false,
          searchQuery: '',
        }));
        return defaultResults;
      }

      const cachedResults = useStockStore.getState().searchCache[trimmedQuery.toLowerCase()];
      if (cachedResults) {
        set((state) => ({
          searchResults: cachedResults,
          isSearching: false,
          searchQuery: trimmedQuery,
          selectedSymbol: cachedResults[0]?.symbol || state.selectedSymbol,
        }));
        return cachedResults;
      }

      const token = useAuthStore.getState().token;
      const data = await apiRequest(`/stocks/search?q=${encodeURIComponent(trimmedQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set((state) => ({
        stocks: mergeStocksBySymbol(state.stocks, data),
        searchResults: data,
        searchCache: {
          ...state.searchCache,
          [trimmedQuery.toLowerCase()]: data,
        },
        isSearching: false,
        searchQuery: trimmedQuery,
        selectedSymbol: data[0]?.symbol || state.selectedSymbol,
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isSearching: false });
      throw error;
    }
  },

  fetchPortfolio: async () => {
    set({ isLoadingPortfolio: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      const data = await apiRequest('/stocks/portfolio', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ portfolio: data, isLoadingPortfolio: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoadingPortfolio: false });
      throw error;
    }
  },

  buyStock: async (payload) => {
    set({ isBuying: true, error: '' });
    try {
      const token = useAuthStore.getState().token;
      await apiRequest('/stocks/buy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      set({ isBuying: false });
      await Promise.all([
        useStockStore.getState().fetchStocks(),
        useStockStore.getState().fetchPortfolio(),
      ]);
    } catch (error) {
      set({ error: error.message, isBuying: false });
      throw error;
    }
  },

  rememberSearch: (stock) =>
    set((state) => ({
      selectedSymbol: stock.symbol,
      recentSearches: [stock, ...state.recentSearches.filter((item) => item.symbol !== stock.symbol)].slice(0, 5),
    })),

  reset: () =>
    set({
      stocks: [],
      searchQuery: '',
      searchResults: [],
      searchCache: {},
      recentSearches: [],
      portfolio: [],
      selectedSymbol: 'TCS',
      isLoadingStocks: false,
      isLoadingPortfolio: false,
      isSearching: false,
      isBuying: false,
      error: '',
    }),
}));
