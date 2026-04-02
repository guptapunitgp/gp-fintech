const studyIndicatorOptions = [
  { id: 'candles', label: 'Candles' },
  { id: 'movingAverage', label: 'Moving Avg' },
  { id: 'trend', label: 'Trend' },
  { id: 'volatility', label: 'Volatility' },
];

function StockSimulatorPanel({ stocks, form, setForm, onToggleIndicator, onSubmit, isBuying }) {
  const isStudyMode = form.mode === 'study';

  return (
    <form onSubmit={onSubmit} className="subtle-panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="section-title">Study and Invest</h3>
          <p className="section-copy">
            Create a real investment entry or a paper trade to practice your stock study.
          </p>
        </div>
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          {['investment', 'study'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setForm((current) => ({ ...current, mode }))}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                form.mode === mode
                  ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {mode === 'investment' ? 'Real tracking' : 'Study mode'}
            </button>
          ))}
        </div>
      </div>

      <select
        value={form.stockName}
        onChange={(event) => setForm((current) => ({ ...current, stockName: event.target.value }))}
        className="field"
      >
        {stocks.map((stock) => (
          <option key={stock.symbol} value={stock.symbol}>
            {stock.name}
          </option>
        ))}
      </select>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
          className="field"
          placeholder="Quantity"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.buyPrice}
          onChange={(event) => setForm((current) => ({ ...current, buyPrice: event.target.value }))}
          className="field"
          placeholder={isStudyMode ? 'Dummy entry price' : 'Buy price'}
        />
      </div>

      {isStudyMode && (
        <>
          <select
            value={form.predictedDirection}
            onChange={(event) =>
              setForm((current) => ({ ...current, predictedDirection: event.target.value }))
            }
            className="field"
          >
            <option value="rise">Predict: likely to rise</option>
            <option value="fall">Predict: likely to fall</option>
            <option value="stable">Predict: likely to stay stable</option>
          </select>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Study tools used
            </p>
            <div className="flex flex-wrap gap-2">
              {studyIndicatorOptions.map((option) => {
                const isActive = form.studyIndicators.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onToggleIndicator(option.id)}
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            value={form.studyNotes}
            onChange={(event) => setForm((current) => ({ ...current, studyNotes: event.target.value }))}
            className="field min-h-24 resize-none"
            placeholder="Why are you taking this study trade? Note the setup, levels, or candle pattern you are observing."
          />
        </>
      )}

      <button type="submit" className="btn-primary" disabled={isBuying}>
        {isBuying
          ? 'Saving...'
          : isStudyMode
            ? 'Save paper trade'
            : 'Add investment'}
      </button>
    </form>
  );
}

export default StockSimulatorPanel;
