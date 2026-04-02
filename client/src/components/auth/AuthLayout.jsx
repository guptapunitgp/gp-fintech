function AuthLayout({ title, subtitle, children, aside }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(226,232,240,1)_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_20%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="panel hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
            GP Fintech
            </p>
            <h1 className="mt-4 max-w-sm text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Move from raw numbers to confident financial decisions.
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-500 dark:text-slate-400">
              Secure authentication, role-based access, premium analytics, and a
              responsive workspace built for modern finance teams.
            </p>
          </div>
          {aside}
        </section>

        <section className="panel flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthLayout;
