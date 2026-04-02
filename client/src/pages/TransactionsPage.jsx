import { Plus } from 'lucide-react';
import TransactionsSection from '../components/TransactionsSection';
import SectionHeader from '../components/common/SectionHeader';
import StatePanel from '../components/common/StatePanel';
import { useAuthStore } from '../store/useAuthStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useUiStore } from '../store/useUiStore';
import { getVisibleTransactions } from '../utils/finance';

function TransactionsPage() {
  const role = useAuthStore((state) => state.role);
  const transactions = useTransactionStore((state) => state.transactions);
  const filters = useTransactionStore((state) => state.filters);
  const isLoading = useTransactionStore((state) => state.isLoading);
  const error = useTransactionStore((state) => state.error);
  const openCreateTransaction = useUiStore((state) => state.openCreateTransaction);
  const visibleTransactions = getVisibleTransactions(transactions, filters);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Transactions"
        title="Manage transaction history"
        description="Search, filter, sort, and maintain every income and expense entry from a single workspace."
        action={
          role === 'admin' ? (
            <button type="button" onClick={openCreateTransaction} className="btn-primary gap-2">
              <Plus size={16} />
              New transaction
            </button>
          ) : null
        }
      />
      {isLoading ? (
        <StatePanel
          title="Loading transactions"
          description="Fetching the latest transaction history from the API."
        />
      ) : error ? (
        <StatePanel title="Unable to load transactions" description={error} tone="danger" />
      ) : (
        <TransactionsSection transactions={visibleTransactions} />
      )}
    </div>
  );
}

export default TransactionsPage;
