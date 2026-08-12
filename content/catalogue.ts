import type { CatalogueItem } from "@/lib/retrieval";

/**
 * Sample catalogue for the retrieval sandbox.
 *
 * Invented products in a plausible retail shape. No client catalogue, no client
 * SKUs, no client data of any kind — the sandbox exists to demonstrate a routing
 * decision, and inventing the inventory is what keeps it publishable.
 *
 * SKUs follow a realistic pattern so the exact-match path has something to bite
 * on the way it would in production.
 */
export const sampleCatalogue: CatalogueItem[] = [
  { sku: "KLM-4471", name: "Kanjivaram silk saree", attrs: ["silk", "maroon", "bridal", "wedding", "saree", "zari"] },
  { sku: "KLM-2210", name: "Cotton handloom saree", attrs: ["cotton", "blue", "daily", "office", "saree", "light"] },
  { sku: "KLM-9902", name: "Banarasi georgette saree", attrs: ["georgette", "gold", "festive", "saree", "party"] },
  { sku: "KLM-3115", name: "Mens silk kurta", attrs: ["silk", "cream", "kurta", "festive", "mens", "wedding"] },
  { sku: "KLM-7788", name: "Chikankari cotton kurti", attrs: ["cotton", "white", "kurti", "casual", "embroidery"] },
  { sku: "KLM-5063", name: "Linen straight pants", attrs: ["linen", "beige", "pants", "office", "summer"] },
  { sku: "KLM-6640", name: "Pattu pavadai set", attrs: ["silk", "kids", "traditional", "festive", "pink"] },
  { sku: "KLM-1029", name: "Cotton dupatta", attrs: ["cotton", "green", "dupatta", "daily", "printed"] },
];

/** Ready-made queries so a reader can see both paths without thinking. */
export const sampleQueries = [
  { label: "KLM-2210", note: "exact SKU" },
  { label: "Cotton handloom saree", note: "exact name" },
  { label: "something gold for a wedding", note: "no handle" },
  { label: "light cotton for office", note: "no handle" },
];
