import { Download, FileUp, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

function TransactionCsvControls({
  role,
  isUploading,
  isDownloading,
  csvImportSummary,
  onUpload,
  onDownload,
  onOpenCreate,
}) {
  const fileInputRef = useRef(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onUpload(file).catch(() => null);
    event.target.value = '';
  };

  return (
    <section className="subtle-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="section-title">CSV Tools</h3>
          <p className="section-copy">
            Download your current transactions as CSV or import a CSV file in one step.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="btn-secondary gap-2"
          >
            {isDownloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {isDownloading ? 'Downloading...' : 'Download CSV'}
          </button>

          {role === 'admin' ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={isUploading}
                className="btn-secondary gap-2"
              >
                {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <FileUp size={16} />}
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </button>
              <button type="button" onClick={onOpenCreate} className="btn-primary">
                New transaction
              </button>
            </>
          ) : null}
        </div>
      </div>

      {csvImportSummary ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="font-semibold text-slate-950 dark:text-white">
              Inserted: {csvImportSummary.insertedCount}
            </span>
            <span className="font-semibold text-rose-600 dark:text-rose-300">
              Failed: {csvImportSummary.failedCount}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {csvImportSummary.success ? 'Import finished.' : 'Import completed with issues.'}
            </span>
          </div>

          {csvImportSummary.errors?.length ? (
            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-rose-200 bg-white p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-slate-950 dark:text-rose-300">
              {csvImportSummary.errors.map((item, index) => (
                <p key={`${item}-${index}`}>{item}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default TransactionCsvControls;
