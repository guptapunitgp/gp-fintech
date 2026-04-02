import { formatCurrency, formatPercent } from '../utils/formatters';

const indicatorLabels = {
  candles: 'Candles',
  movingAverage: 'Moving Avg',
  trend: 'Trend',
  volatility: 'Volatility',
};

function outcomeTone(outcome) {
  if (outcome === 'correct') return 'text-emerald-600 dark:text-emerald-300';
  if (outcome === 'wrong') return 'text-rose-600 dark:text-rose-300';
  return 'text-amber-600 dark:text-amber-300';
}

function outcomeLabel(outcome) {
  if (outcome === 'correct') return 'Right';
  if (outcome === 'wrong') return 'Wrong';
  return 'Pending';
}

function directionLabel(direction) {
  if (direction === 'rise') return 'Rise';
  if (direction === 'fall') return 'Fall';
  return 'Stable';
}

function formatIndicators(indicators) {
  if (!Array.isArray(indicators) || indicators.length === 0) {
    return 'No tools noted';
  }

  return indicators.map((indicator) => indicatorLabels[indicator] || indicator).join(', ');
}

function StudyJournalTable({ positions }) {
  return (
    <section className="subtle-panel p-5 sm:p-6">
      <h3 className="section-title">Study Journal</h3>
      <p className="section-copy">
        Review paper trades, the indicators you used, and whether your prediction is proving right.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prediction</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entry</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Return</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {positions.map((position) => (
              <tr key={position._id}>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{position.stockName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatIndicators(position.studyIndicators)}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {directionLabel(position.predictedDirection)}
                </td>
                <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                  {formatCurrency(position.buyPrice)}
                </td>
                <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                  {formatCurrency(position.currentPrice)}
                </td>
                <td className="px-4 py-4 text-right text-sm font-semibold text-slate-950 dark:text-white">
                  {position.returnPercent >= 0 ? '+' : ''}
                  {formatPercent(position.returnPercent)}
                </td>
                <td className={`px-4 py-4 text-sm font-bold ${outcomeTone(position.predictionOutcome)}`}>
                  {outcomeLabel(position.predictionOutcome)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudyJournalTable;
