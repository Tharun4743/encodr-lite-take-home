"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { useAuth } from "@/lib/client/auth-context";

export default function SignInPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@encodr.dev", password: "" },
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 px-4 font-sans">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-black text-white shadow-xs">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Encodr Lite</h1>
          <p className="mt-1 text-xs font-medium text-zinc-500">Sign in to access your media transcoding jobs</p>
        </div>

        {/* Enterprise Login Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
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

        {/* Demo Credentials Pill */}
        <div className="mt-4 rounded-xl border border-zinc-200/60 bg-zinc-100/60 p-3 text-center text-[11px] font-medium text-zinc-500">
          <span className="font-bold text-zinc-700">Demo Account:</span>{" "}
          <span className="font-mono text-zinc-600">demo@encodr.dev</span> / <span className="font-mono text-zinc-600">password123</span>
        </div>
      </div>
    </div>
  );
}

