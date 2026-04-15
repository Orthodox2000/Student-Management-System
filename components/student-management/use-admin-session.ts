"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase-client";

type Mode = "guest" | "protected";

export function useAdminSession(mode: Mode) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setLoading(false);
          setError("");

          if (mode === "guest" && nextUser) {
            router.replace("/dashboard");
          }

          if (mode === "protected" && !nextUser) {
            router.replace("/");
          }
        },
        (nextError) => {
          if (!active) return;
          setError(nextError.message || "Unable to listen for authentication changes.");
          setLoading(false);
          if (mode === "protected") {
            router.replace("/");
          }
        },
      );

      return () => {
        active = false;
        unsubscribe();
      };
    } catch (caught) {
      if (!active) return;
      setError(caught instanceof Error ? caught.message : "Unable to initialize Firebase authentication.");
      setLoading(false);
      if (mode === "protected") {
        router.replace("/");
      }
    }

    return () => {
      active = false;
    };
  }, [mode, router]);

  return { user, loading, error };
}
