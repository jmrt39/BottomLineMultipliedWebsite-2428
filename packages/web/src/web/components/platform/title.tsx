import { SCENES, ease, easeOut, lerp } from "./timeline";

export function TitleScene({ t }: { t: number }) {
  const word = ease(t, 0.6, 2.6, easeOut);
  const rule = ease(t, 1.8, 3.4);
  const sub = ease(t, 2.6, 3.8, easeOut);
  const drift = lerp(1, 1.035, ease(t, 0, 6.5));
  return (
    <div className="platform-title" style={{ transform: `scale(${drift})` }}>
      <span className="platform-title-eyebrow" style={{ opacity: sub }}>
        Bottom Line Multiplied presents
      </span>
      <h1 style={{ opacity: word, transform: `translateY(${(1 - word) * 22}px)` }}>The Platform</h1>
      <span className="platform-title-rule" style={{ transform: `scaleX(${rule})` }} />
      <p style={{ opacity: sub, transform: `translateY(${(1 - sub) * 12}px)` }}>
        1906 Bar &amp; Grille <i>·</i> Server &amp; Bartender Training
      </p>
    </div>
  );
}

export function CloseScene({ t }: { t: number }) {
  const c0 = SCENES.close[0];
  const a = ease(t, c0 + 0.5, c0 + 2.2, easeOut);
  const b = ease(t, c0 + 1.6, c0 + 3.2, easeOut);
  const c = ease(t, c0 + 2.4, c0 + 3.8, easeOut);
  const drift = lerp(1.03, 1, ease(t, c0, SCENES.close[1]));
  return (
    <div className="platform-close" style={{ transform: `scale(${drift})` }}>
      <h2 style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>The Platform</h2>
      <p style={{ opacity: b, transform: `translateY(${(1 - b) * 12}px)` }}>
        Included for the first 12 months.
      </p>
      <div className="platform-close-brand" style={{ opacity: c }}>
        <img src="/images/blm-logo-corrected.png" alt="" />
        <span>
          Bottom Line
          <br />
          Multiplied
        </span>
      </div>
    </div>
  );
}
