function AuthForm({
  values,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  submitLabel,
  footer,
  includeName = false,
  includeRole = false,
  globalError = '',
  extraContent = null,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {includeName && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Full name
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            className="field"
            placeholder="Alex Morgan"
          />
          {errors.name && <p className="mt-2 text-xs text-rose-500">{errors.name}</p>}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Email
        </label>
        <input
          type="email"
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          className="field"
          placeholder="you@company.com"
        />
        {errors.email && <p className="mt-2 text-xs text-rose-500">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Password
        </label>
        <input
          type="password"
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
          className="field"
          placeholder="Minimum 6 characters"
        />
        {errors.password && <p className="mt-2 text-xs text-rose-500">{errors.password}</p>}
      </div>

      {includeRole && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Role
          </label>
          <select
            value={values.role}
            onChange={(event) => onChange('role', event.target.value)}
            className="field"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {globalError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {globalError}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : submitLabel}
      </button>
      {extraContent}
      {footer}
    </form>
  );
}

export default AuthForm;
