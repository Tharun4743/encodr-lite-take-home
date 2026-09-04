"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { jobKeys, useJob, useStartRun } from "@/lib/client/hooks";
import { useRunPolling } from "@/lib/client/use-run-polling";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/progress-bar";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const jobQuery = useJob(id);
  const startRun = useStartRun(id);

  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // When polling finishes, refresh the job query and job list
  const handleFinished = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: jobKeys.all });
  }, [queryClient, id]);

  const job = jobQuery.data;

  // Effective run ID: either newly started in-session, or the job's latest run
  const effectiveRunId = activeRunId ?? job?.latestRunId ?? null;
  const polling = useRunPolling(effectiveRunId, handleFinished);

  const handleStartRun = async () => {
    try {
      const res = await startRun.mutateAsync();
      setActiveRunId(res.runId);
    } catch {
      // Handled by mutation state
    }
  };

  if (jobQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 text-center text-xs font-semibold text-zinc-400">
        <span className="inline-block animate-pulse">Loading job pipeline details…</span>
      </div>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
        <p className="font-bold">Job Not Found</p>
        <p className="mt-1 text-rose-600">The requested encoding job could not be located in memory.</p>
        <Link href="/jobs" className="mt-3 inline-block font-bold text-rose-800 underline">
          ← Back to Jobs Dashboard
        </Link>
      </div>
    );
  }

  const run = polling.run;
  const isFailed = run?.stage === "FAILED" || (!run && job.status === "FAILED");
  const isCompleted = run?.stage === "COMPLETED" || (!run && job.status === "COMPLETED");
  const isRunning =
    startRun.isPending ||
    polling.polling ||
    (run && !isFailed && !isCompleted) ||
    (!run && job.status === "RUNNING");
  const isIdle = !isRunning && !isFailed && !isCompleted && !effectiveRunId;

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-3"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Jobs Dashboard
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Job Pipeline</span>
              <span className="font-mono text-[10px] text-zinc-400">ID: {job.id}</span>
            </div>
            <h1 className="truncate text-2xl font-black tracking-tight text-zinc-900">{job.title}</h1>
            <p className="truncate text-xs font-mono text-zinc-500 mt-0.5">{job.sourceUrl}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge value={run?.stage ?? job.status} />
          </div>
        </div>
      </div>

      {/* 2. Metadata / Stat Cards Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Protocol</p>
          <p className="mt-1 text-sm font-bold text-zinc-900 font-mono">
            {job.sourceUrl.startsWith("https") ? "HTTPS (Encrypted)" : "HTTP"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pipeline Status</p>
          <p className="mt-1 text-sm font-bold text-zinc-900">
            {isCompleted ? "Transcoding Done" : isFailed ? "Failed" : isRunning ? "Active" : "Awaiting Trigger"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Run</p>
          <p className="mt-1 text-sm font-bold text-zinc-900 font-mono truncate">
            {effectiveRunId ?? "None"}
          </p>
        </div>
      </div>

      {/* 3. IDLE STATE: Not yet started */}
      {isIdle && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900">Ready to Encode</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Click Start Encode to launch the transcoding pipeline and generate multi-bitrate renditions.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleStartRun}
              disabled={startRun.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {startRun.isPending ? "Starting Pipeline…" : "Start Encode"}
            </button>
          </div>
        </div>
      )}

      {/* 4. RUNNING STATE: Live Progress */}
      {isRunning && (
        <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Stage:</span>
              <StatusBadge value={run?.stage ?? "RUNNING"} />
            </div>
            <span className="text-sm font-black text-indigo-600 font-mono">
              {run ? `${run.progressPct}%` : "Starting…"}
            </span>
          </div>

          <ProgressBar value={run?.progressPct ?? 0} />

          {run?.message && (
            <p className="text-xs font-medium text-zinc-600 animate-pulse flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              {run.message}
            </p>
          )}

          {polling.fetchError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-medium text-amber-700">
              Notice: {polling.fetchError}
            </div>
          )}
        </div>
      )}

      {/* 5. FAILED STATE: Error display & Retry */}
      {isFailed && (
        <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Transcoding Exception</span>
              <StatusBadge value="FAILED" />
            </div>
            <span className="text-sm font-black text-rose-700 font-mono">
              {run ? `${run.progressPct}%` : ""}
            </span>
          </div>

          <ProgressBar value={run?.progressPct ?? 67} failed />

          <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Error Details</p>
            <p className="mt-1 text-xs font-mono text-zinc-700">
              {run?.error || "The transcoding engine encountered a corrupted video container."}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartRun}
              disabled={startRun.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-rose-700 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              {startRun.isPending ? "Restarting…" : "Retry Encode"}
            </button>
          </div>
        </div>
      )}

      {/* 6. COMPLETED STATE: Results & Renditions Table */}
      {isCompleted && (
        <div className="space-y-6 rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pipeline Finished</span>
              <StatusBadge value="COMPLETED" />
            </div>
            <span className="text-sm font-black text-emerald-600 font-mono">100%</span>
          </div>

          <ProgressBar value={100} />

          {run?.result && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Generated Renditions</h3>
                  <p className="text-[11px] text-zinc-500">Target resolutions ready for CDN distribution.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  Duration: {run.result.durationSec}s
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200/80">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rendition</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dimensions</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">File Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {run.result.renditions.map((rendition) => (
                      <tr key={rendition.label} className="hover:bg-zinc-50/70">
                        <td className="px-4 py-3 font-bold text-zinc-900">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
                            {rendition.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-600">
                          {rendition.width} × {rendition.height}
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-700">{rendition.sizeMb} MB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartRun}
              disabled={startRun.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              {startRun.isPending ? "Starting…" : "Re-encode Video"}
            </button>
          </div>
        </div>
      )}

      {/* 7. Activity Log (Terminal Card) */}
      {polling.log.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 font-mono text-xs text-zinc-300 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
              </span>
              <span className="text-[11px] font-bold text-zinc-400">Activity Stream</span>
            </div>
            <span className="text-[10px] text-zinc-500">{polling.log.length} entries</span>
          </div>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {polling.log.map((entry, index) => (
              <li key={index} className="flex items-center gap-2 text-zinc-300">
                <span className="text-zinc-500 select-none">[{index + 1}]</span>
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
