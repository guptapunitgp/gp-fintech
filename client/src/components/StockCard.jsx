import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

function StockCard({ stock, isSelected, onSelect, holding }) {
  const isPositive = stock.changePercent >= 0;
  const profit = holding?.profit ?? 0;
  const hasHolding = Boolean(holding);

  return (
    <button
      type="button"
      onClick={() => onSelect(stock.symbol)}
      className={`subtle-panel w-full p-5 text-left transition duration-200 hover:-translate-y-1 ${
        isSelected ? 'border-brand-500/60 ring-2 ring-brand-500/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {stock.symbol}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{stock.name}</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-950 dark:text-white">
            {formatCurrency(stock.currentPrice)}
          </p>
        </div>
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
            isPositive
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            isPositive ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatPercent(stock.changePercent)}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {hasHolding
            ? `P/L ${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`
            : 'No holding yet'}
        </span>
      </div>
    </button>
  );
}

export default StockCard;
