"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPanel } from "@/components/student-management/landing-panel";
import { AuthPanel } from "@/components/student-management/auth-panel";
import { SectionCard, SectionEyebrow } from "@/components/student-management/ui";
import { useAdminSession } from "@/components/student-management/use-admin-session";
import { useThemeMode } from "@/components/student-management/use-theme-mode";
import { sanitizeEmail } from "@/lib/sanitize";

const demoCredentials = {
  email: process.env.NEXT_PUBLIC_ADMIN_LOGIN_EMAIL ?? "",
  password: process.env.NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD ?? "",
};

const SESSION_STORAGE_KEY = "pillai_admin_session_token";

export function LoginScreen() {
  const router = useRouter();
  const authPanelRef = useRef<HTMLDivElement | null>(null);
  const { loading, error } = useAdminSession("guest");
  const { darkMode, toggleTheme } = useThemeMode();

  const [authEmail, setAuthEmail] = useState(demoCredentials.email);
  const [authPassword, setAuthPassword] = useState(demoCredentials.password);
  const [authMessage, setAuthMessage] = useState("");
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    "Not tested yet. Use the navbar button to verify that Supabase database and storage are reachable.",
  );

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault();
    setAuthMessage("");

    try {
      const email = sanitizeEmail(authEmail);
      const password = authPassword.trim();
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Authentication failed");
      }

      if (typeof window !== "undefined" && typeof data.sessionToken === "string") {
        window.localStorage.setItem(SESSION_STORAGE_KEY, data.sessionToken);
      }

      const sessionRes = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers:
          typeof data.sessionToken === "string"
            ? { Authorization: `Bearer ${data.sessionToken}` }
            : undefined,
      });

      if (!sessionRes.ok) {
        const sessionData = await sessionRes.json().catch(() => null);
        throw new Error(sessionData?.error ?? "Login succeeded but the admin session could not be verified.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setAuthMessage(caught instanceof Error ? caught.message : "Authentication failed");
    }
  }

  function handleUseDemoCredentials() {
    if (!demoCredentials.email || !demoCredentials.password) {
      setAuthMessage("Public demo autofill is not enabled for this environment.");
      return;
    }

    setAuthEmail(demoCredentials.email);
    setAuthPassword(demoCredentials.password);
    setAuthMessage("Test details are ready. Press login to continue.");
  }

  async function runSupabaseCheck() {
    setConnectionLoading(true);
    try {
      const res = await fetch("/api/health/supabase", {
        credentials: "include",
      });
      const data = await res.json();
      setConnectionStatus(data.message ?? (res.ok ? "Supabase connection is healthy." : "Supabase connection failed."));
    } catch (caught) {
      setConnectionStatus(caught instanceof Error ? caught.message : "Unable to check Supabase connectivity.");
    } finally {
      setConnectionLoading(false);
    }
  }

  function scrollToAuth() {
    authPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="app-shell student-scene">
        <div className="section-shell flex min-h-dvh items-center justify-center px-4 py-10">
          <SectionCard className="max-w-md text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent-strong)]" />
            <SectionEyebrow>Initializing</SectionEyebrow>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--foreground-strong)]">Preparing secure student workspace</h1>
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">Checking the admin session before loading the login screen.</p>
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
      <LandingPanel
        darkMode={darkMode}
        connectionLoading={connectionLoading}
        connectionStatus={error || authMessage || connectionStatus}
        onToggleTheme={toggleTheme}
        onTestConnection={() => void runSupabaseCheck()}
        onShowLogin={scrollToAuth}
        onUseDemoCredentials={() => {
          handleUseDemoCredentials();
          scrollToAuth();
        }}
      >
        <div ref={authPanelRef}>
          <AuthPanel
            authEmail={authEmail}
            authPassword={authPassword}
            authMessage={error || authMessage}
            onEmailChange={(value) => setAuthEmail(sanitizeEmail(value))}
            onPasswordChange={setAuthPassword}
            onSubmit={handleAuthSubmit}
            onUseDemoCredentials={handleUseDemoCredentials}
          />
        </div>
      </LandingPanel>
    </div>
  );
}
