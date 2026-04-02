import { formatCurrency } from '../utils/formatters';

function StockAnalysis({ stock }) {
  const trendSentence =
    stock.trend === 'Increasing'
      ? 'Stock is in upward trend.'
      : stock.trend === 'Decreasing'
        ? 'Stock is in downward trend.'
        : 'Stock is currently moving in a stable range.';

  const volatilitySentence =
    stock.volatility === 'High'
      ? 'High volatility detected.'
      : stock.volatility === 'Medium'
        ? 'Moderate volatility detected.'
        : 'Low volatility suggests steadier movement.';

  const studyPlan = [
    'Check the candle study chart for repeated rejection or breakout zones.',
    `Compare current price with the 7-day moving average near ${formatCurrency(stock.movingAverage)}.`,
    `Treat ${stock.volatility.toLowerCase()} volatility as your position-sizing signal during study trades.`,
  ];

  return (
    <section className="subtle-panel space-y-4 p-5 sm:p-6">
      <div>
        <h3 className="section-title">Stock Analysis</h3>
        <p className="section-copy">Simple technical observations for learning purposes.</p>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">7-Day Moving Average</p>
        <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
          {formatCurrency(stock.movingAverage)}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">{trendSentence}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{volatilitySentence}</p>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Study Checklist</p>
        <div className="mt-3 space-y-2">
          {studyPlan.map((item) => (
            <p key={item} className="text-sm text-slate-600 dark:text-slate-300">
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StockAnalysis;
