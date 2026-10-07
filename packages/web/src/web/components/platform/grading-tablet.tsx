import { Check } from "lucide-react";
import { Cam } from "./camera";
import { Signature, Stars } from "./frame";
import { COMPETENCIES, GRADE_REVIEW, GRADE_SCORES, GRADE_WELL, MANAGER, TRAINER } from "./data";
import { SCENES, ease, easeOut, lerp, progress, rise, typed } from "./timeline";

const LABEL = ["", "Little to none", "Developing", "Moderate", "Strong", "Excellent"];
const ROW0 = 1.0;
const ROW_GAP = 0.5;
const CPS = 92;
const WELL_AT = 3.5;
const REVIEW_AT = WELL_AT + GRADE_WELL.length / CPS + 0.25;
const SIGN = [
  { label: "Trainee", name: "Maya Collins", which: 3 as const, at: 5.9 },
  { label: "Trainer", name: TRAINER.name, which: 2 as const, at: 7.3 },
  { label: "Manager", name: MANAGER.name, which: 0 as const, at: 8.7 },
];
const SIGN_DUR = 1.15;
const STAMP_AT = 10.1;

export function GradingScene({ t }: { t: number }) {
  const c = t - SCENES.grading[0];
  const stamp = ease(c, STAMP_AT, STAMP_AT + 0.5, easeOut);
  const done = progress(c, ROW0 + 5 * ROW_GAP + 0.6, ROW0 + 5 * ROW_GAP + 1.1);
  const avg = GRADE_SCORES.reduce((a, b) => a + b, 0) / GRADE_SCORES.length;
  const well = typed(GRADE_WELL, c, WELL_AT, CPS);
  const review = typed(GRADE_REVIEW, c, REVIEW_AT, CPS);
  const wellTyping = c >= WELL_AT && well.length < GRADE_WELL.length;
  const reviewTyping = c >= REVIEW_AT && review.length < GRADE_REVIEW.length;
  return (
    <Cam
      t={c}
      keys={[
        { t: -0.4, x: 960, y: 485, s: 1 },
        { t: 0.5, x: 960, y: 485, s: 1.02 },
        { t: 1.4, x: 700, y: 470, s: 1.3 },
        { t: 3.0, x: 700, y: 560, s: 1.3 },
        { t: 3.8, x: 1300, y: 360, s: 1.34 },
        { t: 5.4, x: 1300, y: 420, s: 1.34 },
        { t: 6.2, x: 1300, y: 590, s: 1.5 },
        { t: 9.4, x: 1320, y: 600, s: 1.5 },
        { t: 10.4, x: 1340, y: 700, s: 1.46 },
        { t: 11.6, x: 1180, y: 600, s: 1.16 },
      ]}
    >
      <div className="platform-device-wrap">
        <div className="platform-tablet">
          <div className="platform-tablet-screen">
            <header className="platform-grade-head" style={rise(c, -0.6, 0)}>
              <div>
                <span className="platform-kicker">Floor exercise · Manual p. 23</span>
                <h2>After Taking Orders: Full Roleplay</h2>
                <span className="platform-grade-meta">
                  Maya Collins, Server <i>·</i> Table 12 <i>·</i> Trainer {TRAINER.name} <i>·</i>{" "}
                  Manager {MANAGER.name}
                </span>
              </div>
              <div className="platform-grade-score" style={{ opacity: done }}>
                <strong>{avg.toFixed(1)}</strong>
                <span>of 5 · overall</span>
              </div>
            </header>
            <div className="platform-grade-body">
              <section className="platform-grade-rows">
                {COMPETENCIES.map((k, i) => {
                  const a = ROW0 + i * ROW_GAP;
                  const p = progress(c, a, a + 0.45);
                  const active = c >= a - 0.2 && c < a + ROW_GAP - 0.05;
                  return (
                    <div
                      key={k}
                      className={`platform-grade-row${active ? " is-active" : ""}`}
                      style={rise(c, -0.4, i, 0.06)}
                    >
                      <span className="platform-grade-label">
                        <small>{String(i + 1).padStart(2, "0")}</small>
                        {k}
                      </span>
                      <Stars shown={GRADE_SCORES[i] * p} size={30} pop={1} />
                      <span className="platform-grade-word" style={{ opacity: p }}>
                        {LABEL[GRADE_SCORES[i]]}
                      </span>
                    </div>
                  );
                })}
              </section>
              <section className="platform-grade-notes">
                <label style={rise(c, -0.2, 0)}>
                  <span>What was done well?</span>
                  <p>
                    {well}
                    {wellTyping && <i className="platform-caret" />}
                  </p>
                </label>
                <label style={rise(c, -0.1, 0)}>
                  <span>What needs review? (manual pages)</span>
                  <p>
                    {review}
                    {reviewTyping && <i className="platform-caret" />}
                  </p>
                </label>
                <div className="pv-signrow" style={rise(c, 0, 0)}>
                  {SIGN.map((s) => {
                    const p = progress(c, s.at, s.at + SIGN_DUR);
                    const active = c >= s.at - 0.3 && c < s.at + SIGN_DUR + 0.2;
                    return (
                      <div key={s.label} className={`pv-sign${active ? " is-active" : ""}`}>
                        <span>{s.label}</span>
                        <Signature which={s.which} p={p} />
                        <em>
                          {s.name}
                          {p >= 1 && <Check size={14} strokeWidth={2.6} />}
                        </em>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="platform-stamp"
                  style={{
                    opacity: stamp,
                    transform: `rotate(-6deg) scale(${lerp(1.35, 1, stamp)})`,
                  }}
                >
                  Signed off
                  <small>After Taking Orders &amp; Micros · 10 of 14</small>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Cam>
  );
}
