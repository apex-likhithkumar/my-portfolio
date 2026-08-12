# Portfolio visual upgrade — design

**Date:** 2026-08-11
**Project:** `d:\my-portfolio` — Likhith Kumar Masura, Forward-Deployed AI Engineer portfolio
**Status:** approved, ready for implementation planning

## Goal

Move the site from "clean but forgettable" to "memorable and credible" for its actual
audience: hiring managers and senior engineers at AI companies, scanning for about
45 seconds.

Explicitly **not** an awards-site rebuild. The success test is an engineering
interviewer thinking *"this person is more senior than their years"*, not a designer
thinking *"nice motion work"*.

## Organizing idea

The site should feel like well-made instrumentation — not "dashboard aesthetic"
(rounded cards, donut charts), but the rigor of instrumentation: real numbers, honest
units, colour that encodes meaning rather than mood, monospace as the voice of the
machine.

That idea already exists in the codebase. It is under-committed: it appears once, in a
3px-tall bar chart, and the rest of the page forgets about it.

## What is preserved

These are the reasons the site is not generic. Every change amplifies them; none
replaces them.

- The type system — IBM Plex Mono as a **display** face, IBM Plex Sans for body.
- The two-colour semantics — `--det` teal = deterministic/cheap path, `--llm` indigo
  = model call/expensive path.
- The editorial grid — `max-w-[68rem]`, label/content column split, hairline rules.
- The TraceRail concept — a real latency trace as the hero.

## Baseline observations

Measured against the running dev server at 1440×900 on 2026-08-11.

| Observation | Evidence |
| --- | --- |
| `favicon.ico` 404s | browser console on every page load |
| No dark mode | `app/globals.css` defines a single `:root` palette |
| Body content hidden without JS | `.reveal { opacity: 0 }` in CSS; full-page screenshots of `/` and each case-study route show empty regions where Work and all case-study sections should be |
| Hero type is clamped below its fluid size | `clamp(2.1rem, 7.2vw, 4.6rem)` — at 1440px the fluid term wants ~103px, cap holds it to 73.6px |
| Case studies are undifferentiated prose | `app/projects/[slug]/page.tsx` renders five text sections, no diagram |
| Fonts are render-blocking third-party | `app/layout.tsx` uses a Google Fonts `<link>` rather than `next/font` |
| OG image missing | `metadata.openGraph` sets no image, so shared links preview as a grey box |

## Changes

Ordered by impact per hour of work.

### 1. Dark mode, default on

The largest single visual gain available. The existing palette was designed for dark
and is wasted on white: `--det #0b7a5f` and `--llm #2f2bd6` are deep saturated colours
that read muddy on `#ffffff` and glow on near-black. The audience also browses dark.

**The real work is the token layer, not the toggle.** The two accent hexes cannot be
reused on a dark background — `#0b7a5f` on `#0e1116` is roughly 2.5:1, well below the
4.5:1 WCAG AA floor for text. Dark mode therefore requires lighter variants of both
accents, which turns one palette into two.

Requirements:

- Every colour gets its light value on bare `:root` and its dark value under both
  `@media (prefers-color-scheme: dark)` and an explicit `[data-theme="dark"]`
  attribute, so a manual toggle wins in both directions.
- Dark is the default when the visitor has expressed no preference.
- A visible toggle, with the choice persisted across navigations.
- No colour may have its only definition inside a media query.
- Both accents must clear 4.5:1 against their own background in both themes.
- The teal/indigo semantic split survives the port. If a colour has to move far enough
  that teal stops reading as teal, the semantics are broken and the value is wrong.

### 2. Live trace rail

The set-piece — the element intended to be screenshotted and shared. Today it animates
once on mount and then dies.

Target behaviour:

- A request arrives on a repeating cycle; stages illuminate in sequence.
- The running total ticks up as stages land.
- A **cache hit / cold path** toggle lets the viewer watch the deterministic stages
  short-circuit before the expensive model call.
- Hovering a stage exposes its detail.

The point is demonstration over assertion. `traceNote` currently *claims* that most
queries never reach the expensive path; the component should show it happening.

Constraints:

- Honour `prefers-reduced-motion`: render the completed end state, do not loop.
- The animation must never be the only way to read the data — the full trace stays
  legible in a static screenshot.
- Timing values stay derived from `heroTrace[].ms` so the visual cannot drift from the
  stated numbers.

### 3. Architecture diagram per case study

Highest credibility gain on the list. For an AI engineer the architecture *is* the
portfolio piece, and all three case studies currently read as interchangeable prose.

- Hand-built inline SVG, one per project, using the same teal/indigo semantics as the
  hero so the site reads as one system.
- Drawn from Likhith's own written descriptions in `content/projects.ts` — **no client
  UI, no client data, no client screenshots, and no client named**, so there is
  no NDA exposure.
- Must be legible in both themes (stroke and fill via CSS custom properties, never
  hardcoded hex).
- Needs a real text alternative; a diagram that is meaningless to a screen reader is
  an accessibility regression.

### 4. Type scale

Raise the display cap so the hero stops holding itself back on a laptop, and widen the
gap between display and body sizes. Scale contrast is what makes a page read as
composed rather than uniform. Applies to the case-study `h1` as well as the home hero.

### 5. Reveal pattern fix

Architectural, not cosmetic. `.reveal { opacity: 0 }` lives in CSS, so if JS fails,
hydration breaks, or a crawler does not execute scripts, the entire body of every page
is invisible.

Fix: a tiny inline script sets a `js` class on `<html>` before first paint; the hiding
rule is scoped to `.js .reveal`. Content is visible by default and the animation
becomes a progressive enhancement.

Acceptance: with JavaScript disabled, `/` and every case-study page render all their
content.

### 6. Hygiene

- `app/icon.svg` — resolves the 404, gives the tab a mark.
- OG image generated at build time via `next/og`, so no design tool is needed and it
  cannot drift from the site's palette.
- Move fonts to `next/font/google` — self-hosted, no render-blocking third-party
  request, no layout shift.

## Explicitly rejected

No WebGL blob, no cursor trail, no scroll-jacking, no gradient mesh, no tilt-on-hover
cards. Each reads as template in 2026, and on an engineer's site they cost credibility
rather than adding it. The restraint in the current design is an asset; the goal is
fewer and better moments, not more of them.

## Testing

Per the standing TDD default, tests go where there is real logic and are skipped where
there is not.

- **Tested:** trace-rail state derivation — stage sequencing, cache-hit vs cold-path
  filtering, running totals. Extracted as pure functions so they can be driven without
  a DOM or timers, written test-first.
- **Not tested:** CSS token values, spacing, type scale. Assertions on hex codes
  restate the stylesheet without proving anything.
- **Verified by hand, in the browser, in both themes:** contrast ratios, the
  JS-disabled render, and reduced-motion behaviour.

This project currently has no test runner. One is added as part of the work.

## Sequencing

Hygiene and the reveal fix land first — both are small, and the reveal fix is what
makes full-page screenshots honest enough to review the later work against. Then dark
mode, then the live trace, then the diagrams, which carry the most hand-work per unit.

## Risks

- **Dark mode is the character change.** It alters the site's whole feel. Cheaper to
  reverse before the token layer is rebuilt than after.
- **The live trace can tip into gimmick.** If the loop is distracting rather than
  informative, it undermines the restraint that makes the site credible. If it reads
  as decoration, cut the loop and keep the interaction.
- **Diagrams are the most likely thing to look amateur.** Hand-drawn SVG is
  unforgiving. Weak diagrams are worse than no diagrams, so they ship last and only if
  they clear the bar.
