import { describe, expect, it } from "vitest";
import { computeRun, FAIL_URL, type RunRecord } from "@/lib/server/store";
import { TIMELINE } from "@/lib/types";

describe("computeRun state machine", () => {
  const baseStartedAt = 1_000_000;
  const normalRecord: RunRecord = {
    id: "r_test_normal",
    jobId: "j_test_normal",
    sourceUrl: "https://cdn.example.com/videos/sample.mp4",
    startedAt: baseStartedAt,
  };

  const corruptRecord: RunRecord = {
    id: "r_test_corrupt",
    jobId: "j_test_corrupt",
    sourceUrl: FAIL_URL,
    startedAt: baseStartedAt,
  };

  it("returns QUEUED at elapsed = 0ms with 0% progress", () => {
    const run = computeRun(normalRecord, baseStartedAt);
    expect(run.id).toBe(normalRecord.id);
    expect(run.jobId).toBe(normalRecord.jobId);
    expect(run.stage).toBe("QUEUED");
    expect(run.progressPct).toBe(0);
    expect(run.message).toBeDefined();
    expect(run.error).toBeUndefined();
    expect(run.result).toBeUndefined();
  });

  it("remains QUEUED before 2000ms boundary", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.queuedEndsMs - 1);
    expect(run.stage).toBe("QUEUED");
    expect(run.progressPct).toBeLessThan(17);
  });

  it("transitions to DOWNLOADING exactly at 2000ms", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.queuedEndsMs);
    expect(run.stage).toBe("DOWNLOADING");
    expect(run.progressPct).toBeGreaterThanOrEqual(16);
  });

  it("remains DOWNLOADING before 6000ms boundary", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.downloadingEndsMs - 1);
    expect(run.stage).toBe("DOWNLOADING");
    expect(run.progressPct).toBeLessThan(50);
  });

  it("transitions to TRANSCODING exactly at 6000ms", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.downloadingEndsMs);
    expect(run.stage).toBe("TRANSCODING");
    expect(run.progressPct).toBe(50);
  });

  it("remains TRANSCODING before 12000ms boundary", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.transcodingEndsMs - 1);
    expect(run.stage).toBe("TRANSCODING");
    expect(run.progressPct).toBeLessThan(100);
    expect(run.result).toBeUndefined();
  });

  it("transitions to COMPLETED at 12000ms with 100% progress and result renditions", () => {
    const run = computeRun(normalRecord, baseStartedAt + TIMELINE.transcodingEndsMs);
    expect(run.stage).toBe("COMPLETED");
    expect(run.progressPct).toBe(100);
    expect(run.result).toBeDefined();
    expect(run.result?.renditions.length).toBeGreaterThan(0);
    expect(run.error).toBeUndefined();
  });

  it("remains COMPLETED after 12000ms", () => {
    const run = computeRun(normalRecord, baseStartedAt + 20_000);
    expect(run.stage).toBe("COMPLETED");
    expect(run.progressPct).toBe(100);
    expect(run.result).toBeDefined();
  });

  describe("corrupt source URL failure handling", () => {
    it("behaves normally before failAtMs (e.g. 7000ms)", () => {
      const run = computeRun(corruptRecord, baseStartedAt + 7_000);
      expect(run.stage).toBe("TRANSCODING");
      expect(run.error).toBeUndefined();
    });

    it("fails exactly at 8000ms with FAILED stage, error message, and frozen progress", () => {
      const run = computeRun(corruptRecord, baseStartedAt + TIMELINE.failAtMs);
      expect(run.stage).toBe("FAILED");
      expect(run.error).toBeDefined();
      expect(run.result).toBeUndefined();
      expect(run.progressPct).toBe(Math.round((TIMELINE.failAtMs / TIMELINE.transcodingEndsMs) * 100));
    });

    it("remains FAILED after 12000ms completion mark", () => {
      const run = computeRun(corruptRecord, baseStartedAt + 15_000);
      expect(run.stage).toBe("FAILED");
      expect(run.error).toBeDefined();
      expect(run.result).toBeUndefined();
      expect(run.progressPct).toBe(Math.round((TIMELINE.failAtMs / TIMELINE.transcodingEndsMs) * 100));
    });
  });
});
