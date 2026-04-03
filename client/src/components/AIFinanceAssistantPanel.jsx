import { useState } from 'react';
import StatePanel from './common/StatePanel';

const suggestedPrompts = [
  'How can I reduce my monthly expenses without hurting savings?',
  'What should I improve based on my current spending pattern?',
  'Give me a simple action plan for the next 30 days.',
];

function AIFinanceAssistantPanel({
  question,
  answer,
  model,
  message,
  degraded,
  isLoading,
  error,
  onQuestionChange,
  onSubmit,
}) {
  const [draft, setDraft] = useState(question || suggestedPrompts[0]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    onQuestionChange(trimmed);
    await onSubmit(trimmed).catch(() => null);
  };

  return (
    <section className="subtle-panel p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
            AI Help
          </p>
          <h3 className="section-title">Finance suggestions</h3>
          <p className="section-copy">
            Ask for budgeting help, spending ideas, or a quick action plan based on your dashboard data.
          </p>
        </div>
        {model ? (
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            degraded
              ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
              : 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200'
          }`}>
            {model}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setDraft(prompt)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500/30 dark:hover:text-brand-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Ask for a savings plan, spending advice, or budget suggestions."
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Educational suggestions only. AI replies may be imperfect.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-300"
          >
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
      </form>

      <div className="mt-5">
        {error ? (
          <StatePanel title="AI help unavailable" description={error} tone="danger" />
        ) : answer ? (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-sm leading-7 text-slate-700 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:text-slate-200">
            {message ? (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                {message}
              </div>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Response
            </p>
            <div className="mt-3 whitespace-pre-wrap">{answer}</div>
          </div>
        ) : (
          <StatePanel
            title="No AI response yet"
            description="Ask a question to get budgeting help and finance suggestions based on your current dashboard data."
          />
        )}
      </div>
    </section>
  );
}

export default AIFinanceAssistantPanel;
