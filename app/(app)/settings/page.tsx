"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/client/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DU";

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateUser({
      name: name.trim(),
      email: email.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Page Header */}
      <div className="border-b border-zinc-200/80 pb-4 animate-stagger-1">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your account profile details and workspace appearance.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-slide-up flex items-center gap-2 shadow-xs">
          <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile updated successfully!
        </div>
      )}

      {/* 2-Column Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Edit Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs animate-stagger-2 card-hover">
            {/* Header Avatar & Identity */}
            <div className="mb-6 flex items-center gap-4 pb-5 border-b border-zinc-100">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-xs">
                {initials}
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">{name || "Demo User"}</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{email || "demo@encodr.dev"}</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="settings-email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end border-t border-zinc-100">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-98"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Appearance & Session (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Appearance & Theme Card */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs animate-stagger-3 card-hover">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Appearance</h2>
                <p className="text-[11px] text-zinc-500">Color theme</p>
              </div>
              <ThemeToggle />
            </div>
            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              Switch between light and dark themes.
            </p>
          </section>

          {/* Session & Sign Out Card */}
          <section className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs animate-stagger-4 card-hover">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-rose-900">Active Session</h2>
              <p className="text-[11px] text-rose-700 font-mono truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-rose-700"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign Out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
