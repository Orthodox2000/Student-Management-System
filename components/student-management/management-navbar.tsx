"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

export function ManagementNavbar({
  darkMode,
  email,
  items,
  onToggleTheme,
  onLogout,
}: {
  darkMode: boolean;
  email: string | null;
  items: NavItem[];
  onToggleTheme: () => void;
  onLogout: () => Promise<void> | void;
}) {
  const router = useRouter();
  const emailTag = email ? email.slice(0, 7) : "admin";

  async function handleLogout() {
    await onLogout();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="section-shell px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="surface-soft shell-bar rounded-[1.9rem] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="brand-wordmark text-[1.8rem] sm:text-[2rem]">Pillai College</span>
            <span className="badge-soft hidden sm:inline-flex">Admin</span>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="action-secondary px-4 py-2 text-sm font-semibold">
                {item.label}
              </Link>
            ))}
            <span className="surface-soft rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)]">
              {emailTag}
            </span>
            <button type="button" onClick={onToggleTheme} className="theme-pill px-4 py-2 text-sm font-medium">
              {darkMode ? "Light" : "Dark"}
            </button>
            <button type="button" onClick={() => void handleLogout()} className="action-primary px-5 py-2.5 text-sm font-semibold">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
