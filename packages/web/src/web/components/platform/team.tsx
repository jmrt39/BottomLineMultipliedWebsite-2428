// v2 manager-side scenes: Add a Colleague, continuing education, guest quotes, rewards.
import { Award, Check, Gift, GraduationCap, Pin, Send } from "lucide-react";
import { AppFrame, Bar } from "./frame";
import { Cam } from "./camera";
import {
  ADS_TARGET,
  EDUCATION,
  GUEST_QUOTES,
  INCENTIVES,
  MANAGER,
  MODULES,
  NEW_HIRE,
  ROLES,
  STAFF,
} from "./data";
import { SCENES, ease, easeOut, lerp, money, rise, typed } from "./timeline";

const pop = (c: number, at: number) => ease(c, at, at + 0.35, easeOut);

// ---------- Add a Colleague ----------
const COL = SCENES.colleague[0];
const NAME_AT = 0.9;
const ROLE_AT = 2.7;
const DATE_AT = 3.5;
const TRAINER_AT = 4.2;
const PATH_AT = 4.8;
const SEND_AT = 9.0;

export function ColleagueScene({ t }: { t: number }) {
  const c = t - COL;
  const name = typed(NEW_HIRE.name, c, NAME_AT, 13);
  const typing = c >= NAME_AT && name.length < NEW_HIRE.name.length;
  const sent = pop(c, SEND_AT + 0.35);
  const sweep = Math.floor(Math.max(0, (c - (ROLE_AT - 0.9)) / 0.18));
  return (
    <Cam
      t={c}
      keys={[
        { t: -0.4, x: 960, y: 520, s: 1 },
        { t: 0.7, x: 800, y: 380, s: 1.32 },
        { t: 2.0, x: 800, y: 380, s: 1.32 },
        { t: 3.2, x: 800, y: 560, s: 1.32 },
        { t: 4.6, x: 1260, y: 520, s: 1.12 },
        { t: 7.8, x: 1260, y: 520, s: 1.12 },
        { t: 8.8, x: 780, y: 800, s: 1.4 },
        { t: 10.6, x: 780, y: 800, s: 1.4 },
        { t: 12.8, x: 960, y: 520, s: 1.04 },
      ]}
    >
      <AppFrame active="colleague">
        <header className="platform-head" style={rise(c, -0.6, 0)}>
          <div>
            <span className="platform-kicker">Team · new starter</span>
            <h2>Add a Colleague</h2>
          </div>
          <span className="platform-head-meta">
            Program builds itself from the <b>1906 manual</b>
          </span>
        </header>
        <div className="pv-col">
          <section className="pv-form" style={rise(c, -0.4, 0)}>
            <label className={c >= NAME_AT - 0.3 && c < ROLE_AT - 1 ? "is-active" : ""}>
              <span>Full name</span>
              <p>
                {name || <i className="pv-ph">First and last name</i>}
                {typing && <i className="platform-caret" />}
              </p>
            </label>
            <div className={`pv-field${c >= ROLE_AT - 1 && c < DATE_AT ? " is-active" : ""}`}>
              <span>Role</span>
              <div className="pv-chips">
                {ROLES.map((r, i) => {
                  const on = r === NEW_HIRE.role && c >= ROLE_AT;
                  const hover = c < ROLE_AT && sweep === i;
                  return (
                    <span
                      key={r}
                      className={`pv-chip${on ? " is-on" : ""}${hover ? " is-hover" : ""}`}
                    >
                      {on && <Check size={14} strokeWidth={2.4} />}
                      {r}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="pv-form-row">
              <label className={c >= DATE_AT - 0.3 && c < TRAINER_AT ? "is-active" : ""}>
                <span>Start date</span>
                <p style={{ opacity: c >= DATE_AT ? 1 : 0.4 }}>
                  {c >= DATE_AT ? "Wed, Oct 7 · 4:00 pm" : "Select a date"}
                </p>
              </label>
              <label className={c >= TRAINER_AT - 0.3 && c < PATH_AT ? "is-active" : ""}>
                <span>Trainer</span>
                <p style={{ opacity: c >= TRAINER_AT ? 1 : 0.4 }}>
                  {c >= TRAINER_AT ? `${MANAGER.name} · ${MANAGER.role}` : "Assign a trainer"}
                </p>
              </label>
            </div>
            <div className="pv-send">
              <span
                className={`pv-btn${c >= SEND_AT - 0.3 && c < SEND_AT + 0.1 ? " is-pressed" : ""}`}
              >
                <Send size={16} /> Send welcome
              </span>
              <span
                className="pv-toast"
                style={{ opacity: sent, transform: `translateY(${(1 - sent) * 10}px)` }}
              >
                <Check size={16} strokeWidth={2.4} />
                <span>
                  Welcome sent to Camille
                  <small>Program starts Wed, Oct 7 · day one: Standards</small>
                </span>
              </span>
            </div>
          </section>
          <section className="pv-path">
            <div className="pv-path-head" style={{ opacity: ease(c, PATH_AT - 0.4, PATH_AT) }}>
              <span>Server program · {MODULES.length} modules</span>
              <b>{Math.round(MODULES.length * ease(c, PATH_AT, PATH_AT + 2.6, (x) => x))} added</b>
            </div>
            <ol>
              {MODULES.map((m, i) => (
                <li key={m.title} style={rise(c, PATH_AT, i, 0.17, 0.5, 12)}>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  <span>{m.title}</span>
                  <em>{m.floor ?? m.check}</em>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </AppFrame>
    </Cam>
  );
}

// ---------- continuing education ----------
const EDU = SCENES.education[0];
export function EducationScene({ t }: { t: number }) {
  const c = t - EDU;
  const ring = ease(c, 2.6, 4.4, easeOut);
  const done = Math.round(EDUCATION.complete * ring);
  const R = 74;
  const C = 2 * Math.PI * R;
  return (
    <Cam
      t={c}
      keys={[
        { t: -0.4, x: 960, y: 500, s: 1 },
        { t: 1.8, x: 960, y: 500, s: 1.04 },
        { t: 3.2, x: 1330, y: 470, s: 1.3 },
        { t: 9, x: 1330, y: 500, s: 1.34 },
      ]}
    >
      <AppFrame active="library">
        <header className="platform-head" style={rise(c, -0.6, 0)}>
          <div>
            <span className="platform-kicker">Continuing education</span>
            <h2>{EDUCATION.title}</h2>
          </div>
          <span className="platform-alert" style={rise(c, 0.2, 0)}>
            <i />
            {EDUCATION.due} <b>·</b> sent to all 9 front-of-house
          </span>
        </header>
        <div className="pv-edu">
          <section className="pv-edu-items">
            {EDUCATION.items.map((it, i) => (
              <div key={it.text} className="pv-card" style={rise(c, 0.3, i, 0.22)}>
                <span className="pv-tag">{it.kind}</span>
                <p>{it.text}</p>
              </div>
            ))}
          </section>
          <section className="pv-card pv-edu-check" style={rise(c, 1.0, 0)}>
            <span className="pv-tag">
              <GraduationCap size={14} /> 3-question check
            </span>
            <ol>
              {EDUCATION.check.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <div className="pv-ring">
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <circle cx="90" cy="90" r={R} className="track" />
                <circle
                  cx="90"
                  cy="90"
                  r={R}
                  className="fill"
                  strokeDasharray={`${C * (done / EDUCATION.of)} ${C}`}
                />
              </svg>
              <span>
                <strong>{done}</strong> of {EDUCATION.of}
                <small>complete</small>
              </span>
            </div>
            <div className="pv-edu-team">
              {STAFF.map((p, i) => {
                const ok = i !== 4 && i !== 8;
                return (
                  <span
                    key={p.name}
                    className={`platform-avatar${ok && ring > (i + 1) / 10 ? " is-done" : ""}`}
                  >
                    {p.initials}
                  </span>
                );
              })}
            </div>
            <em className="pv-edu-note" style={{ opacity: ease(c, 5.0, 5.6) }}>
              Reminder sent to Tessa and Chris · due Friday
            </em>
          </section>
        </div>
      </AppFrame>
    </Cam>
  );
}

// ---------- guest quotes ----------
const QUO = SCENES.quotes[0];
export function QuotesScene({ t }: { t: number }) {
  const c = t - QUO;
  const pin = pop(c, 2.8);
  return (
    <Cam
      t={c}
      keys={[
        { t: -0.4, x: 960, y: 500, s: 1 },
        { t: 1.8, x: 960, y: 500, s: 1.03 },
        { t: 3.0, x: 840, y: 400, s: 1.42 },
        { t: 5.6, x: 840, y: 400, s: 1.46 },
        { t: 7.6, x: 960, y: 500, s: 1.08 },
      ]}
    >
      <AppFrame active="feedback">
        <header className="platform-head" style={rise(c, -0.6, 0)}>
          <div>
            <span className="platform-kicker">Guest feedback · post-visit surveys</span>
            <h2>Setting the standard</h2>
          </div>
          <span className="platform-head-meta">
            <em>Always finding ways to go above and beyond.</em>
            <small>
              <b>38</b> responses this month <i>·</i> every quote tied to a team member
            </small>
          </span>
        </header>
        <section className="pv-quotes">
          {GUEST_QUOTES.map((q, i) => {
            const person = STAFF.find((s) => s.name === q.who);
            return (
              <figure
                key={q.who}
                className={`pv-quote${q.pinned ? " is-pinned" : ""}`}
                style={rise(c, 0.2, i, 0.2)}
              >
                {q.pinned && (
                  <span
                    className="pv-pin"
                    style={{ opacity: pin, transform: `scale(${lerp(1.4, 1, pin)})` }}
                  >
                    <Pin size={14} /> Read at pre-shift · Wed
                  </span>
                )}
                <blockquote>“{q.quote}”</blockquote>
                <figcaption>
                  <span className="platform-avatar">{person?.initials}</span>
                  <span>
                    {q.who}
                    <small>
                      {q.role} · {q.source}
                    </small>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </section>
      </AppFrame>
    </Cam>
  );
}

// ---------- recognition & rewards ----------
const REW = SCENES.rewards[0];
const BY_ADS = [...STAFF].sort((a, b) => b.ads - a.ads);
const LO = 50;
const HI = 90;
const EARNED: Record<string, string> = {
  "Monthly ADS bonus": "Earned · M. Hill, J. Price, S. Whitaker",
  "Guest-quote recognition": "Earned · M. Collins",
};

export function RewardsScene({ t }: { t: number }) {
  const c = t - REW;
  const grow = ease(c, 0.6, 2.8, easeOut);
  const targetX = ((ADS_TARGET - LO) / (HI - LO)) * 100;
  return (
    <Cam
      t={c}
      keys={[
        { t: -0.4, x: 960, y: 500, s: 1 },
        { t: 0.8, x: 960, y: 500, s: 1.02 },
        { t: 2.2, x: 860, y: 430, s: 1.3 },
        { t: 4.8, x: 860, y: 470, s: 1.3 },
        { t: 6.0, x: 1470, y: 470, s: 1.3 },
        { t: 7.4, x: 1470, y: 470, s: 1.3 },
        { t: 8.4, x: 1470, y: 566, s: 1.3 },
        { t: 10.0, x: 1470, y: 572, s: 1.33 },
        { t: 12.4, x: 960, y: 500, s: 1.04 },
      ]}
    >
      <AppFrame active="rewards">
        <header className="platform-head" style={rise(c, -0.6, 0)}>
          <div>
            <span className="platform-kicker">October · from the POS</span>
            <h2>Recognition &amp; rewards</h2>
          </div>
          <span className="pv-target" style={rise(c, 0, 0)}>
            <Award size={18} /> Monthly ADS target <b>{money(ADS_TARGET)}</b>
          </span>
        </header>
        <div className="pv-rew">
          <section className="pv-rew-board">
            <div className="pv-rew-th">
              <span>Team member</span>
              <span>Average dollar sale vs. target</span>
              <span>Status</span>
            </div>
            <div className="pv-rew-rows">
              <span
                className="pv-rew-line"
                style={{ left: `calc(200px + (100% - 498px) * ${targetX / 100})` }}
              >
                <b>{money(ADS_TARGET)}</b>
              </span>
              {BY_ADS.map((p, i) => {
                const v = lerp(p.baseline, p.ads, grow);
                const hit = p.ads >= ADS_TARGET && grow > 0.98;
                return (
                  <div
                    key={p.name}
                    className={`pv-rew-row${hit ? " is-hit" : ""}`}
                    style={rise(c, 0.1, i, 0.07)}
                  >
                    <span className="platform-who">
                      <span className="platform-avatar">{p.initials}</span>
                      <span>
                        {p.name}
                        <small>{p.role}</small>
                      </span>
                    </span>
                    <span className="pv-rew-bar">
                      <Bar value={v - LO} max={HI - LO} />
                      <b>{money(v)}</b>
                    </span>
                    <span className="pv-rew-status" style={{ opacity: ease(c, 2.6, 3.2) }}>
                      {p.ads >= ADS_TARGET ? (
                        <>
                          <Check size={14} strokeWidth={2.4} /> Target hit
                        </>
                      ) : (
                        `${money(ADS_TARGET - p.ads)} to go`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="pv-rew-list">
            <span className="pv-tag">
              <Gift size={14} /> Rewards on offer
            </span>
            <ol>
              {INCENTIVES.map((r, i) => {
                const earned = EARNED[r.title];
                const glow = earned ? pop(c, r.title === "Monthly ADS bonus" ? 7.6 : 8.4) : 0;
                return (
                  <li
                    key={r.title}
                    className={earned && glow > 0 ? "is-earned" : ""}
                    style={rise(c, 4.6, i, 0.12)}
                  >
                    <span>
                      {r.title}
                      <small>{earned && glow > 0 ? earned : r.detail}</small>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </AppFrame>
    </Cam>
  );
}
