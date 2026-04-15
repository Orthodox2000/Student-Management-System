import { InputField, SectionCard, SectionEyebrow } from "@/components/student-management/ui";

type AuthPanelProps = {
  authEmail: string;
  authPassword: string;
  authMessage: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onUseDemoCredentials: () => void;
};

export function AuthPanel({
  authEmail,
  authPassword,
  authMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onUseDemoCredentials,
}: AuthPanelProps) {
  return (
    <SectionCard className="auth-panel-shell" >
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionEyebrow>Access</SectionEyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">
            Admin Login
          </h2>
        </div>
        <button type="button" onClick={onUseDemoCredentials} className="action-secondary px-4 py-2 text-sm font-semibold">
          Autofill Test Details
        </button>
      </div>

      <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">
        Enter your email and password to continue.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {authMessage ? (
          <div className="rounded-[1.25rem] border border-amber-300/70 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
            {authMessage}
          </div>
        ) : null}

        <InputField
          label="Admin Email"
          type="email"
          value={authEmail}
          onChange={onEmailChange}
          required
          autoComplete="email"
          placeholder="admin@pillai.local"
        />
        <InputField
          label="Admin Password"
          type="password"
          value={authPassword}
          onChange={onPasswordChange}
          required
          autoComplete="current-password"
          placeholder="Admin@12345"
        />

        <button className="action-primary w-full justify-center px-4 py-3 text-sm font-semibold" type="submit">
          Login
        </button>
      </form>
    </SectionCard>
  );
}
