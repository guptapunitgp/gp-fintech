function InsightsPanel({ insights }) {
  return (
    <aside className="subtle-panel p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="section-title">Insights</h3>
        <p className="section-copy">
          Quick takeaways generated from current finance activity.
        </p>
      </div>

      <div className="space-y-4">
        <article className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-500/15 to-white p-4 shadow-[0_20px_45px_-35px_rgba(245,158,11,0.55)] transition duration-200 hover:-translate-y-1 dark:border-amber-500/10 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Highest Spending Category
          </p>
          <h4 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {insights.highestCategory}
          </h4>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {insights.highestCategoryText}
          </p>
        </article>

        <article className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-500/15 to-white p-4 shadow-[0_20px_45px_-35px_rgba(37,99,235,0.55)] transition duration-200 hover:-translate-y-1 dark:border-brand-500/10 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
            Monthly Comparison
          </p>
          <h4 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {insights.monthlyComparisonTitle}
          </h4>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {insights.monthlyComparisonText}
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4 shadow-[0_20px_45px_-35px_rgba(16,185,129,0.55)] transition duration-200 hover:-translate-y-1 dark:border-emerald-500/10 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Savings Rate
          </p>
          <h4 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {insights.savingsTitle}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {insights.savingsText}
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-500/15 to-white p-4 shadow-[0_20px_45px_-35px_rgba(139,92,246,0.55)] transition duration-200 hover:-translate-y-1 dark:border-violet-500/10 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
            Portfolio Insight
          </p>
          <h4 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {insights.portfolioTitle}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {insights.portfolioText}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-4 shadow-[0_20px_45px_-35px_rgba(100,116,139,0.4)] transition duration-200 hover:-translate-y-1 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Smart Observation
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {insights.general}
          </p>
        </article>
      </div>
    </aside>
  );
}

export default InsightsPanel;
