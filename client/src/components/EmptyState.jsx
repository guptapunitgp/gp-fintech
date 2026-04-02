import { FolderOpenDot } from 'lucide-react';

function EmptyState({
  title = 'Nothing to show yet',
  description = 'Add finance activity to populate this dashboard.',
  onAddTransaction,
  role,
  compact = false,
}) {
  return (
    <div
      className={`subtle-panel flex flex-col items-center justify-center border-dashed bg-gradient-to-br from-white/90 to-slate-50 p-6 text-center dark:from-slate-900/80 dark:to-slate-950 ${
        compact ? 'min-h-[220px]' : 'min-h-[420px]'
      }`}
    >
      <div className="mb-4 flex h-16 w-16 animate-float items-center justify-center rounded-3xl bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <FolderOpenDot size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {role === 'admin' && onAddTransaction && !compact && (
        <button type="button" onClick={onAddTransaction} className="btn-primary mt-5">
          Add your first transaction
        </button>
      )}
    </div>
  );
}

export default EmptyState;
