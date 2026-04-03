import { useMemo } from 'react';
import AIFinanceAssistantPanel from '../components/AIFinanceAssistantPanel';
import InsightsPanel from '../components/InsightsPanel';
import OverviewCharts from '../components/OverviewCharts';
import SectionHeader from '../components/common/SectionHeader';
import StatePanel from '../components/common/StatePanel';
import { useAiStore } from '../store/useAiStore';
import { useProfileStore } from '../store/useProfileStore';
import { useStockStore } from '../store/useStockStore';
import { useTransactionStore } from '../store/useTransactionStore';
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  getInsights,
} from '../utils/finance';

function InsightsPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const isLoading = useTransactionStore((state) => state.isLoading);
  const error = useTransactionStore((state) => state.error);
  const profile = useProfileStore((state) => state.profile);
  const portfolio = useStockStore((state) => state.portfolio);
  const financeQuestion = useAiStore((state) => state.financeQuestion);
  const financeAnswer = useAiStore((state) => state.financeAnswer);
  const financeModel = useAiStore((state) => state.financeModel);
  const financeMessage = useAiStore((state) => state.financeMessage);
  const financeDegraded = useAiStore((state) => state.financeDegraded);
  const financeError = useAiStore((state) => state.financeError);
  const isLoadingFinanceHelp = useAiStore((state) => state.isLoadingFinanceHelp);
  const setFinanceQuestion = useAiStore((state) => state.setFinanceQuestion);
  const requestFinanceHelp = useAiStore((state) => state.requestFinanceHelp);

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(transactions),
    [transactions],
  );
  const monthlyTrend = useMemo(() => calculateMonthlyTrend(transactions), [transactions]);
  const insights = useMemo(
    () => getInsights(transactions, profile || {}, portfolio),
    [transactions, profile, portfolio],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Insights"
        title="Understand how money is moving"
        description="Review your highest spending category, compare momentum month over month, and keep emerging patterns visible."
      />
      {isLoading ? (
        <StatePanel
          title="Loading insights"
          description="Crunching your latest transaction data into charts and narrative insights."
        />
      ) : error ? (
        <StatePanel title="Unable to load insights" description={error} tone="danger" />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <InsightsPanel insights={insights} />
            <AIFinanceAssistantPanel
              question={financeQuestion}
              answer={financeAnswer}
              model={financeModel}
              message={financeMessage}
              degraded={financeDegraded}
              error={financeError}
              isLoading={isLoadingFinanceHelp}
              onQuestionChange={setFinanceQuestion}
              onSubmit={(question) =>
                requestFinanceHelp({
                  question,
                  profile,
                  transactions,
                  portfolio,
                })
              }
            />
          </section>

          <section>
            <OverviewCharts
              monthlyTrend={monthlyTrend}
              categoryBreakdown={categoryBreakdown}
            />
          </section>
        </div>
      )}
    </div>
  );
}

export default InsightsPage;
