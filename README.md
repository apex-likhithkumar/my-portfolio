# Portfolio — Likhith Kumar Masura

Next.js 15 (App Router) + Tailwind. Three case studies, statically generated.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

```bash
git init
git add -A
git commit -m "portfolio: initial"
git branch -M main
git remote add origin https://github.com/lkumar2925/portfolio.git   # create this repo on GitHub first
git push -u origin main
```

Then go to vercel.com → **Add New → Project** → import the repo → **Deploy**.
Vercel auto-detects Next.js; no settings to change. You get
`portfolio-<something>.vercel.app`, renameable in Project → Settings → Domains.
Every later `git push` redeploys automatically.

## Editing content

**All copy lives in `content/projects.ts`.** You should not need to touch
`/app` or `/components` to change words.

- `site` — name, role, links, the one-line statement, the About paragraphs
- `heroTrace` — the stages in the hero trace. `path: "det"` renders teal
  (deterministic/cheap), `path: "llm"` renders indigo (model call). Bar lengths
  are derived from `ms`, so they stay honest automatically.
- `projects[]` — one object per case study. Add a fourth and its page route,
  static generation and cross-links all appear on their own.
- `stack`, `education`

## The design, in one paragraph

The two accent colours mean something: **teal = deterministic / cheap path**,
**indigo = model call / expensive path**. That mapping is the idea the whole
site rests on — the hero trace shows an actual request where the deterministic
stages short-circuit before the expensive one. If you change the palette, keep
the semantic split. Type is IBM Plex Mono set large as the display face (the
"instrument panel" read) with IBM Plex Sans for body copy.

## Before you ship

- [ ] Drop your resume PDF in `/public` matching `site.resume` in the content file
- [ ] Add `app/opengraph-image.png` (1200×630) so shared links preview well
- [ ] Confirm the GitHub repos you link are public and have READMEs

## Structure

```
app/
  layout.tsx              fonts + metadata
  page.tsx                landing
  globals.css             design tokens, type scale, motion
  projects/[slug]/page.tsx  case study template
components/
  TraceRail.tsx           hero signature
  Reveal.tsx              scroll fade-in
content/
  projects.ts             ALL COPY LIVES HERE
```
