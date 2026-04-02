import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AddTransactionModal from './components/AddTransactionModal';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import InsightsPage from './pages/InsightsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import StocksPage from './pages/StocksPage';
import TransactionsPage from './pages/TransactionsPage';
import { useAuthStore } from './store/useAuthStore';
import { useAiStore } from './store/useAiStore';
import { useProfileStore } from './store/useProfileStore';
import { useStockStore } from './store/useStockStore';
import { useTransactionStore } from './store/useTransactionStore';
import { useUiStore } from './store/useUiStore';

function App() {
  const theme = useUiStore((state) => state.theme);
  const hydrate = useAuthStore((state) => state.hydrate);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const resetTransactions = useTransactionStore((state) => state.reset);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const resetProfile = useProfileStore((state) => state.reset);
  const fetchStocks = useStockStore((state) => state.fetchStocks);
  const fetchPortfolio = useStockStore((state) => state.fetchPortfolio);
  const resetStocks = useStockStore((state) => state.reset);
  const resetAi = useAiStore((state) => state.reset);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const isDark = theme === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('finance:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('finance:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      resetTransactions();
      resetProfile();
      resetStocks();
      resetAi();
      return;
    }

    fetchTransactions().catch(() => null);
    fetchProfile().catch(() => null);
    fetchStocks().catch(() => null);
    fetchPortfolio().catch(() => null);
  }, [
    token,
    fetchTransactions,
    resetTransactions,
    fetchProfile,
    resetProfile,
    fetchStocks,
    fetchPortfolio,
    resetStocks,
    resetAi,
  ]);

  return (
    <div className="app-shell">
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stocks" element={<StocksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AddTransactionModal />
    </div>
  );
}

export default App;
