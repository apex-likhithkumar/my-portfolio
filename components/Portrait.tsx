import Image from "next/image";
import { site } from "@/content/projects";

/**
 * Portrait plus a small identity block.
 *
 * The image is optional. When site.portrait is null the spec block still fills
 * the column, so the About grid looks deliberate rather than broken — a live
 * site should never ship a "drop your photo here" placeholder.
 *
 * To enable: put the file in /public and set site.portrait to its path.
 */
export default function Portrait() {
  return (
    <aside className="sm:pt-1.5">
      {site.portrait ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden border border-rule">
          <Image
            src={site.portrait}
            alt={`${site.name}, ${site.role}`}
            fill
            sizes="(min-width: 640px) 16rem, 100vw"
            className="object-cover"
            // Above the fold on most viewports once About is reached, but not on
            // first paint — let it lazy-load rather than compete with the hero.
            loading="lazy"
          />
        </div>
      ) : null}

      <dl className={`${site.portrait ? "mt-5" : ""} space-y-3`}>
        {[
          ["Role", site.role],
          ["Based", site.location],
          ["Focus", "LLM systems in production"],
        ].map(([k, v]) => (
          <div key={k} className="border-t border-rule pt-2.5">
            <dt className="label">{k}</dt>
            <dd className="mt-1 font-mono text-[13px] text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
