import { useEffect, useState } from "react";

type LandingPanelProps = {
  children: React.ReactNode;
  darkMode: boolean;
  connectionLoading: boolean;
  connectionStatus: string;
  onToggleTheme: () => void;
  onTestConnection: () => void;
  onShowLogin: () => void;
  onUseDemoCredentials: () => void;
};

export function LandingPanel({
  children,
  darkMode,
  connectionLoading,
  connectionStatus,
  onToggleTheme,
  onTestConnection,
  onShowLogin,
  onUseDemoCredentials,
}: LandingPanelProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <header className="section-shell sticky top-3 z-30 px-4 pt-3 sm:top-4 sm:px-6 sm:pt-5">
        <div className="surface-soft shell-bar flex items-center justify-between gap-3 rounded-[1.75rem] px-4 py-3 sm:px-5 lg:rounded-full">
          <div className="flex items-center gap-3">
            <span className="brand-wordmark">Pillai College</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-[var(--foreground-muted)] lg:flex">
            <button type="button" onClick={onTestConnection} className="nav-link-clean">
              {connectionLoading ? "Testing Supabase..." : "Test Supabase Connection"}
            </button>
            <button type="button" onClick={onShowLogin} className="nav-link-clean">Admin Login</button>
            <span className="nav-link-clean">Student Management</span>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggleTheme} className="theme-pill px-4 py-2 text-sm font-medium">
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <main className="section-shell px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="surface-soft inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--foreground-muted)]">
              <span className="status-dot" />
              Student Management System
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Pillai University Student Management System</p>
              <h1 className="display-title max-w-4xl">Login</h1>
              <p className="body-copy max-w-2xl">Sign in as admin to open the protected student management dashboard and the separate system checks workspace.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onUseDemoCredentials} className="action-primary px-6 py-4 text-sm font-semibold">
                Autofill Test Details
              </button>
              <div className="surface-soft inline-flex items-center rounded-full px-5 py-4 text-sm font-semibold text-[var(--foreground-strong)]">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
            <div className="surface-soft rounded-[1.6rem] p-5">
              <p className="eyebrow">Date</p>
              <p className="mt-3 text-base font-semibold text-[var(--foreground-strong)]">
                {now.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="surface-soft rounded-[1.6rem] p-5">
              <p className="eyebrow">Supabase Connection</p>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">{connectionStatus}</p>
            </div>
          </div>
          <div>{children}</div>
        </section>
      </main>
    </>
  );
}
