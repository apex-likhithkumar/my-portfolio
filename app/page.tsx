import Link from "next/link";
import TraceRail from "@/components/TraceRail";
import Reveal from "@/components/Reveal";
import ThemeToggle from "@/components/ThemeToggle";
import Portrait from "@/components/Portrait";
import RetrievalSandbox from "@/components/RetrievalSandbox";
import { site, projects, stack, education } from "@/content/projects";

/**
 * Landing page.
 *
 * Structured as alternating full-bleed bands rather than one continuous column.
 * The previous version set every section at the same visual weight, which read
 * as documentation — the rhythm here is what makes it read as a portfolio.
 * Sections own their own .shell so a band can reach the viewport edge while its
 * text stays on the grid.
 */
export default function Home() {
  return (
    <main>
      {/* ---------------------------------------------------------------- hero */}
      <header className="shell pt-14 sm:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <span className="label">{site.name}</span>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a className="label hover:text-ink" href="#work">
              Work
            </a>
            <a className="label hover:text-ink" href="#stack">
              Stack
            </a>
            <a className="label hover:text-ink" href="#about">
              About
            </a>
            <a className="label hover:text-ink" href="#contact">
              Contact
            </a>
            <ThemeToggle />
          </nav>
        </div>

        <h1 className="display display-hero mt-14 sm:mt-20">
          Forward-deployed
          <br />
          AI engineer
        </h1>

        <p className="lede mt-8 max-w-[46ch]">{site.statement}</p>
      </header>

      {/* The trace sits in a band directly under the hero: the first thing after
          the name is evidence, not more prose. */}
      <section className="band mt-16 py-14 sm:mt-24 sm:py-20">
        <div className="shell">
          <TraceRail />
        </div>
      </section>

      {/* The trace asserts the short-circuit; this lets the reader test it with
          their own input. Assertion followed immediately by proof. */}
      <section className="shell mt-20 sm:mt-28">
        <RetrievalSandbox />
      </section>

      {/* ---------------------------------------------------------------- work */}
      <section id="work" className="shell mt-24 scroll-mt-10 sm:mt-36">
        <div className="flex items-baseline justify-between border-b border-ink pb-3">
          <h2 className="label text-ink">Selected systems</h2>
          <span className="label">{projects.length} case studies</span>
        </div>

        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              <Reveal>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group block border-b border-rule py-10 transition-colors hover:bg-paper-2 sm:py-14"
                >
                  {/* 13rem, not 10: "Retail · conversational commerce" at 11px
                      mono with 0.14em tracking needs ~17rem to sit on one line,
                      so this trades an unavoidable wrap for a tidy two lines. */}
                  <div className="grid gap-x-10 gap-y-4 sm:grid-cols-[4rem_1fr_13rem]">
                    <span className="label pt-3">{p.index}</span>

                    <div>
                      <h3 className="display display-md">
                        {p.title}
                        <span className="ml-4 inline-block text-[0.5em] text-ink-3 transition-transform duration-300 group-hover:translate-x-1.5">
                          &rarr;
                        </span>
                      </h3>
                      <p className="mt-2 text-[16px] text-ink">{p.subtitle}</p>
                      <p className="mt-4 max-w-measure text-[15px] text-ink-2">{p.summary}</p>
                    </div>

                    <div className="sm:pt-3 sm:text-right">
                      <p className="label">{p.domain}</p>
                      <p className="label mt-1.5">{p.period}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------------- about */}
      <section id="about" className="band mt-24 scroll-mt-10 py-16 sm:mt-36 sm:py-24">
        <div className="shell">
          <h2 className="label">About</h2>

          <div className="mt-10 grid gap-x-14 gap-y-10 sm:grid-cols-[1fr_16rem]">
            <div>
              <p className="pull max-w-[34ch]">
                Most of applied AI is the unglamorous half: keeping output grounded, making
                retrieval cheap before it is clever, and being able to say what a request cost.
              </p>

              <div className="prose-block mt-9 text-[17px]">
                {site.intro.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <Portrait />
          </div>

          <dl className="mt-16">
            {education.map((e) => (
              <div
                key={e.school}
                className="grid gap-x-8 gap-y-1 border-t border-rule py-5 sm:grid-cols-[1fr_auto]"
              >
                <dt>
                  <span className="font-mono text-[14px] font-medium">{e.school}</span>
                  <span className="mt-0.5 block text-[15px] text-ink-2">{e.degree}</span>
                </dt>
                <dd className="label sm:text-right">{e.meta}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------------- stack */}
      <section id="stack" className="shell mt-24 scroll-mt-10 sm:mt-36">
        <h2 className="label border-b border-ink pb-3 text-ink">Stack</h2>
        <dl>
          {stack.map((g) => (
            <div
              key={g.label}
              className="grid gap-x-10 gap-y-2 border-b border-rule py-6 sm:grid-cols-[12rem_1fr]"
            >
              <dt className="label pt-1">{g.label}</dt>
              <dd className="text-[15px] text-ink-2">{g.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------- contact */}
      <section id="contact" className="band mt-24 scroll-mt-10 py-16 sm:mt-36 sm:py-24">
        <div className="shell">
          <h2 className="label">Contact</h2>
          <p className="display display-page mt-8">
            <a
              className="decoration-rule underline decoration-2 underline-offset-[8px] transition-colors hover:decoration-llm"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>
          <p className="mt-10 flex flex-wrap gap-x-8 gap-y-2">
            <a className="label hover:text-ink" href={site.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              className="label hover:text-ink"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a className="label hover:text-ink" href={site.resume}>
              Resume
            </a>
            <span className="label">{site.location}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
