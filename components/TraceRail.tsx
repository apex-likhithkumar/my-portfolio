"use client";

import { useEffect, useRef, useState } from "react";
import { heroTrace, traceNote } from "@/content/projects";
import { stagesForMode, traceProgress, traceTotals, type TraceMode } from "@/lib/trace";

/**
 * Signature element: one real request traced through the Kalamandir pipeline,
 * replayed on a loop.
 *
 * Colour encodes which path a stage took — teal for deterministic work, indigo
 * for a model call. Bar lengths are the real latencies from content, so the
 * visual cannot drift from the numbers printed beside it.
 *
 * The toggle is the argument: flipping to "cache hit" drops every model call and
 * the trace finishes roughly twelve times sooner, which is the claim traceNote
 * makes in prose.
 */

/** Wall-clock milliseconds per traced millisecond. */
const TIME_SCALE = 2;

/** How long the finished trace holds before replaying. */
const HOLD_MS = 2400;

// Bars are scaled against the slowest stage on the COLD path, never against the
// current mode. Rescaling per mode would let the cached path's 24ms bar render
// as long as the cold path's 610ms one, which would flatly contradict the point.
const SCALE_MAX = Math.max(...heroTrace.map((s) => s.ms));

// Initial state is the FINISHED trace, not an empty one.
//
// Server-rendered HTML and the no-JS path both show whatever this is. Starting
// at 0 meant a reader without JS saw every bar empty and a "0ms" total beside
// stage latencies that clearly were not zero — the figure read as broken rather
// than as static. Starting complete degrades to a correct still image, and the
// animation resets it to 0 on its first frame when JS is alive.
const COLD_TOTAL = traceTotals(stagesForMode(heroTrace, "cold")).totalMs;

export default function TraceRail() {
  const [mode, setMode] = useState<TraceMode>("cold");
  const [elapsed, setElapsed] = useState(COLD_TOTAL);
  const [hovered, setHovered] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);

  const stages = stagesForMode(heroTrace, mode);
  const { totalMs, llmCalls, detCalls } = traceTotals(stages);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const frame = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion gets the finished trace, not a loop. All the information is
    // in the end state; the animation only ever added emphasis.
    if (reduced) {
      setElapsed(totalMs);
      return;
    }

    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const played = (now - start) / TIME_SCALE;

      if (played >= totalMs + HOLD_MS / TIME_SCALE) {
        start = now;
        setElapsed(0);
      } else {
        // traceProgress clamps, so overshooting into the hold window is fine.
        setElapsed(played);
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
    // Restart cleanly when the path changes — a cached run is a different length.
  }, [mode, reduced, totalMs]);

  const progress = traceProgress(stages, elapsed);

  return (
    <figure className="mt-14 sm:mt-20">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-rule pb-3">
        <span className="label">Trace — one inbound message</span>

        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="label flex items-center gap-1.5">
            <i aria-hidden className="inline-block h-2 w-2 rounded-full bg-det" />
            deterministic
          </span>
          <span className="label flex items-center gap-1.5">
            <i aria-hidden className="inline-block h-2 w-2 rounded-full bg-llm" />
            model call
          </span>
        </span>
      </figcaption>

      {/* Path switch. Two buttons rather than a select: the comparison is the
          content, so both options stay visible. */}
      <div className="mt-4 flex items-center gap-2">
        {(["cold", "cached"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`label border px-2.5 py-1 transition-colors ${
              mode === m
                ? "border-ink text-ink"
                : "border-rule text-ink-3 hover:border-ink-3 hover:text-ink-2"
            }`}
          >
            {m === "cold" ? "Cold path" : "Cache hit"}
          </button>
        ))}
        <span className="label ml-1 hidden sm:inline">
          {mode === "cold" ? "every stage runs" : "model calls skipped"}
        </span>
      </div>

      <ol className="mt-2 divide-y divide-rule">
        {stages.map((s, i) => {
          const isLlm = s.path === "llm";
          const color = isLlm ? "var(--llm)" : "var(--det)";

          const isDone = i < progress.completed;
          const isActive = progress.activeIndex === i;
          const fill = isDone ? 1 : isActive ? progress.activeFraction : 0;
          const reached = isDone || isActive;

          return (
            <li
              key={s.stage}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="py-3.5 transition-colors"
              style={{ background: hovered === i ? "var(--paper-2)" : "transparent" }}
            >
              <div className="sm:grid sm:grid-cols-[13rem_1fr_5rem] sm:items-baseline sm:gap-x-5">
                <div className="flex items-baseline justify-between gap-4 sm:contents">
                  <span
                    className="font-mono text-[13px] font-medium tracking-tight transition-colors sm:col-start-1 sm:row-start-1"
                    // Stages the playhead has not reached stay dim, so the eye
                    // follows the request through the pipeline.
                    style={{ color: reached ? color : "var(--ink-3)" }}
                  >
                    {s.stage}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] text-ink-3 sm:col-start-3 sm:row-start-1 sm:text-right">
                    {s.ms}ms
                  </span>
                </div>

                <div className="mt-1.5 sm:col-start-2 sm:row-start-1 sm:mt-0">
                  <span className="text-[14px] text-ink-2">{s.detail}</span>
                  <span aria-hidden className="mt-2 block h-[3px] w-full bg-rule">
                    <span
                      className="block h-full"
                      style={{
                        width: `${(s.ms / SCALE_MAX) * 100 * fill}%`,
                        // Keeps a 9ms stage from rendering as nothing at all.
                        minWidth: fill > 0 ? "2px" : 0,
                        background: color,
                      }}
                    />
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-ink pt-3">
        {/* aria-hidden because it ticks ~60×/second — a live region here would
            flood a screen reader. The static summary below carries the same
            information. */}
        <span aria-hidden className="font-mono text-[13px] tabular-nums">
          {Math.round(progress.elapsedMs)}ms
          <span className="text-ink-3">
            {" "}
            / {totalMs}ms · {llmCalls} model {llmCalls === 1 ? "call" : "calls"} ·{" "}
            {detCalls} deterministic
          </span>
        </span>
      </div>

      <p className="sr-only">
        {mode === "cold" ? "Cold path" : "Cache hit"}: {stages.length} stages, {totalMs}
        ms total, {llmCalls} model {llmCalls === 1 ? "call" : "calls"} and {detCalls}{" "}
        deterministic stages.
      </p>

      <p className="mt-5 max-w-measure text-[14px] text-ink-2">{traceNote}</p>
    </figure>
  );
}
