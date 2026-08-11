/**
 * Absolute origin for metadataBase, canonical URLs and OG card resolution.
 *
 * Resolved from the environment rather than hardcoded so the same build works
 * on a preview deploy and in production:
 *
 *   NEXT_PUBLIC_SITE_URL                  explicit override / custom domain
 *   VERCEL_PROJECT_PRODUCTION_URL         set by Vercel on production builds
 *   http://localhost:3000                 local dev
 *
 * Read at module scope, not inside a component, so it is evaluated once at
 * build time and never on a request path.
 */
export const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();
