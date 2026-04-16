"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/components/student-management/types";

type Mode = "guest" | "protected";
const SESSION_STORAGE_KEY = "pillai_admin_session_token";

export function useAdminSession(mode: Mode) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const sessionToken =
          typeof window !== "undefined"
            ? window.localStorage.getItem(SESSION_STORAGE_KEY)
            : null;

        const res = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
        });

        const data = await res.json().catch(() => null);
        if (!active) return;

        if (res.ok && data?.authenticated) {
          setUser({ email: data.user?.email ?? null });
          setError("");
          if (mode === "guest") {
            router.replace("/dashboard");
          }
        } else {
          setUser(null);
          if (mode === "protected") {
            router.replace("/");
          }
        }
      } catch (caught) {
        if (!active) return;
        setUser(null);
        setError(caught instanceof Error ? caught.message : "Unable to verify the admin session.");
        if (mode === "protected") {
          router.replace("/");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [mode, router]);

  return { user, loading, error };
}
