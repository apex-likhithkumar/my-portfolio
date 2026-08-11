import { describe, expect, it } from "vitest";
import type { TraceStage } from "@/content/projects";
import { CACHE_STAGE, stagesForMode, traceProgress, traceTotals } from "./trace";

// A deliberately small fixture rather than the real heroTrace: these tests are
// about the derivation rules, and pinning them to real copy would mean every
// content edit breaks the suite.
const STAGES: TraceStage[] = [
  { stage: "a.ingest", detail: "cheap", ms: 40, path: "det" },
  { stage: "b.think", detail: "expensive", ms: 600, path: "llm" },
  { stage: "c.lookup", detail: "cheap", ms: 20, path: "det" },
  { stage: "d.compose", detail: "expensive", ms: 500, path: "llm" },
];

describe("stagesForMode", () => {
  it("runs every stage on the cold path", () => {
    expect(stagesForMode(STAGES, "cold")).toEqual(STAGES);
  });

  it("drops model calls on the cached path and appends the cache read", () => {
    const cached = stagesForMode(STAGES, "cached");

    expect(cached.map((s) => s.stage)).toEqual(["a.ingest", "c.lookup", CACHE_STAGE.stage]);
    expect(cached.every((s) => s.path === "det")).toBe(true);
  });

  it("makes the cached path cheaper than the cold one — the whole point of the figure", () => {
    const cold = traceTotals(stagesForMode(STAGES, "cold")).totalMs;
    const cached = traceTotals(stagesForMode(STAGES, "cached")).totalMs;

    expect(cached).toBeLessThan(cold / 5);
  });

  it("does not mutate the input", () => {
    const before = structuredClone(STAGES);
    stagesForMode(STAGES, "cached");
    expect(STAGES).toEqual(before);
  });
});

describe("traceTotals", () => {
  it("sums latency and counts each path", () => {
    expect(traceTotals(STAGES)).toEqual({ totalMs: 1160, llmCalls: 2, detCalls: 2 });
  });

  it("handles an empty trace without dividing by anything", () => {
    expect(traceTotals([])).toEqual({ totalMs: 0, llmCalls: 0, detCalls: 0 });
  });
});

describe("traceProgress", () => {
  it("has nothing running before the clock starts", () => {
    const p = traceProgress(STAGES, 0);
    expect(p.completed).toBe(0);
    expect(p.activeIndex).toBe(0);
    expect(p.activeFraction).toBe(0);
    expect(p.done).toBe(false);
  });

  it("reports the in-flight stage and how far through it is", () => {
    // 40ms clears stage 0; 300ms into a 600ms stage 1 is halfway.
    const p = traceProgress(STAGES, 340);
    expect(p.completed).toBe(1);
    expect(p.activeIndex).toBe(1);
    expect(p.activeFraction).toBeCloseTo(0.5, 5);
    expect(p.done).toBe(false);
  });

  it("treats a stage boundary as the earlier stage being complete", () => {
    const p = traceProgress(STAGES, 40);
    expect(p.completed).toBe(1);
    expect(p.activeIndex).toBe(1);
    expect(p.activeFraction).toBe(0);
  });

  it("is done once the clock passes the total", () => {
    const p = traceProgress(STAGES, 1160);
    expect(p.completed).toBe(4);
    expect(p.activeIndex).toBeNull();
    expect(p.done).toBe(true);
  });

  it("clamps past the end rather than reporting a fifth stage", () => {
    const p = traceProgress(STAGES, 99_999);
    expect(p.completed).toBe(4);
    expect(p.activeIndex).toBeNull();
    expect(p.done).toBe(true);
  });

  it("ignores a negative clock instead of producing negative progress", () => {
    const p = traceProgress(STAGES, -50);
    expect(p.completed).toBe(0);
    expect(p.activeIndex).toBe(0);
    expect(p.activeFraction).toBe(0);
  });

  it("is immediately done on an empty trace", () => {
    const p = traceProgress([], 0);
    expect(p.completed).toBe(0);
    expect(p.activeIndex).toBeNull();
    expect(p.done).toBe(true);
  });

  it("reports elapsed latency, not wall-clock, so the ticking total stays honest", () => {
    // Halfway through stage 1: 40 done + 300 of 600.
    expect(traceProgress(STAGES, 340).elapsedMs).toBe(340);
    // Clamped at the total once finished.
    expect(traceProgress(STAGES, 5_000).elapsedMs).toBe(1160);
  });
});
