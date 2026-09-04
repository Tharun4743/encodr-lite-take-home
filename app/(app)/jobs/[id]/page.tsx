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
    return <p className="text-sm text-neutral-500">Loading job…</p>;
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="text-sm text-red-600">
        Job not found.{" "}
        <Link href="/jobs" className="underline">
          Back to jobs
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
      <Link href="/jobs" className="text-sm text-neutral-500 hover:underline">
        ← All jobs
      </Link>

      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-neutral-900">{job.title}</h1>
          <p className="truncate text-sm text-neutral-500">{job.sourceUrl}</p>
        </div>
        <StatusBadge value={run?.stage ?? job.status} />
      </div>

      {/* 1. IDLE STATE: Not yet started */}
      {isIdle && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-xs">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Ready to encode</h2>
          <p className="mb-4 text-sm text-neutral-600">
            Click start encode to begin transcoding this source video.
          </p>
          <button
            type="button"
            onClick={handleStartRun}
            disabled={startRun.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {startRun.isPending ? "Starting…" : "Start encode"}
          </button>
        </div>
      )}

      {/* 2. RUNNING STATE: Live Progress */}
      {isRunning && (
        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-800">Status:</span>
              <StatusBadge value={run?.stage ?? "RUNNING"} />
            </div>
            <span className="text-sm font-semibold text-neutral-700">
              {run ? `${run.progressPct}%` : "Starting…"}
            </span>
          </div>

          <ProgressBar value={run?.progressPct ?? 0} />

          {run?.message && (
            <p className="text-sm text-neutral-600 animate-pulse">{run.message}</p>
          )}

          {polling.fetchError && (
            <p className="text-xs text-amber-600">Network notice: {polling.fetchError}</p>
          )}
        </div>
      )}

      {/* 3. FAILED STATE: Error display & Retry */}
      {isFailed && (
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50/40 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-900">Transcode Failed</span>
              <StatusBadge value="FAILED" />
            </div>
            <span className="text-sm font-semibold text-red-700">
              {run ? `${run.progressPct}%` : ""}
            </span>
          </div>

          <ProgressBar value={run?.progressPct ?? 67} failed />

          <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
            <p className="font-semibold">Error details:</p>
            <p className="mt-0.5">{run?.error || "The transcoding process encountered a fatal error."}</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartRun}
              disabled={startRun.isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {startRun.isPending ? "Starting…" : "Retry encode"}
            </button>
          </div>
        </div>
      )}

      {/* 4. COMPLETED STATE: Results & Renditions Table */}
      {isCompleted && (
        <div className="space-y-6 rounded-lg border border-green-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-900">Transcode Complete</span>
              <StatusBadge value="COMPLETED" />
            </div>
            <span className="text-sm font-semibold text-green-700">100%</span>
          </div>

          <ProgressBar value={100} />

          {run?.result && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Generated Renditions</h3>
                <span className="text-xs text-neutral-500">
                  Total duration: {run.result.durationSec}s
                </span>
              </div>

              <div className="overflow-hidden rounded-md border border-neutral-200">
                <table className="w-full text-left text-sm text-neutral-600">
                  <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                    <tr>
                      <th className="px-4 py-2.5">Rendition</th>
                      <th className="px-4 py-2.5">Resolution</th>
                      <th className="px-4 py-2.5">File Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {run.result.renditions.map((rendition) => (
                      <tr key={rendition.label} className="hover:bg-neutral-50">
                        <td className="px-4 py-2.5 font-medium text-neutral-900">
                          {rendition.label}
                        </td>
                        <td className="px-4 py-2.5">
                          {rendition.width} × {rendition.height}
                        </td>
                        <td className="px-4 py-2.5">{rendition.sizeMb} MB</td>
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
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              {startRun.isPending ? "Starting…" : "Re-encode"}
            </button>
          </div>
        </div>
      )}

      {/* Activity / Progress Log (Rendered whenever logs exist) */}
      {polling.log.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-900 p-4 font-mono text-xs text-neutral-300">
          <p className="mb-2 font-semibold text-neutral-400">Activity Log:</p>
          <ul className="space-y-1">
            {polling.log.map((entry, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-neutral-500">[{index + 1}]</span>
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

