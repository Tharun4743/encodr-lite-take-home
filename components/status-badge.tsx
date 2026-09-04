import { clsx } from "clsx";
import type { JobStatus, Stage } from "@/lib/types";

const STYLES: Record<string, { badge: string; dot: string }> = {
  NEW: {
    badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-400",
  },
  QUEUED: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  DOWNLOADING: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  TRANSCODING: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500 animate-pulse",
  },
  RUNNING: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500 animate-pulse",
  },
  COMPLETED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  FAILED: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export function StatusBadge({ value }: { value: JobStatus | Stage }) {
  const config = STYLES[value] ?? {
    badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
        config.badge,
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {value}
    </span>
  );
}

