function PredictionCard({ prediction, trend, studyAccuracy }) {
  const isPositive = prediction.label.includes('Rise');

  return (
    <section className="subtle-panel p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
        Basic Prediction
      </p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">{prediction.label}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Based on the last five sessions and the current {trend.toLowerCase()} trend.
          </p>
        </div>
        <span
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : prediction.label.includes('Fall')
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {prediction.confidence}% confidence
        </span>
      </div>

      {typeof studyAccuracy === 'number' && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Your Study Accuracy
          </p>
          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
            {studyAccuracy}% of resolved paper trades are currently right
          </p>
        </div>
      )}
    </section>
  );
}

export default PredictionCard;
