import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import OverviewCharts from '../components/OverviewCharts';
import InsightsPanel from '../components/InsightsPanel';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/common/SectionHeader';
import StatePanel from '../components/common/StatePanel';
import { useProfileStore } from '../store/useProfileStore';
import { useStockStore } from '../store/useStockStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useUiStore } from '../store/useUiStore';
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  calculateSummary,
  getInsights,
} from '../utils/finance';
import { useAuthStore } from '../store/useAuthStore';

function DashboardPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const isLoading = useTransactionStore((state) => state.isLoading);
  const error = useTransactionStore((state) => state.error);
  const profile = useProfileStore((state) => state.profile);
  const portfolio = useStockStore((state) => state.portfolio);
  const role = useAuthStore((state) => state.role);
  const openCreateTransaction = useUiStore((state) => state.openCreateTransaction);

  const summary = useMemo(() => calculateSummary(transactions), [transactions]);
  const monthlyTrend = useMemo(() => calculateMonthlyTrend(transactions), [transactions]);
  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(transactions),
    [transactions],
  );
  const insights = useMemo(
    () => getInsights(transactions, profile || {}, portfolio),
    [transactions, profile, portfolio],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Dashboard"
        title="Your finance command center"
        description="Track current balance, compare monthly performance, and keep your spending profile visible at a glance."
        action={
          role === 'admin' ? (
            <button type="button" onClick={openCreateTransaction} className="btn-primary gap-2">
              <Plus size={16} />
              Add transaction
            </button>
          ) : null
        }
      />

      {isLoading ? (
        <StatePanel
          title="Loading dashboard"
          description="We're pulling your latest transactions and recalculating the dashboard."
        />
      ) : error ? (
        <StatePanel title="Unable to load dashboard" description={error} tone="danger" />
      ) : transactions.length === 0 ? (
        <EmptyState
          role={role}
          onAddTransaction={openCreateTransaction}
          title="No transactions available yet"
          description="Once you create transactions, summary cards and charts will populate automatically."
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Balance"
              value={summary.balance}
              accent="brand"
              subtitle="Available net position across all recorded cash flow."
            />
            <SummaryCard
              title="Total Income"
              value={summary.income}
              accent="success"
              subtitle="All positive inflows captured from your transaction history."
            />
            <SummaryCard
              title="Total Expenses"
              value={summary.expenses}
              accent="danger"
              subtitle="Total outgoing spend across categories and periods."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
            <OverviewCharts
              monthlyTrend={monthlyTrend}
              categoryBreakdown={categoryBreakdown}
            />
            <InsightsPanel insights={insights} />
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;

