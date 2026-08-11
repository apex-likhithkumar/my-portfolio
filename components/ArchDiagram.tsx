import type { Diagram } from "@/content/projects";

/**
 * Architecture figure for a case study.
 *
 * Built from real HTML rather than a hand-drawn SVG canvas, deliberately:
 * the labels stay selectable text, screen readers get an ordered list of stages
 * instead of one opaque graphic needing a parallel description, and the bands
 * reflow on a phone instead of forcing a horizontal scroll. Only the connectors
 * are SVG, because that is the one part that is genuinely a drawing.
 *
 * Colour carries the same meaning as the hero trace — teal deterministic, indigo
 * model call, neutral for a system boundary. A reader who understood the trace
 * already knows how to read this.
 */

const PATH_COLOR = {
  det: "var(--det)",
  llm: "var(--llm)",
  io: "var(--ink-3)",
} as const;

function Connector() {
  return (
    <div aria-hidden className="flex justify-center py-2">
      <svg width="9" height="26" viewBox="0 0 9 26" fill="none">
        <path
          d="M4.5 0V21M4.5 25L0.5 18M4.5 25L8.5 18"
          stroke="var(--rule)"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
}

export default function ArchDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <figure>
      <ol>
        {diagram.bands.map((band, i) => (
          <li key={band.title}>
            <div className="border border-rule bg-paper-2 px-4 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="label text-ink">{band.title}</h3>
                {band.subtitle ? <span className="label">{band.subtitle}</span> : null}
              </div>

              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                {band.steps.map((s) => (
                  <li
                    key={s.label}
                    className="border px-2 py-1 font-mono text-[12px] leading-tight"
                    style={{ borderColor: PATH_COLOR[s.path], color: PATH_COLOR[s.path] }}
                  >
                    {s.label}
                    {s.note ? (
                      <span className="ml-1.5 text-ink-3">{s.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {i < diagram.bands.length - 1 ? <Connector /> : null}
          </li>
        ))}
      </ol>

      {diagram.loop ? (
        <p className="mt-3 font-mono text-[12px] text-ink-3">
          <span aria-hidden>&#8635; </span>
          {diagram.loop}
        </p>
      ) : null}

      {diagram.note ? (
        <figcaption className="mt-4 max-w-measure text-[14px] text-ink-2">
          {diagram.note}
        </figcaption>
      ) : null}
    </figure>
  );
}
