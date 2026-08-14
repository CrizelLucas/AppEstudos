"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const AUTH_PATHS = ["/login", "/signup"];

const NAV_ITEMS = [
  {
    href: "/",
    label: "Timer",
    path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    href: "/cronograma",
    label: "Cronograma",
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    href: "/questoes",
    label: "Questões",
    path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    href: "/revisoes",
    label: "Revisões",
    path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    href: "/configuracoes",
    label: "Config",
    path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 transition-colors dark:border-slate-800 dark:bg-[#0b0f19]/95">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2.5">
        {/* Brand / Logo */}
        <div className="hidden sm:flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
            ⏱️
          </span>
          <span className="text-sm tracking-tight font-extrabold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            Pomodoro BB
          </span>
        </div>

        {!isAuthPage && (
          <>
            {/* Navigation links */}
            <nav className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-1 overflow-x-auto scrollbar-none py-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-950 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {user && (
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <span className="max-w-[10rem] truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {(user.user_metadata.full_name as string | undefined) ||
                    user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  Sair
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}


