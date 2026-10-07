// Tablet screens used twice: inside the filmed clips (keyed onto the green screen)
// and in the UI scenes. Each takes its own clock `c` in seconds.
import { Check, Send, Split } from "lucide-react";
import { Signature, Stars } from "./frame";
import {
  CLOSING_CHECKLIST,
  COWORKER,
  MANAGER,
  NEW_HIRE,
  OPENING_CHECKLIST,
  POS_STEPS,
  POS_TICKET,
  SILVER_CRITERIA,
  SILVER_SCORES,
} from "./data";
import { ease, easeOut, lerp, progress } from "./timeline";

const pop = (c: number, at: number) => ease(c, at, at + 0.35, easeOut);

// ---------- checklists ----------
// Staff tick and initial each line as it is done; the manager reviews, signs and submits.
const CHECK = {
  open: {
    kicker: "Opening checklist · Tue, Oct 6",
    title: "Dining room, open",
    items: OPENING_CHECKLIST,
    done: "Submitted 8:02 am",
  },
  close: {
    kicker: "Closing checklist · Tue, Oct 6",
    title: "Dining room, closed",
    items: CLOSING_CHECKLIST,
    done: "Submitted 11:52 pm",
  },
};
type Kind = keyof typeof CHECK;

/**
 * The checklist clock per kind (c = 0 near the manager's first touch on film; negative = earlier
 * shots of the montage). Ticks under a hand line up with the taps in the keyed clips: O4 (open,
 * row 3), C7 (close, rows 3 and 4) and LB-open (Verify, top right); C8 signs in the sheet.
 */
export const CHECK_TIMES: Record<
  Kind,
  {
    ticks: number[];
    /** extra initials added to an already ticked line: [row, initials, c] */
    cosign: [number, string, number][];
    verify: number;
    review: number;
    sheet: number;
    sign: number;
    signDur: number;
    /** manager spot-checks a line on film: [row, from, to] */
    spot: [number, number, number][];
    submit: number;
    sheetOut: number;
  }
> = {
  open: {
    ticks: [-20, -12, -6.65, -3.2, -2.2, -1.2],
    cosign: [],
    verify: 0.55,
    review: 4.2,
    sheet: 5.9,
    sign: 6.9,
    signDur: 1.4,
    spot: [],
    submit: 9.2,
    sheetOut: 10.3,
  },
  close: {
    ticks: [-30, -26, -2.55, -22, -18, -14, -10],
    cosign: [[3, "CO", 0.45]],
    verify: 0.72,
    review: 99,
    // C8 cuts in at c = 0.65 and is rendered with the sheet forced open; the last C7 frame can
    // read c = 0.65, so the unforced sheet waits until just after it.
    sheet: 0.72,
    sign: 0.75,
    signDur: 1.1,
    spot: [[4, 2.2, 3.6]],
    submit: 5.4,
    sheetOut: 6.6,
  },
};

const initialsAt = (kind: Kind, i: number, c: number) => {
  const T = CHECK_TIMES[kind];
  const late = T.cosign.filter(([row, , at]) => row === i && c < at).map(([, who]) => who);
  return CHECK[kind].items[i].by.filter((who) => !late.includes(who));
};

export function ChecklistScreen({
  kind,
  c,
  sheetOpen = false,
}: {
  kind: Kind;
  c: number;
  /** keyed clips that cut straight into the sign-off sheet render it open from frame 0 */
  sheetOpen?: boolean;
}) {
  const d = CHECK[kind];
  const T = CHECK_TIMES[kind];
  const n = d.items.length;
  const ticked = T.ticks.filter((x) => c >= x).length;
  const allDone = ticked === n;
  const verifyPressed = c >= T.verify - 0.1 && c < T.verify + 0.25;
  const reviewing = c >= T.verify + 0.25;
  const sheetIn = sheetOpen
    ? 1
    : kind === "close"
      ? c >= T.sheet
        ? 1
        : 0
      : ease(c, T.sheet, T.sheet + 0.6, easeOut);
  const sheet = sheetIn * (1 - ease(c, T.sheetOut, T.sheetOut + 0.6));
  const submitted = c >= T.submit + 0.35;
  const submitPressed = c >= T.submit && c < T.submit + 0.35;
  const signP = progress(c, T.sign, T.sign + T.signDur);
  const verified = pop(c, T.sheetOut + 0.4);
  const workers = [NEW_HIRE, COWORKER].map((p) => ({
    ...p,
    count: d.items.filter((_, i) => c >= T.ticks[i] && initialsAt(kind, i, c).includes(p.initials))
      .length,
  }));
  return (
    <div className="pv-screen pv-check">
      <header className="pv-head">
        <div>
          <span className="pv-kicker">{d.kicker}</span>
          <h2>{d.title}</h2>
        </div>
        <div className="pv-check-headright">
          <div className="pv-count">
            <strong>{ticked}</strong>
            <span>of {n} done</span>
          </div>
          <span
            className={`pv-verify${verifyPressed ? " is-pressed" : ""}${reviewing ? " is-on" : ""}`}
            style={{ opacity: allDone ? 1 : 0.28 }}
          >
            {submitted ? "Verified" : reviewing ? "Reviewing" : "Verify & sign"}
          </span>
        </div>
      </header>
      <ol className="pv-check-list">
        {d.items.map((item, i) => {
          const p = pop(c, T.ticks[i]);
          const who = initialsAt(kind, i, c);
          const tapped = c >= T.ticks[i] - 0.45 && c < T.ticks[i] + 0.45;
          const cosigned = T.cosign.some(
            ([row, , at]) => row === i && c >= at - 0.45 && c < at + 0.45,
          );
          const review = c >= T.review + i * 0.24 && c < T.review + i * 0.24 + 0.24;
          const spot = T.spot.some(([row, a, b]) => row === i && c >= a && c < b);
          return (
            <li
              key={item.text}
              className={((tapped || cosigned) && c < T.sheet) || review || spot ? "is-active" : ""}
            >
              <span className="pv-check-text">{item.text}</span>
              <span className="pv-check-time" style={{ opacity: p }}>
                {who.map((x) => (
                  <b key={x}>{x}</b>
                ))}
                {item.time}
              </span>
              <span className={`pv-box${p > 0 ? " is-on" : ""}`}>
                <Check
                  size={26}
                  strokeWidth={2.6}
                  style={{ opacity: p, transform: `scale(${lerp(0.4, 1, p)})` }}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <footer className="pv-check-foot">
        <div className="pv-by">
          <span>Completed by</span>
          <div>
            {workers.map((w) => (
              <span key={w.initials} className="pv-person" style={{ opacity: w.count ? 1 : 0.3 }}>
                <i>{w.initials}</i>
                {w.name}
              </span>
            ))}
          </div>
        </div>
        <div className="pv-verified">
          {verified > 0 ? (
            <>
              <Signature which={0} p={1} />
              <span style={{ opacity: verified }}>
                <small>Verified by</small>
                {MANAGER.name} · {MANAGER.role}
                <em>
                  <Check size={20} strokeWidth={2.4} /> {d.done}
                </em>
              </span>
            </>
          ) : (
            <span className="pv-pending">
              <small>Verified by</small>
              {allDone ? "Awaiting manager sign-off" : "Open"}
            </span>
          )}
        </div>
      </footer>
      <aside
        className="pv-sheet"
        style={{
          transform: `translateX(${(1 - sheet) * 104}%)`,
          visibility: sheet > 0 ? "visible" : "hidden",
        }}
      >
        <span className="pv-kicker">Manager sign-off</span>
        <h3>Verify and sign</h3>
        <span className="pv-sheet-label">Completed by</span>
        <ul className="pv-sheet-people">
          {workers.map((w) => (
            <li key={w.initials}>
              <i>{w.initials}</i>
              <span>
                {w.name}
                <small>{w.role}</small>
              </span>
              <b>
                {w.count} {w.count === 1 ? "line" : "lines"}
              </b>
            </li>
          ))}
        </ul>
        <span className="pv-sheet-label">Verified by</span>
        <div className="pv-sheet-sign">
          <Signature which={0} p={signP} />
        </div>
        <em className="pv-sheet-name">
          {MANAGER.name} · {MANAGER.role}
          {signP >= 1 && <Check size={20} strokeWidth={2.4} />}
        </em>
        <span
          className={`pv-submit${submitPressed ? " is-pressed" : ""}${submitted ? " is-done" : ""}`}
        >
          {submitted ? (
            <>
              <Check size={26} strokeWidth={2.4} /> {d.done}
            </>
          ) : (
            "Submit checklist"
          )}
        </span>
      </aside>
    </div>
  );
}

// ---------- POS walkthrough ----------
export const POS_ITEM_AT = [0.8, 2.2, 3.0, 3.6];
export const POS_STEP_AT = [1.9, 3.4, 5.6, 7.9];
export const POS_SPLIT = 4.6;
export const POS_SEND = 7.0;

export function PosScreen({ c }: { c: number }) {
  const split = ease(c, POS_SPLIT, POS_SPLIT + 0.8);
  const sent = pop(c, POS_SEND + 0.3);
  const total = (seat: number) =>
    POS_TICKET.filter((x) => x.seat === seat).reduce((s, x) => s + x.price, 0);
  return (
    <div className="pv-screen pv-pos">
      <header className="pv-head">
        <div>
          <span className="pv-kicker">Module 5 · After Taking Orders &amp; Micros · pp. 11–12</span>
          <h2>POS walkthrough</h2>
        </div>
        <div className="pv-who">
          <span>{NEW_HIRE.name}</span>
          <small>with {MANAGER.name}</small>
        </div>
      </header>
      <div className="pv-pos-body">
        <section className="pv-ticket">
          <div className="pv-ticket-head">
            <span>Micros · Table 12 · 2 guests</span>
            <b>{split > 0.5 ? "2 checks" : "1 check"}</b>
          </div>
          <div className="pv-ticket-cols" style={{ gap: lerp(0, 22, split) }}>
            {[1, 2].map((seat) => (
              <div
                key={seat}
                className="pv-ticket-col"
                style={{ borderColor: `rgba(31,30,27,${0.18 * split})` }}
              >
                <span className="pv-ticket-seat" style={{ opacity: split }}>
                  Check {seat} · ${total(seat)}.00
                </span>
                {POS_TICKET.map((x, i) =>
                  x.seat !== seat ? null : (
                    <div
                      key={x.item}
                      className="pv-ticket-line"
                      style={{
                        opacity: pop(c, POS_ITEM_AT[i]),
                        transform: `translateY(${(1 - pop(c, POS_ITEM_AT[i])) * 10}px)`,
                      }}
                    >
                      <span>
                        <small>S{x.seat}</small> {x.item}
                        <em>{x.mod}</em>
                      </span>
                      <b>{x.price}.00</b>
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="pv-pos-actions">
            <span className={c >= POS_SPLIT - 0.3 && c < POS_SPLIT + 0.1 ? "is-pressed" : ""}>
              <Split size={22} /> Split by seat
            </span>
            <span
              className={`is-primary${c >= POS_SEND - 0.3 && c < POS_SEND + 0.1 ? " is-pressed" : ""}`}
            >
              <Send size={22} /> {sent > 0 ? "Sent · Course 1 fired" : "Send"}
            </span>
          </div>
        </section>
        <ol className="pv-steps">
          {POS_STEPS.map((s, i) => {
            const p = pop(c, POS_STEP_AT[i]);
            return (
              <li key={s.title} className={p > 0 ? "is-done" : ""}>
                <span className={`pv-box${p > 0 ? " is-on" : ""}`}>
                  <Check size={22} strokeWidth={2.6} style={{ opacity: p }} />
                </span>
                <span>
                  {s.title}
                  <small>{s.detail}</small>
                  <em style={{ opacity: p }}>Checked by D. Kerr · {s.page}</em>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ---------- glassware & silverware ----------
// Rows 1–2 are rated during T2 (tablet off camera), rows 3–4 under Kerr's taps in T3, row 5 in
// the UI; the trainee signs at the start of LF-sign and the trainer near its end, then confirms.
// c = clip time − 2.0 (T3) and clip time + 11 (LF).
const ROWS = [-3.0, -1.6, 1.4, 2.8, 4.4];
export const SILVER = {
  row: (i: number) => ROWS[i],
  score: 6.6,
  button: 8.6,
  view: 9.4,
  trainee: 11.2,
  traineeDur: 1.6,
  trainer: 15.4,
  trainerDur: 1.3,
  confirm: 17.2,
  stamp: 17.6,
};
const WORD = ["", "Little to none", "Developing", "Moderate", "Strong", "Excellent"];

export function SilverScreen({ c }: { c: number }) {
  const view = ease(c, SILVER.view, SILVER.view + 0.7);
  const avg = SILVER_SCORES.reduce((a, b) => a + b, 0) / SILVER_SCORES.length;
  const score = pop(c, SILVER.score);
  const stamp = ease(c, SILVER.stamp, SILVER.stamp + 0.5, easeOut);
  return (
    <div className="pv-screen pv-silver">
      <header className="pv-head">
        <div>
          <span className="pv-kicker">Floor exercise · Standards, pp. 02–04</span>
          <h2>Glassware &amp; silverware</h2>
        </div>
        <div className="pv-who">
          <span>{NEW_HIRE.name}, Server</span>
          <small>Table 9 · Trainer {MANAGER.name}</small>
        </div>
      </header>
      <div className="pv-silver-track">
        <div style={{ transform: `translateX(${-100 * view}%)` }} className="pv-silver-page">
          <ol className="pv-grade-list">
            {SILVER_CRITERIA.map((k, i) => {
              const p = progress(c, SILVER.row(i), SILVER.row(i) + 0.4);
              const active = c >= SILVER.row(i) - 0.25 && c < SILVER.row(i) + 0.7;
              return (
                <li key={k} className={active ? "is-active" : ""}>
                  <span>
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    {k}
                  </span>
                  <Stars shown={SILVER_SCORES[i] * p} size={34} pop={1} />
                  <em style={{ opacity: p }}>{WORD[SILVER_SCORES[i]]}</em>
                </li>
              );
            })}
          </ol>
          <div className="pv-silver-foot">
            <span className="pv-score" style={{ opacity: score }}>
              <strong>{avg.toFixed(1)}</strong> of 5
            </span>
            <span
              className={`pv-submit${c >= SILVER.button && c < SILVER.button + 0.35 ? " is-pressed" : ""}`}
            >
              Sign off together
            </span>
          </div>
        </div>
        <div
          style={{ transform: `translateX(${100 - 100 * view}%)` }}
          className="pv-silver-page pv-signpad"
        >
          <p>Both signatures are required before this exercise counts toward the program.</p>
          <div className="pv-signpad-boxes">
            {[
              {
                label: "Trainee",
                name: NEW_HIRE.name,
                at: SILVER.trainee,
                dur: SILVER.traineeDur,
                which: 1 as const,
              },
              {
                label: "Trainer",
                name: MANAGER.name,
                at: SILVER.trainer,
                dur: SILVER.trainerDur,
                which: 0 as const,
              },
            ].map((s) => (
              <div key={s.label} className="pv-sign big">
                <span>{s.label}</span>
                <Signature which={s.which} p={progress(c, s.at, s.at + 1.6)} />
                <em>
                  {s.name} · Oct 6{c >= s.at + 1.6 && <Check size={20} strokeWidth={2.4} />}
                </em>
              </div>
            ))}
          </div>
          <span
            className={`pv-submit pv-confirm${c >= SILVER.confirm && c < SILVER.confirm + 0.35 ? " is-pressed" : ""}${stamp > 0 ? " is-done" : ""}`}
          >
            {stamp > 0 ? (
              <>
                <Check size={24} strokeWidth={2.4} /> Saved to the program
              </>
            ) : (
              "Confirm sign-off"
            )}
          </span>
          <div
            className="pv-stamp"
            style={{
              opacity: stamp,
              transform: `rotate(-5deg) scale(${lerp(1.35, 1, stamp)})`,
            }}
          >
            Signed off
            <small>Glassware &amp; silverware · 2 of 14</small>
          </div>
        </div>
      </div>
    </div>
  );
}
