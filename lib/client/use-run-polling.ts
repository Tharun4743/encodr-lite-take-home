"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { isTerminalStage, type EncodeRun } from "@/lib/types";

export interface RunPollingState {
  /** The latest run state we've received, or null before the first response. */
  run: EncodeRun | null;
  /** True while we're still asking the server for updates. */
  polling: boolean;
  /** A request failed (network, 404, …). Not the same thing as the RUN failing. */
  fetchError: string | null;
  /** Every message we've seen, oldest first — the log the UI renders. */
  log: string[];
}

const initialState: RunPollingState = {
  run: null,
  polling: false,
  fetchError: null,
  log: [],
};

export function useRunPolling(runId: string | null, onFinished?: () => void): RunPollingState {
  const [state, setState] = useState<RunPollingState>(initialState);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (!runId) {
      setState(initialState);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    setState({
      run: null,
      polling: true,
      fetchError: null,
      log: [],
    });

    async function poll() {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        const run = await api.get<EncodeRun>(`/api/runs/${runId}`);
        if (cancelled) return;

        setState((prev) => {
          const lastMsg = prev.log[prev.log.length - 1];
          const newLog = lastMsg === run.message ? prev.log : [...prev.log, run.message];
          const terminal = isTerminalStage(run.stage);

          return {
            run,
            polling: !terminal,
            fetchError: null,
            log: newLog,
          };
        });

        if (isTerminalStage(run.stage)) {
          if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
          onFinishedRef.current?.();
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to fetch run status";
        setState((prev) => ({
          ...prev,
          fetchError: msg,
        }));
      }
    }

    // Immediate initial poll
    void poll();

    // Periodic poll every 1 second
    intervalId = setInterval(() => {
      void poll();
    }, 1000);

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [runId]);

  return state;
}

