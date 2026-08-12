import { describe, expect, it } from "vitest";
import { resolveQuery, type CatalogueItem } from "./retrieval";

const CATALOGUE: CatalogueItem[] = [
  { sku: "KLM-4471", name: "Kanjivaram silk saree", attrs: ["silk", "maroon", "bridal", "saree"] },
  { sku: "KLM-2210", name: "Cotton handloom saree", attrs: ["cotton", "blue", "daily", "saree"] },
  { sku: "KLM-9902", name: "Banarasi georgette saree", attrs: ["georgette", "gold", "festive", "saree"] },
  { sku: "KLM-3115", name: "Mens silk kurta", attrs: ["silk", "cream", "kurta", "festive"] },
];

describe("resolveQuery — routing", () => {
  it("short-circuits on an exact SKU without touching the model path", () => {
    const r = resolveQuery(CATALOGUE, "KLM-4471");
    expect(r.path).toBe("exact");
    expect(r.matches[0].sku).toBe("KLM-4471");
    expect(r.usedModel).toBe(false);
  });

  it("matches a SKU regardless of case or surrounding whitespace", () => {
    expect(resolveQuery(CATALOGUE, "  klm-4471 ").path).toBe("exact");
  });

  it("finds a SKU embedded in a sentence, the way a customer actually writes", () => {
    const r = resolveQuery(CATALOGUE, "do you have KLM-2210 in stock?");
    expect(r.path).toBe("exact");
    expect(r.matches[0].sku).toBe("KLM-2210");
  });

  it("treats a full product name as the cheap path too", () => {
    const r = resolveQuery(CATALOGUE, "Cotton handloom saree");
    expect(r.path).toBe("exact");
    expect(r.usedModel).toBe(false);
  });

  it("falls through to similarity when nothing matches exactly", () => {
    const r = resolveQuery(CATALOGUE, "something gold and shiny for a wedding");
    expect(r.path).toBe("vector");
    expect(r.usedModel).toBe(true);
    expect(r.matches.length).toBeGreaterThan(0);
  });

  it("ranks the closest item first on the fallback path", () => {
    const r = resolveQuery(CATALOGUE, "cotton blue daily wear");
    expect(r.path).toBe("vector");
    expect(r.matches[0].sku).toBe("KLM-2210");
  });

  it("returns no matches, and no model call, for an empty query", () => {
    const r = resolveQuery(CATALOGUE, "   ");
    expect(r.matches).toEqual([]);
    expect(r.usedModel).toBe(false);
    expect(r.path).toBe("empty");
  });

  it("reports a miss rather than inventing a match for pure gibberish", () => {
    const r = resolveQuery(CATALOGUE, "zzzzqqq wwwwxxx");
    expect(r.path).toBe("miss");
    expect(r.matches).toEqual([]);
  });
});

describe("resolveQuery — stages", () => {
  it("stops the stage list at the lookup when the cheap path wins", () => {
    const stages = resolveQuery(CATALOGUE, "KLM-4471").stages;
    expect(stages.map((s) => s.stage)).toEqual(["lang.detect", "catalog.lookup"]);
    expect(stages.every((s) => s.path === "det")).toBe(true);
  });

  it("adds the model stages only when the cheap path missed", () => {
    const stages = resolveQuery(CATALOGUE, "something for a festive evening").stages;
    expect(stages.map((s) => s.stage)).toEqual([
      "lang.detect",
      "catalog.lookup",
      "vector.search",
      "reply.compose",
    ]);
    // The lookup still ran and still counts as cheap — it just did not hit.
    expect(stages.find((s) => s.stage === "catalog.lookup")!.path).toBe("det");
    expect(stages.find((s) => s.stage === "vector.search")!.path).toBe("llm");
  });

  it("costs strictly less on the cheap path", () => {
    const cheap = resolveQuery(CATALOGUE, "KLM-4471");
    const dear = resolveQuery(CATALOGUE, "something for a festive evening");
    expect(cheap.totalMs).toBeLessThan(dear.totalMs);
  });

  it("does not mutate the catalogue", () => {
    const before = structuredClone(CATALOGUE);
    resolveQuery(CATALOGUE, "cotton blue daily wear");
    expect(CATALOGUE).toEqual(before);
  });
});
