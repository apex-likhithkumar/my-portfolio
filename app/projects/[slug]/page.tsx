import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ArchDiagram from "@/components/ArchDiagram";
import Metrics from "@/components/Metrics";
import CodeSnippet from "@/components/CodeSnippet";
import { projects, site } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};

  const title = `${p.title} — ${site.name}`;

  // openGraph has to be set explicitly. Returning only `description` overrides
  // the plain meta tag but leaves og:description inheriting the root layout's
  // generic bio, so every shared case-study link previewed identically.
  return {
    title,
    description: p.summary,
    openGraph: {
      title,
      description: p.summary,
      url: `${siteUrl}/projects/${p.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: p.summary,
    },
  };
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="mt-20 sm:mt-28">
      <div className="grid gap-x-10 gap-y-5 sm:grid-cols-[10rem_1fr]">
        <h2 className="label border-t border-ink pt-3">{label}</h2>
        <div className="sm:pt-3">{children}</div>
      </div>
    </Reveal>
  );
}

/** Full-bleed variant, for content that deserves to break the column. */
function BandSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="band mt-20 py-14 sm:mt-28 sm:py-20">
      <div className="shell">
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[10rem_1fr]">
          <h2 className="label border-t border-ink pt-3">{label}</h2>
          <div className="sm:pt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();

  const others = projects.filter((x) => x.slug !== p.slug);

  return (
    <main className="pb-24">
      {/* --------------------------------------------------------------- head */}
      <header className="shell pt-14 sm:pt-20">
        <Link href="/" className="label hover:text-ink">
          &larr; {site.name}
        </Link>

        <div className="mt-16 flex flex-wrap items-baseline gap-x-4">
          <span className="label">{p.index}</span>
          <span className="label">{p.domain}</span>
        </div>

        <h1 className="display display-page mt-4">{p.title}</h1>
        <p className="lede mt-5 max-w-[48ch]">{p.subtitle}</p>
        <p className="mt-8 max-w-measure text-[17px] text-ink-2">{p.summary}</p>

        {/* meta strip */}
        <dl className="mt-14 grid grid-cols-2 gap-y-6 border-y border-rule py-6 sm:grid-cols-4">
          {[
            ["Role", p.role],
            ["Team", p.team],
            ["Period", p.period],
            ["Domain", p.domain],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="label">{k}</dt>
              <dd className="mt-1 font-mono text-[13px]">{v}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
          {p.stack.map((s) => (
            <li
              key={s}
              className="border border-rule px-2.5 py-1 font-mono text-[12px] text-ink-2"
            >
              {s}
            </li>
          ))}
        </ul>

        {/* "Here's the code" is the cheapest credibility on the page. When there
            isn't any, say why — silence on a client project reads as an
            oversight rather than a boundary. */}
        <p className="mt-6">
          {p.repo ? (
            <a
              className="label inline-flex items-center gap-2 text-ink transition-colors hover:text-llm"
              href={p.repo}
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
              <span aria-hidden>&#8599;</span>
            </a>
          ) : p.repoNote ? (
            <span className="label">{p.repoNote}</span>
          ) : null}
        </p>
      </header>

      {/* ------------------------------------------------------------ content */}
      {/* Numbers before prose. A reader scanning for 45 seconds should hit the
          measured results before the narrative, not after it. Renders nothing
          while metrics is empty. */}
      <Metrics metrics={p.metrics} />

      <div className="shell">
        <Section label="The problem">
          <div className="prose-block text-[17px]">
            {p.problem.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </Section>

        <Section label="How it works">
          <div className="prose-block text-[17px]">
            {p.architecture.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </Section>
      </div>

      {/* The diagram gets its own band. The prose explains the system; the figure
          lets someone skim it in five seconds, and interviewers do the second
          thing first — so it earns the break in the column. */}
      <BandSection label="Architecture">
        <ArchDiagram diagram={p.diagram} />
      </BandSection>

      <div className="shell">
        {/* Decisions are the point of the page — this is what an interviewer
            actually wants to talk about, so it gets the strongest treatment. */}
        <Section label="Decisions and trade-offs">
        <ol className="space-y-10">
          {p.decisions.map((d, i) => (
            <li key={d.title} className="grid gap-x-6 sm:grid-cols-[2.5rem_1fr]">
              <span className="label pt-1.5">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-mono text-[15px] font-medium leading-snug tracking-tight text-llm">
                  {d.title}
                </h3>
                <p className="mt-2 max-w-measure text-[16px] text-ink-2">{d.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Code sits after the decisions: by this point the reader knows what was
          decided, and can check the claim against the thing itself. */}
      {p.snippets.length > 0 ? (
        <Section label="In the code">
          {p.snippets.map((s) => (
            <CodeSnippet key={s.label} snippet={s} />
          ))}
        </Section>
      ) : null}

      <Section label="What I built">
        <div className="prose-block text-[17px]">
          {p.contribution.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </Section>

      <Section label="Where it landed">
        <div className="prose-block text-[17px]">
          {p.outcome.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- next up */}
      <nav className="mt-28 border-t border-ink pt-3 sm:mt-40">
        <span className="label">More work</span>
        <ul className="mt-6">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/projects/${o.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-rule py-6"
              >
                <span className="display text-[clamp(1.3rem,3vw,1.9rem)]">
                  {o.title}
                  <span className="ml-3 inline-block text-ink-3 transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
                <span className="label">{o.domain}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          <a className="label hover:text-ink" href={`mailto:${site.email}`}>
            Email
          </a>
          <a className="label hover:text-ink" href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="label hover:text-ink" href={site.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          </p>
        </nav>
      </div>
    </main>
  );
}
