import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const ACCOUNT_DELETE_PROBATION_DAYS = 7;
export const ACCOUNT_DELETE_PROBATION_MS =
  ACCOUNT_DELETE_PROBATION_DAYS * 24 * 60 * 60 * 1000;

export function requestAccountDeletion(user) {
  const requestedAt = new Date();
  user.deletionRequestedAt = requestedAt;
  user.deletionScheduledFor = new Date(requestedAt.getTime() + ACCOUNT_DELETE_PROBATION_MS);
  return user;
}

export function cancelAccountDeletion(user) {
  user.deletionRequestedAt = null;
  user.deletionScheduledFor = null;
  return user;
}

export function hasPendingDeletion(user) {
  return Boolean(user?.deletionRequestedAt && user?.deletionScheduledFor);
}

export function isDeletionDue(user) {
  return hasPendingDeletion(user) && new Date(user.deletionScheduledFor).getTime() <= Date.now();
}

export async function permanentlyDeleteUser(userId) {
  await Promise.all([
    Transaction.deleteMany({ userId }),
    Portfolio.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
}
