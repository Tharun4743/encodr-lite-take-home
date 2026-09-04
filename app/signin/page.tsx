"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { useAuth } from "@/lib/client/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@encodr.dev", password: "password123" },
  });

  useEffect(() => {
    if (ready && user) router.replace("/jobs");
  }, [ready, user, router]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.replace("/jobs");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Login failed");
    }
  });

  const handleDemoLogin = async () => {
    setValue("email", "demo@encodr.dev");
    setValue("password", "password123");
    setFormError(null);
    try {
      await login("demo@encodr.dev", "password123");
      router.replace("/jobs");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Demo login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 px-4 font-sans animate-fade-in">
      <div className="absolute top-4 right-4 animate-stagger-1">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm animate-page-enter">
        {/* Brand Header */}
        <div className="mb-6 text-center animate-stagger-1">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-black text-white shadow-xs transition-transform duration-300 hover:scale-105">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Encodr Lite</h1>
          <p className="mt-1 text-xs font-medium text-zinc-500">Sign in to access your media transcoding jobs</p>
        </div>

        {/* Enterprise Login Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs animate-stagger-2 card-hover">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                {...register("email")}
                type="email"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                autoComplete="username"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                {...register("password")}
                type="password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Authenticating…" : "Sign In to Platform"}
            </button>
          </form>
        </div>

        {/* 1-Click Demo Login Action Card */}
        <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-white p-4 text-center shadow-xs animate-stagger-3 card-hover">
          <p className="text-[11px] font-medium text-zinc-500 mb-2">
            Evaluating the platform? Use the pre-configured credentials:
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100/80 hover:text-indigo-800 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            1-Click Sign In as Demo User
          </button>
        </div>
      </div>
    </div>
  );
}

