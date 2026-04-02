import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../components/common/SectionHeader';
import StatePanel from '../components/common/StatePanel';
import { useProfileStore } from '../store/useProfileStore';
import { formatCurrency, formatDateTime, formatPercent } from '../utils/formatters';
import { calculateExpenseRatio, calculateSavingsRate } from '../utils/finance';
import { useTransactionStore } from '../store/useTransactionStore';

const DELETE_PROBATION_DAYS = 7;

function ProfilePage() {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const isSaving = useProfileStore((state) => state.isSaving);
  const isDeleting = useProfileStore((state) => state.isDeleting);
  const isCancelingDeletion = useProfileStore((state) => state.isCancelingDeletion);
  const error = useProfileStore((state) => state.error);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const deleteAccount = useProfileStore((state) => state.deleteAccount);
  const cancelDeleteAccount = useProfileStore((state) => state.cancelDeleteAccount);
  const transactions = useTransactionStore((state) => state.transactions);
  const [form, setForm] = useState({ name: '', monthlyIncome: '', savingGoal: '' });

  useEffect(() => {
    if (!profile) {
      fetchProfile().catch(() => null);
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        monthlyIncome: profile.monthlyIncome || '',
        savingGoal: profile.savingGoal || '',
      });
    }
  }, [profile]);

  const savingsRate = calculateSavingsRate(transactions, Number(form.monthlyIncome) || 0);
  const expenseRatio = calculateExpenseRatio(transactions, Number(form.monthlyIncome) || 0);
  const hasDeletionRequest = Boolean(profile?.deletionRequestedAt && profile?.deletionScheduledFor);
  const deleteScheduledFor = profile?.deletionScheduledFor ? new Date(profile.deletionScheduledFor) : null;
  const deleteHint = useMemo(() => {
    if (!hasDeletionRequest) {
      return `You can request account deletion at any time. A ${DELETE_PROBATION_DAYS}-day probation starts, and logging in again during that time cancels the deletion request automatically.`;
    }

    return `Your account is scheduled for deletion on ${formatDateTime(deleteScheduledFor)}. If you log in again before then, the deletion request is canceled automatically.`;
  }, [deleteScheduledFor, hasDeletionRequest]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await updateProfile({
      name: form.name,
      monthlyIncome: Number(form.monthlyIncome) || 0,
      savingGoal: Number(form.savingGoal) || 0,
    }).catch(() => null);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Request account deletion? Your account will enter a 7-day probation period. Logging in again during that time will cancel the deletion request.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAccount();
    } catch (deleteError) {
      return deleteError;
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await cancelDeleteAccount();
    } catch (cancelError) {
      return cancelError;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Manage your financial profile"
        description="Set your name, monthly income, and optional saving goal so the dashboard can generate richer personal finance insights."
      />

      {isLoading && !profile ? (
        <StatePanel title="Loading profile" description="Fetching your saved profile settings." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="subtle-panel p-5 sm:p-6">
            <h3 className="section-title">Profile Settings</h3>
            <p className="section-copy">Update the inputs that drive your finance overview.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Monthly Income
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.monthlyIncome}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, monthlyIncome: event.target.value }))
                  }
                  className="field"
                  placeholder="Enter monthly income"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Saving Goal
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.savingGoal}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, savingGoal: event.target.value }))
                  }
                  className="field"
                  placeholder="Optional saving goal"
                />
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="subtle-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                Income Summary
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
                {formatCurrency(Number(form.monthlyIncome) || 0)}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Target goal: {formatCurrency(Number(form.savingGoal) || 0)}
              </p>
            </div>

            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Savings Rate
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">
                {formatPercent(savingsRate)}
              </p>
            </div>

            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Expense Ratio
              </p>
              <p className="mt-2 text-3xl font-extrabold text-rose-600 dark:text-rose-300">
                {formatPercent(expenseRatio)}
              </p>
            </div>

            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Account Safety
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Last login: {formatDateTime(profile?.lastLoginAt)}
              </p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {deleteHint}
              </p>
              {hasDeletionRequest ? (
                <button
                  type="button"
                  onClick={handleCancelDeletion}
                  disabled={isCancelingDeletion}
                  className="btn-secondary mt-4 w-full"
                >
                  {isCancelingDeletion ? 'Canceling request...' : 'Cancel deletion request'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="btn-secondary mt-4 w-full border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/20 dark:text-rose-300"
                >
                  {isDeleting ? 'Requesting deletion...' : 'Request account deletion'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
