import { type RefObject, useEffect } from "react";

/**
 * Scroll-triggered reveals. Elements matching `selectors` inside `rootRef` are
 * marked `data-reveal="pending"` (hidden by CSS) and switched to `"shown"` the
 * first time they enter the viewport. Elements entering together are staggered.
 *
 * Nothing is hidden unless this runs, so content stays visible without JS,
 * without IntersectionObserver, and for visitors who prefer reduced motion.
 * A data attribute is used (not a class) so React's className updates never
 * undo a reveal.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>, selectors: string[]) {
  const key = selectors.join("|");

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(key.split("|").join(",")));
    const fold = window.innerHeight;

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        entering.forEach((entry, index) => {
          const el = entry.target as HTMLElement;
          el.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 110}ms`);
          el.dataset.reveal = "shown";
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    for (const el of targets) {
      // Anything already on screen at load stays put; only content below the fold animates.
      if (el.getBoundingClientRect().top < fold * 0.9) continue;
      el.dataset.reveal = "pending";
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const el of targets) {
        delete el.dataset.reveal;
        el.style.removeProperty("--reveal-delay");
      }
    };
  }, [rootRef, key]);
}
