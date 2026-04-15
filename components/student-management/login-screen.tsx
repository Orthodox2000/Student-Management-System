"use client";

import { FormEvent, useRef, useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { LandingPanel } from "@/components/student-management/landing-panel";
import { AuthPanel } from "@/components/student-management/auth-panel";
import { SectionCard, SectionEyebrow } from "@/components/student-management/ui";
import { useAdminSession } from "@/components/student-management/use-admin-session";
import { useThemeMode } from "@/components/student-management/use-theme-mode";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { sanitizeEmail } from "@/lib/sanitize";

const demoCredentials = {
  email: process.env.NEXT_PUBLIC_ADMIN_LOGIN_EMAIL ?? "admin@pillai.local",
  password: process.env.NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD ?? "Admin@12345",
};

export function LoginScreen() {
  const authPanelRef = useRef<HTMLDivElement | null>(null);
  const { loading, error } = useAdminSession("guest");
  const { darkMode, toggleTheme } = useThemeMode();

  const [authEmail, setAuthEmail] = useState(demoCredentials.email);
  const [authPassword, setAuthPassword] = useState(demoCredentials.password);
  const [authMessage, setAuthMessage] = useState("");
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(
    "Not tested yet. Use the navbar button to verify that Firebase Auth is reachable in cloud mode.",
  );

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault();
    setAuthMessage("");

    try {
      const auth = getFirebaseAuth();
      const email = sanitizeEmail(authEmail);
      const password = authPassword.trim();
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Authentication failed");
      }

      await signInWithCustomToken(auth, data.customToken);
    } catch (caught) {
      setAuthMessage(caught instanceof Error ? caught.message : "Authentication failed");
    }
  }

  function handleUseDemoCredentials() {
    setAuthEmail(demoCredentials.email);
    setAuthPassword(demoCredentials.password);
    setAuthMessage("Test details are ready. Press login to continue.");
  }

  async function runFirebaseCheck() {
    setFirebaseLoading(true);
    try {
      const res = await fetch("/api/health/firebase");
      const data = await res.json();
      setFirebaseStatus(data.message ?? (res.ok ? "Firebase connection is healthy." : "Firebase connection failed."));
    } catch (caught) {
      setFirebaseStatus(caught instanceof Error ? caught.message : "Unable to check Firebase connectivity.");
    } finally {
      setFirebaseLoading(false);
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
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">Checking Firebase authentication before loading the admin login.</p>
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
        firebaseLoading={firebaseLoading}
        firebaseStatus={error || authMessage || firebaseStatus}
        onToggleTheme={toggleTheme}
        onTestFirebaseConnection={() => void runFirebaseCheck()}
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
