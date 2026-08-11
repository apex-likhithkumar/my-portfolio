import type { Metric } from "@/content/projects";

/**
 * Results strip — large serif numerals over mono labels.
 *
 * Two jobs at once. It closes the evidence gap (prose claims become checkable
 * figures) and it gives the page another visual set-piece, because big numerals
 * in a display serif carry a lot of weight for very little ink.
 *
 * `note` is not decoration. A figure with a measurement window attached reads as
 * something that was measured; the same figure bare reads as something that was
 * estimated. Prefer "over 30 days" or "n=15 tasks" on every metric that has one.
 *
 * Renders nothing when there are no metrics, so a case study without measured
 * numbers stays honest rather than shipping placeholder zeroes.
 */
export default function Metrics({ metrics, label = "Results" }: { metrics: Metric[]; label?: string }) {
  if (metrics.length === 0) return null;

  return (
    <section className="band mt-16 py-14 sm:mt-24 sm:py-20">
      <div className="shell">
        <h2 className="label">{label}</h2>

        <dl className="mt-9 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span className="display block text-[clamp(2.6rem,5.5vw,4rem)] leading-none">
                  {m.value}
                </span>
                <span className="mt-4 block border-t border-rule pt-3 text-[14px] text-ink-2">
                  {m.label}
                </span>
                {m.note ? <span className="label mt-2 block">{m.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
