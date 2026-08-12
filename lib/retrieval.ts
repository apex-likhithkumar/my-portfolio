/**
 * Routing logic behind the retrieval sandbox.
 *
 * This is the site's central argument made executable: a cheap deterministic
 * lookup runs first, and the expensive path only runs when it misses.
 *
 * Honest about what it is. The "vector.search" fallback here scores token
 * overlap — it is NOT an embedding model, and the sandbox says so on screen.
 * Simulating the ranker is fine; the thing being demonstrated is the routing
 * decision, not retrieval quality. Claiming otherwise would be the exact kind
 * of overclaim the rest of this site was cleaned up to remove.
 *
 * Latencies are the same figures the hero trace uses, so the two figures cannot
 * tell different stories.
 */

export type CatalogueItem = {
  sku: string;
  name: string;
  attrs: string[];
};

export type ResolvedStage = {
  stage: string;
  detail: string;
  ms: number;
  path: "det" | "llm";
};

export type RetrievalPath =
  /** Nothing typed yet. */
  | "empty"
  /** Cheap lookup hit — model never invoked. */
  | "exact"
  /** Cheap lookup missed, similarity fallback ran. */
  | "vector"
  /** Both paths ran and found nothing. */
  | "miss";

export type Resolution = {
  path: RetrievalPath;
  matches: CatalogueItem[];
  stages: ResolvedStage[];
  totalMs: number;
  usedModel: boolean;
  /** How the routing decision was made, shown to the reader. */
  reason: string;
};

const SKU_PATTERN = /\b[A-Z]{2,4}-\d{3,5}\b/i;

// Words too common to carry signal. Without this, "saree" alone matches the
// whole catalogue and the fallback looks smarter than it is.
const STOPWORDS = new Set([
  "a", "an", "the", "for", "and", "or", "in", "on", "with", "of", "to",
  "do", "you", "have", "is", "are", "i", "want", "need", "something", "some",
  "me", "my", "please", "stock", "any",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Cheap path: an exact SKU anywhere in the text, or the full product name. */
function exactLookup(catalogue: CatalogueItem[], query: string): CatalogueItem | null {
  const skuInQuery = query.match(SKU_PATTERN)?.[0]?.toUpperCase();
  if (skuInQuery) {
    const bySku = catalogue.find((i) => i.sku.toUpperCase() === skuInQuery);
    if (bySku) return bySku;
  }

  const normalized = query.trim().toLowerCase();
  return catalogue.find((i) => i.name.toLowerCase() === normalized) ?? null;
}

/** Fallback: token overlap against name + attributes. Stand-in for a ranker. */
function similaritySearch(catalogue: CatalogueItem[], query: string): CatalogueItem[] {
  const q = tokenize(query);
  if (q.length === 0) return [];

  return catalogue
    .map((item) => {
      const hay = new Set(tokenize(`${item.name} ${item.attrs.join(" ")}`));
      const score = q.reduce((n, t) => n + (hay.has(t) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.item);
}

// Same latencies as heroTrace, so the two figures cannot contradict each other.
const MS = { lang: 9, lookup: 24, vector: 610, compose: 540 } as const;

export function resolveQuery(catalogue: CatalogueItem[], query: string): Resolution {
  if (query.trim() === "") {
    return {
      path: "empty",
      matches: [],
      stages: [],
      totalMs: 0,
      usedModel: false,
      reason: "Type a query to run the pipeline.",
    };
  }

  const langStage: ResolvedStage = {
    stage: "lang.detect",
    detail: "script and language identified",
    ms: MS.lang,
    path: "det",
  };

  const hit = exactLookup(catalogue, query);

  // The cheap path hit, so the pipeline stops here. This early return IS the
  // short-circuit the whole site argues for.
  if (hit) {
    const stages = [
      langStage,
      {
        stage: "catalog.lookup",
        detail: `exact match on ${hit.sku}`,
        ms: MS.lookup,
        path: "det" as const,
      },
    ];
    return {
      path: "exact",
      matches: [hit],
      stages,
      totalMs: stages.reduce((n, s) => n + s.ms, 0),
      usedModel: false,
      reason: "Exact handle found — the model was never called.",
    };
  }

  const ranked = similaritySearch(catalogue, query);

  const stages: ResolvedStage[] = [
    langStage,
    { stage: "catalog.lookup", detail: "no exact handle", ms: MS.lookup, path: "det" },
    {
      stage: "vector.search",
      detail: ranked.length ? `${ranked.length} candidates ranked` : "no candidates",
      ms: MS.vector,
      path: "llm",
    },
    { stage: "reply.compose", detail: "grounded in the matches above", ms: MS.compose, path: "llm" },
  ];

  return {
    path: ranked.length ? "vector" : "miss",
    matches: ranked,
    stages,
    totalMs: stages.reduce((n, s) => n + s.ms, 0),
    usedModel: true,
    reason: ranked.length
      ? "No exact handle, so the expensive path ran."
      : "Nothing matched on either path — the honest answer is a miss.",
  };
}
