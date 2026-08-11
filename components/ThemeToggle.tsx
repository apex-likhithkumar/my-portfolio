"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Dark/light switch.
 *
 * The initial theme is applied by the inline boot script in app/layout.tsx, not
 * here — this component only reports and changes it. That split is deliberate:
 * an effect runs after paint, so choosing the theme in React would flash the
 * wrong palette on every load.
 *
 * Because of that, first render cannot know the resolved theme without risking a
 * hydration mismatch. It renders a stable placeholder until mounted, then swaps
 * in the real label.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const explicit = document.documentElement.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") {
      setTheme(explicit);
      return;
    }
    // No stored choice — report whatever the OS resolved to.
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or storage disabled: the theme still applies for this
      // page view, it just will not survive a reload. Not worth surfacing.
    }
  }

  // The button names what clicking will DO, not what is currently on. Showing
  // the active theme reads as ambiguous — "Light" beside a dot could equally
  // mean "you are in light mode" or "click for light mode".
  const target: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      // Until mounted, theme is null and the label would be a guess. Hiding it
      // from assistive tech for that one frame beats announcing the wrong state.
      aria-hidden={theme === null}
      aria-label={theme === null ? undefined : `Switch to ${target} theme`}
      className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: target === "dark" ? "var(--llm)" : "var(--det)" }}
      />
      {/* Reserve the wider of the two words so the nav never reflows on toggle. */}
      <span className="inline-block min-w-[2.6em] text-left">
        {theme === null ? " " : target === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
