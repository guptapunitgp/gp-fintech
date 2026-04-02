export function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider || 'local',
    role: user.role,
    monthlyIncome: user.monthlyIncome ?? 0,
    savingGoal: user.savingGoal ?? 0,
    lastLoginAt: user.lastLoginAt ?? null,
    deletionRequestedAt: user.deletionRequestedAt ?? null,
    deletionScheduledFor: user.deletionScheduledFor ?? null,
  };
}
