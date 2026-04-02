function StatePanel({ title, description, tone = 'neutral' }) {
  const toneStyles = {
    neutral:
      'border-slate-200 bg-white/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300',
    danger:
      'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
  };

  return (
    <div className={`subtle-panel p-6 ${toneStyles[tone]}`}>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </div>
  );
}

export default StatePanel;
