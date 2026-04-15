"use client";

import { useEffect, useState } from "react";

export function useThemeMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("sms-theme");
    const shouldDark = stored === "dark";
    setDarkMode(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  function toggleTheme() {
    setDarkMode((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("sms-theme", next ? "dark" : "light");
      return next;
    });
  }

  return { darkMode, toggleTheme };
}
