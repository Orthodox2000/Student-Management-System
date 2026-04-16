"use client";

import { useEffect, useState } from "react";
import { ManagementNavbar } from "@/components/student-management/management-navbar";
import { SectionCard, SectionEyebrow } from "@/components/student-management/ui";
import { useAdminSession } from "@/components/student-management/use-admin-session";
import { useThemeMode } from "@/components/student-management/use-theme-mode";

const defaultChecks = {
  "/api/health/supabase": "Ready to test Supabase database and storage.",
  "/api/health": "Ready to test API and Supabase status.",
  "/api/health/live": "Ready to test app liveness.",
  "/api/health/ready": "Ready to test readiness and data access.",
  "/api/health/self-test": "Ready to test internal startup probes.",
  "/api/health/routes": "Ready to inspect available API routes.",
  "/api/auth/me": "Requires admin login. This page can test it after auth is active.",
  "/api/students": "Requires admin login. This page can test it after auth is active.",
} as const;
const SESSION_STORAGE_KEY = "pillai_admin_session_token";

export function ChecksScreen() {
  const { user, loading } = useAdminSession("protected");
  const { darkMode, toggleTheme } = useThemeMode();
  const [checks, setChecks] = useState<Record<string, string>>(defaultChecks);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState("Run the checks to confirm Supabase, API, and protected route connectivity.");

  useEffect(() => {
    if (!user) return;
    void runChecks();
  }, [user]);

  async function testEndpoint(endpoint: string) {
    try {
      const sessionToken =
        typeof window !== "undefined"
          ? window.localStorage.getItem(SESSION_STORAGE_KEY)
          : null;

      const res = await fetch(endpoint, {
        cache: "no-store",
        credentials: "include",
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
      });
      const data = await res.json().catch(() => null);
      const message = data?.message || data?.error || data?.status || "ok";
      return res.ok ? `ok - ${message}` : `failed (${res.status}) - ${message}`;
    } catch (caught) {
      return caught instanceof Error ? `failed - ${caught.message}` : "failed";
    }
  }

  async function runChecks() {
    setRunning(true);
    const nextChecks: Record<string, string> = {};

    nextChecks["/api/health/supabase"] = await testEndpoint("/api/health/supabase");
    nextChecks["/api/health"] = await testEndpoint("/api/health");
    nextChecks["/api/health/live"] = await testEndpoint("/api/health/live");
    nextChecks["/api/health/ready"] = await testEndpoint("/api/health/ready");
    nextChecks["/api/health/self-test"] = await testEndpoint("/api/health/self-test");
    nextChecks["/api/health/routes"] = await testEndpoint("/api/health/routes");
    nextChecks["/api/auth/me"] = await testEndpoint("/api/auth/me");
    nextChecks["/api/students"] = await testEndpoint("/api/students");

    setChecks(nextChecks);
    const failedCount = Object.values(nextChecks).filter((value) => value.startsWith("failed")).length;
    setSummary(failedCount === 0 ? "All system checks passed." : `${failedCount} check(s) need attention.`);
    setRunning(false);
  }

  async function handleLogout() {
    const sessionToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SESSION_STORAGE_KEY)
        : null;

    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  if (loading) {
    return (
      <div className="app-shell student-scene">
        <div className="section-shell flex min-h-dvh items-center justify-center px-4 py-10">
          <SectionCard className="max-w-md text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent-strong)]" />
            <SectionEyebrow>Loading Checks</SectionEyebrow>
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">Preparing the protected system checks workspace.</p>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell student-scene">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <ManagementNavbar
        darkMode={darkMode}
        email={user?.email ?? null}
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/checks", label: "System Checks" },
        ]}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <main className="section-shell px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-6">
        <SectionCard className="panel-spotlight">
          <SectionEyebrow>System Checks</SectionEyebrow>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground-strong)] sm:text-4xl">
            Supabase, API, and protected route diagnostics
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--foreground-muted)] sm:text-base">
            This page holds all operational connection tests so the main dashboard can stay focused on student management work.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void runChecks()} className="action-primary px-5 py-3 text-sm font-semibold">
              {running ? "Running Checks..." : "Run All Checks"}
            </button>
            <span className="surface-soft rounded-full px-4 py-2 text-sm text-[var(--foreground-strong)]">
              {summary}
            </span>
          </div>
        </SectionCard>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(checks).map(([endpoint, status]) => (
            <SectionCard key={endpoint}>
              <p className="eyebrow">Connection Test</p>
              <h2 className="mt-3 text-lg font-semibold text-[var(--foreground-strong)]">{endpoint}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">{status}</p>
            </SectionCard>
          ))}
        </section>
      </main>
    </div>
  );
}
