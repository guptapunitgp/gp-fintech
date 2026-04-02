import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LineChart,
  UserCircle2,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/' },
  { label: 'Transactions', icon: CreditCard, to: '/transactions' },
  { label: 'Insights', icon: BarChart3, to: '/insights' },
  { label: 'Profile', icon: UserCircle2, to: '/profile' },
  { label: 'Stocks', icon: LineChart, to: '/stocks' },
];

function Sidebar() {
  return (
    <aside className="sidebar-panel flex flex-col gap-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_20px_35px_-20px_rgba(15,23,42,0.8)] dark:bg-brand-500">
          <WalletCards size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            GP Fintech
          </p>
          <h1 className="text-lg font-bold text-slate-950 dark:text-white">Control Hub</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-pill w-full ${isActive ? 'nav-pill-active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="subtle-panel relative mt-auto overflow-hidden p-4">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-brand-500/20 via-emerald-500/10 to-transparent" />
        <div className="relative">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
            <Sparkles size={18} />
          </div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Premium visibility
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Monitor balance, spot expense pressure, and keep every transaction in a
            workspace designed for fast financial decisions.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
