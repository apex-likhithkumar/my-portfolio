"use client";

import { useMemo, useState } from "react";
import { sampleCatalogue, sampleQueries } from "@/content/catalogue";
import { resolveQuery } from "@/lib/retrieval";

/**
 * Interactive proof of the site's central claim.
 *
 * The hero trace asserts that cheap deterministic stages short-circuit before
 * the model call. This lets the reader test that assertion with their own input:
 * type a SKU and the pipeline stops at the lookup; type a vague phrase and it
 * falls through to the expensive path. Same teal/indigo semantics as the trace,
 * so no new visual language to learn.
 *
 * Everything runs locally in the browser against an invented catalogue. There is
 * no backend, no client data, and no embedding model — all stated on screen,
 * because a demo that implies more than it does would undo the point.
 */
export default function RetrievalSandbox() {
  const [query, setQuery] = useState("");

  const result = useMemo(() => resolveQuery(sampleCatalogue, query), [query]);
  const cheap = result.path === "exact";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-rule pb-3">
        <h2 className="label text-ink">Try it — retrieval routing</h2>
        <span className="label">sandbox · sample catalogue</span>
      </div>

      <p className="mt-5 max-w-measure text-[15px] text-ink-2">
        Type a product query. An exact SKU or full product name resolves on the
        deterministic path and never reaches a model. Anything vaguer falls
        through to similarity search — the expensive path.
      </p>

      <label htmlFor="q" className="sr-only">
        Product query
      </label>
      <input
        id="q"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="KLM-2210, or: something gold for a wedding"
        autoComplete="off"
        spellCheck={false}
        className="mt-6 w-full border border-rule bg-paper-2 px-4 py-3 font-mono text-[14px] text-ink placeholder:text-ink-3 focus:border-ink-3 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {sampleQueries.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setQuery(s.label)}
            className="label border border-rule px-2.5 py-1 transition-colors hover:border-ink-3 hover:text-ink-2"
          >
            {s.label}
            <span className="ml-1.5 opacity-60">{s.note}</span>
          </button>
        ))}
      </div>

      {result.path !== "empty" ? (
        <div className="mt-8">
          {/* Verdict first — it is the whole point of the demo. */}
          <div
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-l-2 pl-4"
            style={{ borderColor: cheap ? "var(--det)" : "var(--llm)" }}
          >
            <span
              className="font-mono text-[13px] font-medium"
              style={{ color: cheap ? "var(--det)" : "var(--llm)" }}
            >
              {cheap ? "resolved without a model call" : "model call required"}
            </span>
            <span className="font-mono text-[13px] text-ink-3 tabular-nums">
              {result.totalMs}ms
            </span>
          </div>
          <p className="mt-2 pl-4 text-[14px] text-ink-2">{result.reason}</p>

          {/* Stage list, same language as the hero trace. */}
          <ol className="mt-6 divide-y divide-rule border-t border-rule">
            {result.stages.map((s) => {
              const color = s.path === "llm" ? "var(--llm)" : "var(--det)";
              return (
                <li key={s.stage} className="flex items-baseline gap-x-4 py-2.5">
                  <span
                    className="w-[9rem] shrink-0 font-mono text-[13px] font-medium"
                    style={{ color }}
                  >
                    {s.stage}
                  </span>
                  <span className="flex-1 text-[14px] text-ink-2">{s.detail}</span>
                  <span className="shrink-0 font-mono text-[13px] text-ink-3 tabular-nums">
                    {s.ms}ms
                  </span>
                </li>
              );
            })}
          </ol>

          {result.matches.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {result.matches.map((m) => (
                <li
                  key={m.sku}
                  className="border border-rule px-2.5 py-1.5 font-mono text-[12px] text-ink-2"
                >
                  <span className="text-ink">{m.sku}</span> {m.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 font-mono text-[13px] text-ink-3">
              No candidates. Returning a miss beats inventing a product.
            </p>
          )}
        </div>
      ) : null}

      {/* Stating the limits is not a disclaimer, it is the credibility. */}
      <p className="mt-8 max-w-measure text-[13px] text-ink-3">
        Runs entirely in your browser over eight invented products — no backend,
        no client data. The fallback ranks by token overlap rather than
        embeddings: what is being demonstrated is the routing decision, not the
        quality of the ranker. Latencies are the same figures used in the trace
        above.
      </p>
    </div>
  );
}
