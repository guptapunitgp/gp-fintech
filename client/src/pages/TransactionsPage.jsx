import TransactionCsvControls from '../components/TransactionCsvControls';
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
  const isUploadingCsv = useTransactionStore((state) => state.isUploadingCsv);
  const isDownloadingCsv = useTransactionStore((state) => state.isDownloadingCsv);
  const csvImportSummary = useTransactionStore((state) => state.csvImportSummary);
  const error = useTransactionStore((state) => state.error);
  const uploadTransactionsCsv = useTransactionStore((state) => state.uploadTransactionsCsv);
  const downloadTransactionsCsv = useTransactionStore((state) => state.downloadTransactionsCsv);
  const openCreateTransaction = useUiStore((state) => state.openCreateTransaction);
  const visibleTransactions = getVisibleTransactions(transactions, filters);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Transactions"
        title="Manage transaction history"
        description="Search, filter, sort, and maintain every income and expense entry from a single workspace."
        action={null}
      />
      <TransactionCsvControls
        role={role}
        isUploading={isUploadingCsv}
        isDownloading={isDownloadingCsv}
        csvImportSummary={csvImportSummary}
        onUpload={uploadTransactionsCsv}
        onDownload={downloadTransactionsCsv}
        onOpenCreate={openCreateTransaction}
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
