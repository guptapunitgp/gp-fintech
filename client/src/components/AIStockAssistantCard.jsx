import { formatDateTime } from '../utils/formatters';
import StatePanel from './common/StatePanel';

function AIStockAssistantCard({
  stock,
  analysis,
  error,
  isLoading,
  onAnalyze,
}) {
  return (
    <section className="subtle-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
            AI Stock Study
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {stock?.symbol ? `${stock.symbol} analysis` : 'AI stock analysis'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Generate a short AI read on trend, risk, and what to watch next from the current chart data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAnalyze(stock)}
          disabled={!stock || isLoading}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-300"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      <div className="mt-5">
        {error ? (
          <StatePanel title="AI stock analysis unavailable" description={error} tone="danger" />
        ) : analysis?.answer ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-sm leading-7 text-slate-700 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-200">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <span>{analysis.model}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatDateTime(analysis.updatedAt)}</span>
            </div>
            <div className="mt-3 whitespace-pre-wrap">{analysis.answer}</div>
          </div>
        ) : (
          <StatePanel
            title="No AI stock read yet"
            description="Run an AI analysis to get an educational summary of the selected stock's momentum, risks, and chart setup."
          />
        )}
      </div>
    </section>
  );
}

export default AIStockAssistantCard;
