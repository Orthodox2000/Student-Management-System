type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  required?: boolean;
  error?: string;
};

export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`surface-panel rounded-[2rem] p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="surface-panel reveal rounded-[1.75rem] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">{note}</p>
    </article>
  );
}

export function FeatureTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-soft rounded-[1.5rem] p-4">
      <p className="text-base font-semibold text-[var(--foreground-strong)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--foreground-muted)]">{body}</p>
    </div>
  );
}

export function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-[1.15rem] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-[var(--foreground-strong)]">{value}</p>
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  min,
  max,
  maxLength,
  required,
  error,
}: InputFieldProps) {
  return (
    <label className="field-label">
      {label}
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`field-input mt-2 ${error ? "field-input-error" : ""}`}
      />
      {error ? <span className="mt-2 block text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="field-label">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`field-input mt-2 ${error ? "field-input-error" : ""}`}
      >
        {children}
      </select>
      {error ? <span className="mt-2 block text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="field-label sm:col-span-2">
      {label}
      <textarea
        rows={4}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`field-input mt-2 min-h-28 resize-y ${error ? "field-input-error" : ""}`}
      />
      {error ? <span className="mt-2 block text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}
