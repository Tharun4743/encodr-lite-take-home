"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@/lib/schemas";
import { useCreateJob, useJobs } from "@/lib/client/hooks";
import { ApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/status-badge";

export default function JobsPage() {
  const router = useRouter();
  const jobs = useJobs();
  const createJob = useCreateJob();
  const [autoStart, setAutoStart] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      sourceUrl: "",
      title: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await createJob.mutateAsync(values);
      reset({ sourceUrl: "", title: "" });
      if (autoStart && created?.id) {
        router.push(`/jobs/${created.id}?autostart=1`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CreateJobInput, {
              type: "server",
              message: messages[0],
            });
          }
        }
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to create job");
      }
    }
  });

  const isPending = isSubmitting || createJob.isPending;

  // Calculate Metrics from Jobs list
  const jobList = jobs.data ?? [];
  const totalJobs = jobList.length;
  const completedJobs = jobList.filter((j) => j.status === "COMPLETED").length;
  const runningJobs = jobList.filter((j) => j.status === "RUNNING").length;
  const failedJobs = jobList.filter((j) => j.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* 1. Consistent Enterprise Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Encodr / Overview
          </p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Jobs Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Submit media for cloud transcoding, monitor runs, and access multi-resolution renditions.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Stat Cards (4-Column Enterprise Grid) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Jobs */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Jobs</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-zinc-900">{totalJobs}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-zinc-900">{completedJobs}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Running / Active */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Processing</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-zinc-900">{runningJobs}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Failed */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Failed</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-zinc-900">{failedJobs}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" x2="9" y1="9" y2="15" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Create Encode Job Card */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-zinc-900">New Encode Job</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Submit an HTTP(S) media source URL to create a transcoding pipeline.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sourceUrl" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Source URL <span className="text-rose-500">*</span>
              </label>
              <input
                id="sourceUrl"
                {...register("sourceUrl")}
                type="url"
                placeholder="https://cdn.example.com/videos/nature-4k.mp4"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                disabled={isPending}
              />
              {errors.sourceUrl && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.sourceUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Job Title <span className="text-[10px] font-normal lowercase text-zinc-400">(optional)</span>
              </label>
              <input
                id="title"
                {...register("title")}
                type="text"
                placeholder="e.g. Nature Documentary 4K"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                disabled={isPending}
              />
              {errors.title && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500/20 accent-indigo-600"
              />
              <span>Auto-start encoding and view live progress immediately</span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              {isPending ? "Submitting Pipeline…" : "Create Encode Job"}
            </button>
          </div>
        </form>
      </section>

      {/* 4. Enterprise Data Table: All Jobs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">Encoding Pipelines</h2>
          <span className="text-xs font-semibold text-zinc-400">{totalJobs} total</span>
        </div>

        {jobs.isLoading && (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-xs font-semibold text-zinc-400">
            <span className="inline-block animate-pulse">Loading job records…</span>
          </div>
        )}

        {jobs.isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center justify-between">
            <span>Unable to retrieve job records.</span>
            <button
              type="button"
              onClick={() => jobs.refetch()}
              className="font-bold underline hover:text-rose-800"
            >
              Retry
            </button>
          </div>
        )}

        {jobs.data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h10" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-zinc-900">No encode jobs yet</h3>
            <p className="mt-1 text-xs text-zinc-500">Submit your first media source URL above to begin transcoding.</p>
          </div>
        )}

        {jobs.data && jobs.data.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Job Title & URL</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Created</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {jobs.data.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-zinc-900">{job.title}</p>
                      <p className="truncate max-w-xs text-[11px] font-mono text-zinc-500">{job.sourceUrl}</p>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 font-medium whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge value={job.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        Inspect
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


