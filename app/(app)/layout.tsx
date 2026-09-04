"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/client/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
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
        <div className="flex flex-col p-4">
          {/* Brand / Logo */}
          <div className="mb-6 flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-black text-white shadow-xs">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-zinc-900">Encodr Lite</span>
                <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200/60">SaaS</span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500">Mactores Media Platform</p>
            </div>
          </div>

          {/* Section 1: MAIN NAVIGATION */}
          <div className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pipelines
            </p>
            <nav className="space-y-1">
              <Link
                href="/jobs"
                className={
                  isJobsActive
                    ? "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl font-semibold text-xs bg-zinc-900 text-white shadow-md shadow-zinc-900/20 transition-all"
                    : "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl font-semibold text-xs text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 transition-all"
                }
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                <span>Jobs Dashboard</span>
              </Link>
            </nav>
          </div>

          {/* Section 2: CLUSTER & ENGINE STATUS */}
          <div className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Engine Status
            </p>
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-zinc-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Transcoder Engine
                </span>
                <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  ONLINE
                </span>
              </div>
              <div className="border-t border-zinc-200/60 pt-2 text-[11px] text-zinc-500 space-y-1">
                <div className="flex justify-between">
                  <span>Target Codecs:</span>
                  <span className="font-mono font-semibold text-zinc-700">H.264 / AAC</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Formats:</span>
                  <span className="font-mono font-semibold text-zinc-700">1080p, 720p, 480p</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: QUICK REFERENCES */}
          <div className="mb-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Reference
            </p>
            <div className="space-y-1 text-xs font-medium text-zinc-600">
              <div className="px-3 py-2 rounded-xl bg-white border border-zinc-200/60 text-[11px] text-zinc-500">
                <p className="font-bold text-zinc-700 mb-0.5">Deterministic Simulation</p>
                <p className="text-[10px] text-zinc-400">0s Queue → 2s Download → 6s Transcode → 12s Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Logout Area */}
        <div className="border-t border-zinc-200/80 bg-white p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "DU"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-bold text-zinc-900">{user.name || "Demo User"}</p>
              </div>
              <p className="truncate text-[10px] text-zinc-500">{user.email}</p>
            </div>
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
        </header>

        {mobileNavOpen && (
          <div className="border-b border-zinc-200 bg-white p-4 md:hidden">
            <Link
              href="/jobs"
              onClick={() => setMobileNavOpen(false)}
              className="block rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Jobs Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
              className="mt-2 block w-full rounded-xl bg-rose-50 px-3 py-2 text-left text-xs font-semibold text-rose-600"
            >
              Sign out
            </button>
          </div>
        )}

        <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

