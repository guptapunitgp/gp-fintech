import { create } from 'zustand';

const storageKey = 'finance-dashboard-ui';

function loadTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  } catch (error) {
    return 'light';
  }
}

function persistTheme(theme) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, theme);
}

export const useUiStore = create((set) => ({
  theme: loadTheme(),
  transactionModal: {
    isOpen: false,
    mode: 'create',
    transaction: null,
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      persistTheme(nextTheme);
      return { theme: nextTheme };
    }),

  openCreateTransaction: () =>
    set({
      transactionModal: {
        isOpen: true,
        mode: 'create',
        transaction: null,
      },
    }),

  openEditTransaction: (transaction) =>
    set({
      transactionModal: {
        isOpen: true,
        mode: 'edit',
        transaction,
      },
    }),

  closeTransactionModal: () =>
    set({
      transactionModal: {
        isOpen: false,
        mode: 'create',
        transaction: null,
      },
    }),
}));
