"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/client/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [roleTitle, setRoleTitle] = useState("Lead Media Architect");
  const [department, setDepartment] = useState("Encoding Systems");
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
      {/* 1. Page Header */}
      <div className="border-b border-zinc-200/80 pb-4 animate-stagger-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Platform Settings</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage your account identity, profile details, and workspace appearance preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session Verified
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-slide-up flex items-center gap-2 shadow-xs">
          <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile settings saved successfully! All workspace headers and sessions have been updated.
        </div>
      )}

      {/* 2. 16:9 Widescreen Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Identity Management (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs animate-stagger-2 card-hover">
            {/* Header Avatar & Presets */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-xs">
                  {initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">{name || "Demo User"}</h2>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{email || "demo@encodr.dev"}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
                      {roleTitle}
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                      {department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Role Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "Demo Admin", email: "demo@encodr.dev", role: "Platform Admin", dept: "Operations" },
                  { label: "Lead Engineer", email: "lead.engineer@encodr.dev", role: "Media Specialist", dept: "Infrastructure" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setName(preset.label);
                      setEmail(preset.email);
                      setRoleTitle(preset.role);
                      setDepartment(preset.dept);
                    }}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
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

                <div>
                  <label htmlFor="settings-role" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Role Title
                  </label>
                  <input
                    id="settings-role"
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="settings-dept" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Department
                  </label>
                  <input
                    id="settings-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                  Save Profile Changes
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Preferences, System Specs & Session (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Appearance & Theme Preference */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs animate-stagger-3 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Appearance</h2>
                <p className="text-[11px] text-zinc-500">Theme color scheme</p>
              </div>
              <ThemeToggle />
            </div>
            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              Select between light and dark themes. Preference is stored locally and syncs across views.
            </p>
          </section>

          {/* Engine Specs */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs animate-stagger-3 card-hover">
            <h2 className="text-sm font-bold text-zinc-900 mb-2">Transcoding Engine</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">State Machine</span>
                <span className="font-mono font-bold text-zinc-800">Pure Deterministic</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Max Duration</span>
                <span className="font-mono font-bold text-zinc-800">12.0s</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 font-medium">Output Renditions</span>
                <span className="font-mono font-bold text-indigo-600">1080p, 720p, 480p</span>
              </div>
            </div>
          </section>

          {/* Session & Sign Out */}
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
