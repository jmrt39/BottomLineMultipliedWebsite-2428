import type { ReactNode } from "react";
import { ArrowUpRight, Plus } from "lucide-react";

/**
 * One chapter of the home page. Closed, it is a single headline with a gold
 * button; open, it shows the full section and a booking line at its foot.
 * Only one chapter is open at a time; the page owns which one.
 */
export function Fold({
  id,
  number,
  label,
  kicker,
  headline,
  promise,
  action,
  open,
  onToggle,
  onClose,
  className,
  cta,
  onBook,
  children,
}: {
  id: string;
  number: string;
  label: string;
  kicker: string;
  headline: ReactNode;
  promise: ReactNode;
  action: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  className: string;
  cta?: string;
  onBook: () => void;
  children: ReactNode;
}) {
  const titleId = `${id}-fold-title`;
  const bodyId = `${id}-fold-body`;
  return (
    <section
      className="fold"
      id={id}
      data-open={open ? "true" : undefined}
      aria-labelledby={titleId}
    >
      <div className="fold-head section-shell">
        <div className="fold-meta">
          <span className="eyebrow">
            {number} / {label}
          </span>
          <span className="eyebrow fold-kicker">{kicker}</span>
        </div>
        <h2 className="fold-title" id={titleId}>
          <button
            type="button"
            className="fold-trigger"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={onToggle}
          >
            <span className="fold-headline">
              <span className="fold-headline-lead">{headline}</span>{" "}
              <em className="fold-headline-promise">{promise}</em>
            </span>
            <span className="fold-action">
              <span className="fold-action-label">{open ? "Close" : action}</span>
              <span className="fold-action-icon" aria-hidden="true">
                <Plus size={16} strokeWidth={1.6} />
              </span>
            </span>
          </button>
        </h2>
      </div>
      <div className="fold-body" id={bodyId} inert={!open}>
        <div className="fold-clip">
          <div className={`${className} section-shell`}>{children}</div>
          <div className="fold-foot section-shell">
            {cta ? (
              <div className="fold-cta">
                <p>{cta}</p>
                <button type="button" className="fold-book" onClick={onBook}>
                  Book your complimentary consultation <ArrowUpRight size={17} />
                </button>
              </div>
            ) : null}
            <button type="button" className="fold-close" onClick={onClose}>
              Close this chapter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A quiet band of photographs between chapters. */
export function Interlude({
  kind,
  images,
  caption,
}: {
  kind: "band" | "trio" | "pair";
  images: { src: string; alt: string; label?: string }[];
  caption: [string, string];
}) {
  return (
    <aside className={`interlude interlude-${kind}`} aria-label={caption.join(" ")}>
      <div className="interlude-frames">
        {images.map((img) => (
          <figure className="interlude-frame" key={img.src}>
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
            {img.label ? <figcaption>{img.label}</figcaption> : null}
          </figure>
        ))}
      </div>
      <p className="interlude-caption section-shell">
        <span>{caption[0]}</span>
        <em>{caption[1]}</em>
        <small>Stills from the platform demo film · illustrative</small>
      </p>
    </aside>
  );
}
