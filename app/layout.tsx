import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { site } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";

// Self-hosted at build time: no render-blocking request to a third party, and
// next/font generates a metric-matched fallback so there is no layout shift.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

// Display face. Ships a single 400 weight by design — a display serif at 100px
// wants regular, and faux-bolding it would wreck the stroke contrast that makes
// it worth using.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.name} — ${site.role}`,
  description: site.statement,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.statement,
    url: siteUrl,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.statement,
  },
};

/**
 * Runs before first paint, so neither the theme nor the reveal state can flash.
 *
 * Two jobs:
 *  1. Mark that JS is alive. `.reveal` only hides content under `.js`, so a
 *     failed script leaves the page fully readable instead of blank.
 *  2. Apply the saved theme choice before the first frame, which is what stops
 *     a light flash for a visitor who picked dark.
 *
 * Deliberately not a React effect — an effect runs after paint, which is
 * exactly the flash this avoids.
 *
 * On dangerouslySetInnerHTML: this is a module-level string literal with no
 * interpolation. No request data, route param or user input reaches it, so
 * there is no injection surface. Keep it that way — if this string ever needs
 * a dynamic value, serialise it through JSON.stringify rather than template
 * concatenation.
 */
const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);}catch(e){}})();`;

/**
 * Person schema, so a search for the name surfaces this site with the right
 * job title and links rather than whichever stale profile ranks highest.
 * Built from the same `site` object the page renders, so it cannot drift.
 */
const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: siteUrl,
  sameAs: [site.github, site.linkedin],
  address: { "@type": "PostalAddress", addressLocality: site.location },
  knowsAbout: [
    "LLM application development",
    "Retrieval-augmented generation",
    "Multi-tenant SaaS architecture",
    "Python",
    "FastAPI",
    "NestJS",
    "PostgreSQL row-level security",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${instrumentSerif.variable}`}
      // BOOT_SCRIPT intentionally mutates this element (adds `js`, may set
      // data-theme) before React hydrates, so the client DOM will not match the
      // server markup here. Scoped to <html>'s own attributes — it does not
      // suppress warnings for any child.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {/* JSON.stringify, not template concatenation — the values come from
            content and must be escaped rather than pasted into the document. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
        />
      </head>
      <body>
        {children}
        {/* Cookieless and no-op outside Vercel, so local dev stays untouched. */}
        <Analytics />
      </body>
    </html>
  );
}
