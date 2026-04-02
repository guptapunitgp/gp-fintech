import { Bell, LogOut, MoonStar, Plus, SunMedium } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';

const pageTitles = {
  '/': 'Dashboard Overview',
  '/transactions': 'Transactions Workspace',
  '/insights': 'Spending Insights',
  '/profile': 'Profile Settings',
  '/stocks': 'Indian Stocks Tracker',
};

function TopNavbar() {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const openCreateTransaction = useUiStore((state) => state.openCreateTransaction);
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="navbar-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
              GP Fintech | role switch active: {role}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {pageTitles[pathname] || 'GP Fintech'}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="subtle-panel flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-sm font-bold text-brand-700 dark:text-brand-300">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email} | backend role {user?.role}
              </p>
            </div>
          </div>

          <label className="subtle-panel flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="button" onClick={toggleTheme} className="btn-secondary gap-2">
            {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <button
            type="button"
            className="btn-secondary px-3"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          {role === 'admin' && (
            <button
              type="button"
              onClick={openCreateTransaction}
              className="btn-primary gap-2"
            >
              <Plus size={16} />
              Add transaction
            </button>
          )}

          <button type="button" onClick={logout} className="btn-secondary gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;

