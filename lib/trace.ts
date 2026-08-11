import type { TraceStage } from "@/content/projects";

/**
 * Pure derivation for the hero trace figure.
 *
 * Kept out of the component on purpose: the interesting parts (which stages a
 * cache hit skips, where the playhead is at time t) are arithmetic, and
 * arithmetic is worth testing without a DOM or fake timers. The component owns
 * the clock; this file owns the meaning.
 */

export type TraceMode = "cold" | "cached";

/**
 * Stands in for the model calls a cache hit avoids. Its latency is what a Redis
 * round-trip actually costs, which is the comparison that makes the figure
 * worth showing at all.
 */
export const CACHE_STAGE: TraceStage = {
  stage: "cache.hit",
  detail: "reply served from cache",
  ms: 8,
  path: "det",
};

/**
 * Cold path runs everything. Cached path keeps the deterministic stages and
 * replaces every model call with a single cache read — the short-circuit the
 * site's whole argument rests on.
 *
 * Returns a new array; callers animate over this and must not see it mutate
 * underneath them.
 */
export function stagesForMode(stages: TraceStage[], mode: TraceMode): TraceStage[] {
  if (mode === "cold") return [...stages];
  return [...stages.filter((s) => s.path === "det"), CACHE_STAGE];
}

export type TraceTotals = {
  totalMs: number;
  llmCalls: number;
  detCalls: number;
};

export function traceTotals(stages: TraceStage[]): TraceTotals {
  let totalMs = 0;
  let llmCalls = 0;
  let detCalls = 0;

  for (const s of stages) {
    totalMs += s.ms;
    if (s.path === "llm") llmCalls += 1;
    else detCalls += 1;
  }

  return { totalMs, llmCalls, detCalls };
}

export type TraceProgress = {
  /** Stages fully finished. */
  completed: number;
  /** Stage currently running, or null once the trace is done. */
  activeIndex: number | null;
  /** How far through the active stage, 0–1. */
  activeFraction: number;
  /** Latency consumed so far, clamped to the total. Drives the ticking counter. */
  elapsedMs: number;
  done: boolean;
};

/**
 * Where the playhead sits after `elapsedMs` of simulated latency.
 *
 * A stage boundary counts as the earlier stage being complete, so at exactly
 * 40ms of a 40ms stage the stage is done rather than 100% in flight — otherwise
 * the last frame of every stage would render as unfinished.
 */
export function traceProgress(stages: TraceStage[], elapsedMs: number): TraceProgress {
  const total = stages.reduce((n, s) => n + s.ms, 0);
  // Clamping both ends keeps a paused tab (huge delta) or a clock that ran
  // backwards from producing an out-of-range stage index.
  const clock = Math.min(Math.max(elapsedMs, 0), total);

  if (stages.length === 0) {
    return { completed: 0, activeIndex: null, activeFraction: 0, elapsedMs: 0, done: true };
  }

  let acc = 0;
  for (let i = 0; i < stages.length; i += 1) {
    const end = acc + stages[i].ms;
    if (clock < end) {
      const span = stages[i].ms;
      return {
        completed: i,
        activeIndex: i,
        // A zero-latency stage is never partially done.
        activeFraction: span === 0 ? 1 : (clock - acc) / span,
        elapsedMs: clock,
        done: false,
      };
    }
    acc = end;
  }

  return {
    completed: stages.length,
    activeIndex: null,
    activeFraction: 1,
    elapsedMs: clock,
    done: true,
  };
}
