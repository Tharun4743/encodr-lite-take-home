"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/client/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [roleTitle, setRoleTitle] = useState("Lead Media Architect");

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
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* 1. Page Header */}
      <div className="border-b border-zinc-200/80 pb-4 animate-stagger-1">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your account identity, profile details, and workspace appearance preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-slide-up flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile settings saved successfully! All workspace headers and sessions have been updated.
        </div>
      )}

      {/* 2. Profile Details Section */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs animate-stagger-2 card-hover">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-xs">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">{name || "Demo User"}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{email || "demo@encodr.dev"}</p>
              <span className="inline-block mt-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
                {roleTitle}
              </span>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1.5">
            {[
              { label: "Demo Admin", email: "demo@encodr.dev", role: "Platform Admin" },
              { label: "Lead Engineer", email: "lead.engineer@encodr.dev", role: "Media Specialist" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setName(preset.label);
                  setEmail(preset.email);
                  setRoleTitle(preset.role);
                }}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

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

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-98"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>

      {/* 3. Appearance & Theme Preference */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs animate-stagger-3 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Appearance & Theme</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize the platform color scheme across light and dark modes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* 4. Session & Sign Out */}
      <section className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-6 shadow-xs animate-stagger-4 card-hover flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-rose-900">Active Session</h2>
          <p className="text-xs text-rose-700 mt-0.5">
            Signed in as <span className="font-bold font-mono">{user?.email}</span>. Click to terminate current session.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-rose-700"
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
  );
}
