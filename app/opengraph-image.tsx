import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site, heroTrace } from "@/content/projects";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dark-only on purpose: link previews render against unpredictable chrome
// (Slack, LinkedIn, iMessage), and the dark card holds its edges everywhere.
const PAPER = "#0e1116";
const INK = "#f3f5f7";
const INK_3 = "#7d858f";
const RULE = "#252a31";
const DET = "#2ed3a7";
const LLM = "#8b87ff";

/**
 * Generated at build time, so the preview card can never drift from the trace
 * numbers in content/projects.ts — it reads the same array the hero does.
 *
 * The font is vendored in assets/ and read from disk rather than fetched. Satori
 * does not resolve generic families like "monospace", so without a real font
 * file this falls back to sans and loses the mono identity the whole site rests
 * on. Reading from disk keeps `next build` free of any network dependency.
 */
export default async function OpengraphImage() {
  const mono = await readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-Medium.ttf"));

  const max = Math.max(...heroTrace.map((s) => s.ms));
  const total = heroTrace.reduce((n, s) => n + s.ms, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "64px 72px",
          fontFamily: "Plex Mono",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK_3,
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 27,
              lineHeight: 1.4,
              color: "#b9c0c8",
              maxWidth: 900,
            }}
          >
            LLM systems that survive contact with real users.
          </div>
        </div>

        {/* The trace, reduced to its shape: cheap stages, then the expensive one. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {heroTrace.map((s) => (
              <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 250, fontSize: 19, color: s.path === "llm" ? LLM : DET }}>
                  {s.stage}
                </div>
                <div style={{ display: "flex", width: 620, height: 6, background: RULE }}>
                  <div
                    style={{
                      width: `${Math.max(3, (s.ms / max) * 100)}%`,
                      height: "100%",
                      background: s.path === "llm" ? LLM : DET,
                    }}
                  />
                </div>
                {/* One interpolated string, not {s.ms} + "ms": Satori treats
                    adjacent children as multiple nodes and then demands an
                    explicit display on the parent. */}
                <div style={{ fontSize: 19, color: INK_3 }}>{`${s.ms}ms`}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 26,
              paddingTop: 20,
              borderTop: `1px solid ${RULE}`,
              fontSize: 20,
              color: INK_3,
            }}
          >
            <div>{`${total}ms — one inbound message, end to end`}</div>
            <div>{site.location}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Plex Mono", data: mono, weight: 500, style: "normal" }],
    }
  );
}
