import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const accentMap = {
  brand: {
    orb: 'bg-brand-500/20',
    icon: 'bg-brand-500/15 text-brand-700 dark:text-brand-300',
    label: 'text-brand-700 dark:text-brand-300',
  },
  success: {
    orb: 'bg-emerald-500/20',
    icon: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-700 dark:text-emerald-300',
  },
  danger: {
    orb: 'bg-rose-500/20',
    icon: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    label: 'text-rose-700 dark:text-rose-300',
  },
};

function SummaryCard({ title, value, accent, subtitle }) {
  const palette = accentMap[accent];
  const Icon = accent === 'success' ? ArrowUpRight : accent === 'danger' ? ArrowDownRight : Wallet;

  return (
    <article className="metric-card group animate-fade-up hover:-translate-y-1">
      <div className={`metric-orb ${palette.orb}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold ${palette.label}`}>{title}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {formatCurrency(value)}
          </h2>
          <p className="mt-2 max-w-[18rem] text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.icon} transition duration-300 group-hover:-translate-y-1`}
        >
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

export default SummaryCard;
