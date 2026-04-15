import Link from "next/link";
import { SectionCard, SectionEyebrow } from "@/components/student-management/ui";

export default function NotFound() {
  return (
    <div className="app-shell student-scene">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="section-shell flex min-h-dvh items-center justify-center px-4 py-10">
        <SectionCard className="max-w-xl text-center">
          <SectionEyebrow>Page Not Found</SectionEyebrow>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground-strong)]">
            This route is not available in the student management system
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
            Use the admin login or go back to the protected dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="action-secondary px-5 py-3 text-sm font-semibold">
              Go To Login
            </Link>
            <Link href="/dashboard" className="action-primary px-5 py-3 text-sm font-semibold">
              Go To Dashboard
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
