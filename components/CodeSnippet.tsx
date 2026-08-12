import type { Snippet } from "@/content/projects";

/**
 * A short extract of real code from the project.
 *
 * No syntax highlighting on purpose: a highlighter is a dependency, a bundle
 * cost and a second colour system competing with the teal/indigo semantics that
 * already mean something here. Mono at a readable size is enough for fifteen
 * lines.
 *
 * The source path is not decoration — it is the claim that this is real code
 * rather than an illustration, so it is always rendered. `caveat` exists because
 * an abridged extract that would not run needs to say so; a reader who spots
 * that themselves stops trusting the rest of the page.
 */
export default function CodeSnippet({ snippet }: { snippet: Snippet }) {
  return (
    <figure className="mt-8">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-2">
        <span className="label text-ink">{snippet.label}</span>
        <span className="label">{snippet.language}</span>
      </figcaption>

      {/* Long lines scroll inside the block; the page itself must never scroll
          sideways. */}
      <div className="mt-4 overflow-x-auto border border-rule bg-paper-2">
        <pre className="min-w-0 p-4 font-mono text-[12.5px] leading-relaxed text-ink-2">
          <code>{snippet.code}</code>
        </pre>
      </div>

      <p className="mt-3 font-mono text-[11.5px] text-ink-3">{snippet.source}</p>

      <p className="mt-3 max-w-measure text-[14px] text-ink-2">{snippet.note}</p>

      {snippet.caveat ? (
        <p className="mt-2 max-w-measure text-[13px] text-ink-3">{snippet.caveat}</p>
      ) : null}
    </figure>
  );
}
