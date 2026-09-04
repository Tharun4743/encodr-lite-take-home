"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/client/auth-context";
import { useJobs } from "@/lib/client/hooks";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const jobsQuery = useJobs();
  const jobs = jobsQuery.data ?? [];
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/signin");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-xs font-semibold text-zinc-500">
        Authenticating session…
      </div>
    );
  }

  const isJobsActive = pathname.startsWith("/jobs");

  return (
    <div className="flex min-h-screen bg-zinc-50/50 font-sans">
      {/* Desktop Enterprise Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white md:flex h-screen sticky top-0 justify-between">
        <div className="flex flex-col p-4 flex-1 min-h-0">
          {/* Brand / Logo */}
          <div className="mb-6 flex items-center gap-2.5 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-black text-white shadow-xs">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-zinc-900">Encodr Lite</span>
              <p className="text-[10px] font-medium text-zinc-500">Mactores Media Platform</p>
            </div>
          </div>

          {/* Section 1: MAIN NAVIGATION */}
          <div className="mb-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pipelines
            </p>
            <nav className="space-y-1">
              <Link
                href="/jobs"
                className={
                  isJobsActive && pathname.startsWith("/jobs")
                    ? "flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-semibold text-xs bg-zinc-900 text-white shadow-md shadow-zinc-900/20 transition-all"
                    : "flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-semibold text-xs text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 transition-all"
                }
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  <span>Jobs Dashboard</span>
                </div>
                {jobs.length > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isJobsActive && pathname.startsWith("/jobs") ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {jobs.length}
                  </span>
                )}
              </Link>

              <Link
                href="/settings"
                className={
                  pathname === "/settings"
                    ? "flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-semibold text-xs bg-zinc-900 text-white shadow-md shadow-zinc-900/20 transition-all"
                    : "flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-semibold text-xs text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 transition-all"
                }
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Settings</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Section 2: RECENT PIPELINES (Inspect & List Jobs) */}
          <div className="flex-1 overflow-y-auto min-h-0 mb-3 pr-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Recent Pipelines
              </p>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">{jobs.length} total</span>
            </div>

            {jobs.length === 0 ? (
              <div className="px-3 py-3 rounded-xl bg-zinc-50/80 border border-zinc-200/60 text-center">
                <p className="text-[11px] font-medium text-zinc-500">No jobs created yet</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Create your first encode on dashboard</p>
              </div>
            ) : (
              <div className="space-y-1">
                {jobs.slice(0, 8).map((job) => {
                  const isActive = pathname === `/jobs/${job.id}`;
                  return (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className={
                        isActive
                          ? "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white shadow-xs transition-all"
                          : "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 transition-all"
                      }
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs font-bold">{job.title}</p>
                        <p className={`truncate text-[10px] font-mono ${isActive ? "text-zinc-400" : "text-zinc-400"}`}>
                          {job.id}
                        </p>
                      </div>
                      <StatusBadge value={job.status} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User Profile & Logout Area */}
        <div className="border-t border-zinc-200/80 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/60">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "DU"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-zinc-900">{user.name || "Demo User"}</p>
                <p className="truncate text-[10px] text-zinc-500">{user.email}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-rose-50 hover:text-rose-600"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white px-4 md:hidden">
          <Link href="/jobs" className="flex items-center gap-2 font-black text-sm text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">
              ▶
            </span>
            Encodr Lite
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Toggle navigation"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {mobileNavOpen && (
          <div className="border-b border-zinc-200 bg-white p-4 md:hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500">Theme</span>
              <ThemeToggle />
            </div>
            <div className="space-y-1.5">
              <Link
                href="/jobs"
                onClick={() => setMobileNavOpen(false)}
                className="block rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
              >
                Jobs Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileNavOpen(false)}
                className="block rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-200"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  logout();
                }}
                className="block w-full rounded-xl bg-rose-50 px-3 py-2 text-left text-xs font-semibold text-rose-600"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <main key={pathname} className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto animate-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

