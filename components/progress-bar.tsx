import { clsx } from "clsx";

export function ProgressBar({ value, failed }: { value: number; failed?: boolean }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/60"
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx(
          "h-full transition-all duration-300 rounded-full",
          failed ? "bg-rose-500" : "bg-indigo-600",
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

