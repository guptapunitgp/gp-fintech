import { ArrowDownUp, Pencil, Search, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useUiStore } from '../store/useUiStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import EmptyState from './EmptyState';

function TransactionsSection({ transactions }) {
  const role = useAuthStore((state) => state.role);
  const filters = useTransactionStore((state) => state.filters);
  const setFilters = useTransactionStore((state) => state.setFilters);
  const removeTransaction = useTransactionStore((state) => state.deleteTransaction);
  const openEditTransaction = useUiStore((state) => state.openEditTransaction);

  const hasFilters =
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.sortBy !== 'date';

  return (
    <section className="subtle-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <h3 className="section-title">Transactions</h3>
          <p className="section-copy">
            Search, filter, and sort every transaction in one place.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr,0.7fr,0.7fr]">
          <label className="relative block">
            <span className="sr-only">Search transactions</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search by category or amount"
              className="field pl-11"
            />
          </label>

          <select
            value={filters.type}
            onChange={(event) => setFilters({ type: event.target.value })}
            className="field"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <label className="relative">
            <ArrowDownUp
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.sortBy}
              onChange={(event) => setFilters({ sortBy: event.target.value })}
              className="field pl-11"
            >
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
            </select>
          </label>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            compact
            title={hasFilters ? 'No transactions match your filters' : 'No transactions yet'}
            description={
              hasFilters
                ? 'Try adjusting the search query or filters to see more results.'
                : 'Transactions will appear here as soon as they are added.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-950/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-100/80 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Amount
                  </th>
                  {role === 'admin' && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white/70 dark:divide-slate-800 dark:bg-slate-950/40">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id ?? transaction.id}
                    className="transition duration-200 hover:bg-slate-50 dark:hover:bg-brand-500/10"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                      {transaction.category}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          transaction.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 text-right text-sm font-bold ${
                        transaction.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTransaction(transaction)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTransaction(transaction._id ?? transaction.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default TransactionsSection;
