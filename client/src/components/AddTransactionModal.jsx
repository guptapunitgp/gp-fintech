import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useUiStore } from '../store/useUiStore';

const initialForm = {
  date: '',
  amount: '',
  category: '',
  type: 'expense',
};

function AddTransactionModal() {
  const role = useAuthStore((state) => state.role);
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const isSaving = useTransactionStore((state) => state.isSaving);
  const { isOpen, mode, transaction } = useUiStore((state) => state.transactionModal);
  const closeTransactionModal = useUiStore((state) => state.closeTransactionModal);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        transaction
          ? {
              date: transaction.date.slice(0, 10),
              amount: transaction.amount,
              category: transaction.category,
              type: transaction.type,
            }
          : {
              ...initialForm,
              date: new Date().toISOString().slice(0, 10),
            },
      );
      setErrors({});
    }
  }, [isOpen, transaction]);

  if (!isOpen || role !== 'admin') {
    return null;
  }

  const validate = () => {
    const nextErrors = {};

    if (!form.date) {
      nextErrors.date = 'Date is required.';
    }

    if (!form.category.trim()) {
      nextErrors.category = 'Category is required.';
    }

    const amountValue = Number(form.amount);
    if (!form.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      nextErrors.amount = 'Enter a valid amount greater than zero.';
    }

    if (!['income', 'expense'].includes(form.type)) {
      nextErrors.type = 'Choose a valid transaction type.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      title: form.category.trim(),
      date: form.date,
      amount: Number(form.amount),
      category: form.category.trim(),
      type: form.type,
    };

    try {
      const transactionId = transaction?._id ?? transaction?.id;

      if (mode === 'edit' && transactionId) {
        await updateTransaction(transactionId, payload);
      } else {
        await createTransaction(payload);
      }
      closeTransactionModal();
    } catch (error) {
      return error;
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="panel w-full max-w-lg p-5 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              {mode === 'edit' ? 'Edit transaction' : 'Add transaction'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create or update an income or expense entry.
            </p>
          </div>
          <button
            type="button"
            onClick={closeTransactionModal}
            className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className="field"
            />
            {errors.date && <p className="mt-2 text-xs text-rose-500">{errors.date}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField('amount', event.target.value)}
              placeholder="Enter amount"
              className="field"
            />
            {errors.amount && <p className="mt-2 text-xs text-rose-500">{errors.amount}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="e.g. Salary, Food, Travel"
              className="field"
            />
            {errors.category && (
              <p className="mt-2 text-xs text-rose-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Type
            </label>
            <select
              value={form.type}
              onChange={(event) => updateField('type', event.target.value)}
              className="field"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {errors.type && <p className="mt-2 text-xs text-rose-500">{errors.type}</p>}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeTransactionModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : mode === 'edit'
                  ? 'Update transaction'
                  : 'Save transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
