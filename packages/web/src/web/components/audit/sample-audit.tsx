import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ADDED_SALES,
  BENCH,
  CHECK_LIFT,
  COGS,
  COVERS,
  COVERS_EACH,
  COVERS_PER_SERVICE,
  FLOW_THROUGH,
  NET_MARGIN,
  POUR,
  PROFIT,
  PROFIT_NOW,
  REST_AVG,
  ROOM_NOW,
  ROOM_TARGET,
  SALES_NOW,
  SPREAD,
  TIP_RATE,
  TIPS,
  TIPS_WEEK_EACH,
  TOTAL,
  composition,
  cents,
  COVER_SALES,
  COMPS,
  findings,
  pctOf,
  servers,
  usd,
} from "./model";

const PAGES = [
  { id: "summary", title: "Summary" },
  { id: "servers", title: "Your servers" },
  { id: "priorities", title: "What to fix first" },
  { id: "evidence", title: "What we saw" },
  { id: "bottom-line", title: "The bottom line" },
] as const;
const NUMERALS = ["I", "II", "III", "IV", "V"];

function PageHead({
  index,
  kicker,
  title,
  lede,
}: {
  index: number;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="ap-head">
      <span className="ap-kicker">
        <span>{NUMERALS[index]}</span>
        {kicker}
      </span>
      <h3>{title}</h3>
      {lede && <p className="ap-lede">{lede}</p>}
    </header>
  );
}

function Summary() {
  return (
    <>
      <PageHead
        index={0}
        kicker="Executive summary"
        title="What this dining room is leaving on the table."
      />
      <div className="ap-summary">
        <div className="ap-hero-figure">
          <span className="ap-figure">{usd(TOTAL)}</span>
          <span className="ap-figure-note">every year</span>
        </div>
        <blockquote className="ap-pull">
          Two of your eight servers already average {cents(BENCH)} a ticket. The other six average{" "}
          {cents(REST_AVG)}. The gap isn’t the menu, the room or the prices. It’s what happens at
          the table.
        </blockquote>
      </div>
      <dl className="ap-stats">
        <div>
          <dt>Every week</dt>
          <dd>{usd(TOTAL / 52)}</dd>
        </div>
        <div>
          <dt>Per ticket</dt>
          <dd>+{cents(CHECK_LIFT / COVERS)}</dd>
        </div>
        <div>
          <dt>Kept as profit</dt>
          <dd>{usd(PROFIT)}</dd>
        </div>
      </dl>
      <figure className="ap-composition" aria-label="Where the annual figure comes from">
        <figcaption className="ap-chart-title">Where it comes from</figcaption>
        <div className="ap-stack" aria-hidden="true">
          {composition.map((c) => (
            <span key={c.label} className={`ap-seg tone-${c.tone}`} style={{ flexGrow: c.value }} />
          ))}
        </div>
        <ul className="ap-legend">
          {composition.map((c) => (
            <li key={c.label}>
              <span className={`ap-swatch tone-${c.tone}`} />
              <span className="ap-legend-label">{c.label}</span>
              <strong>{usd(c.value)}</strong>
              <span className="ap-legend-pct">{pctOf(c.value, TOTAL)}</span>
            </li>
          ))}
        </ul>
        <p className="ap-math-note">
          {cents(CHECK_LIFT / COVERS)} per ticket × {COVERS.toLocaleString("en-US")} tickets a year ={" "}
          {usd(CHECK_LIFT)} in higher checks, plus {usd(COVER_SALES)} in tables that walked,{" "}
          {usd(COMPS)} in comps and {usd(POUR)} in pour. Every line is worked out under What we
          saw.
        </p>
      </figure>
    </>
  );
}

const LO = 60;
const HI = 95;
const x = (v: number) => `${((v - LO) / (HI - LO)) * 100}%`;

function Servers() {
  return (
    <>
      <PageHead
        index={1}
        kicker="Your servers"
        title={
          <>
            Same menu. Same room. <br />A {cents(SPREAD)} spread per ticket.
          </>
        }
        lede="Average spend per ticket by server, across six shifts over two weeks. Each target closes half the distance to your own top two."
      />
      <figure className="ap-servers" aria-label="Average spend per ticket by server, now and target">
        <div className="ap-sv-legend" aria-hidden="true">
          <span>
            <i className="k-now" /> Now
          </span>
          <span>
            <i className="k-target" /> Target
          </span>
          <span>
            <i className="k-bench" /> Top two · {cents(BENCH)}
          </span>
          <span>
            <i className="k-avg" /> Room today · {cents(ROOM_NOW)}
          </span>
        </div>
        <div className="ap-sv-chart">
          <div className="ap-sv-plot" aria-hidden="true">
            {[60, 70, 80, 90].map((t) => (
              <span key={t} className="ap-grid" style={{ left: x(t) }}>
                <em>${t}</em>
              </span>
            ))}
            <span className="ap-line-bench" style={{ left: x(BENCH) }} />
            <span className="ap-line-avg" style={{ left: x(ROOM_NOW) }} />
          </div>
          <ul className="ap-sv-rows">
            {servers.map((s) => (
              <li key={s.name}>
                <span className="ap-sv-name">{s.name}</span>
                <span className="ap-sv-track" aria-hidden="true">
                  <span className="ap-sv-target" style={{ width: x(s.target) }} />
                  <span className="ap-sv-now" style={{ width: x(s.now) }} />
                </span>
                <span className="ap-sv-vals">
                  {cents(s.now)}
                  {s.gap > 0 && <em> → {cents(s.target)}</em>}
                </span>
                <span className="ap-sv-year">{s.gap > 0 ? `+${usd(s.annual)}` : "Benchmark"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ap-sv-total">
          <span>The room</span>
          <span>
            {cents(ROOM_NOW)} <em>→</em> {cents(ROOM_TARGET)} per ticket
          </span>
          <strong>+{usd(CHECK_LIFT)} a year</strong>
        </div>
        <ServerMath />
      </figure>
    </>
  );
}

function ServerMath() {
  const ex = servers[2];
  const perServer = COVERS_EACH.toLocaleString("en-US");
  return (
    <p className="ap-math-note">
      How each line is worked out, using {ex.name}: half of the {cents(BENCH - ex.now)} between{" "}
      {cents(ex.now)} and the top two at {cents(BENCH)} = {cents(ex.gap)} per ticket × {perServer}{" "}
      tickets a year ({COVERS.toLocaleString("en-US")} tickets shared by {servers.length} servers) ={" "}
      {usd(ex.annual)}. The room: {cents(CHECK_LIFT / COVERS)} per ticket ×{" "}
      {COVERS.toLocaleString("en-US")} tickets = {usd(CHECK_LIFT)}.
    </p>
  );
}

function Priorities() {
  const ranked = [...findings].sort((a, b) => b.value - a.value);
  const max = ranked[0].value;
  const topTwo = ranked[0].value + ranked[1].value;
  return (
    <>
      <PageHead
        index={2}
        kicker="What to fix first"
        title="Eight leaks, ranked by what they’re worth."
        lede={`The wine list and the starter at seating are ${pctOf(topTwo, TOTAL)} of the total. That is where the program starts. The math behind every figure is on the next page.`}
      />
      <figure className="ap-rank" aria-label="Findings ranked by annual value">
        <ol>
          {ranked.map((f, i) => (
            <li key={f.title} className={i < 2 ? "is-top" : undefined}>
              <span className="ap-rank-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ap-rank-label">
                {f.title}
                <em>{f.moment}</em>
              </span>
              <span className="ap-rank-track" aria-hidden="true">
                <span style={{ width: `${(f.value / max) * 100}%` }} />
              </span>
              <span className="ap-rank-value">{usd(f.value)}</span>
            </li>
          ))}
        </ol>
      </figure>
    </>
  );
}

function Evidence() {
  return (
    <>
      <PageHead
        index={3}
        kicker="What we saw"
        title="Follow one table through the night."
        lede="Observed from inside your team, across six shifts. Every finding shows what we measured, the target, and the arithmetic behind the dollar figure."
      />
      <ol className="ap-evidence">
        {findings.map((f) => (
          <li key={f.title}>
            <div className="ap-ev-top">
              <span className="ap-ev-moment">{f.moment}</span>
              <span className="ap-ev-value">{usd(f.value)}</span>
            </div>
            <h4>{f.title}</h4>
            <p>{f.saw}</p>
            <dl className="ap-ev-math">
              <div>
                <dt>Now</dt>
                <dd>{f.now}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{f.target}</dd>
              </div>
              <div>
                <dt>Gap</dt>
                <dd>
                  {f.math} = <strong>{usd(f.value)} per year</strong>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </>
  );
}

function BottomLine() {
  // One scale for every bar on the page, so the same dollars are always the same length.
  const max = PROFIT_NOW + PROFIT;
  const w = (v: number) => `${(v / max) * 100}%`;
  const rows = [
    { label: "Sales recovered", value: ADDED_SALES, sign: "", tone: "ink" },
    { label: "Less cost of goods & fees", value: COGS, sign: "", tone: "neg" },
    { label: "Plus pour savings", value: POUR, sign: "+", tone: "gold" },
  ];
  return (
    <>
      <PageHead
        index={4}
        kicker="The bottom line"
        title="From the floor to the bottom line."
        lede="Rent and salaries are already paid. Added sales carry only their cost of goods, so most of every recovered dollar is kept."
      />
      <div className="ap-ledger">
        <figure className="ap-ledger-block" aria-label="Annual sales recovered to profit kept">
          <figcaption className="ap-chart-title">Recovered sales to profit, per year</figcaption>
          <ul className="ap-lg-rows">
            {rows.map((r) => (
              <li key={r.label} className="ap-lg-row">
                <span className="ap-lg-label">{r.label}</span>
                <span className="ap-lg-track">
                  <span className={`ap-lg-bar tone-${r.tone}`} style={{ width: w(r.value) }} />
                </span>
                <strong className="ap-lg-value">
                  {r.sign && <span className="ap-sign">{r.sign}</span>}
                  {r.tone === "neg" ? `(${usd(r.value)})` : usd(r.value)}
                </strong>
              </li>
            ))}
            <li className="ap-lg-row is-total">
              <span className="ap-lg-label">Kept as profit</span>
              <span className="ap-lg-track">
                <span className="ap-lg-bar tone-result" style={{ width: w(PROFIT) }} />
              </span>
              <strong className="ap-lg-value">{usd(PROFIT)}</strong>
            </li>
          </ul>
        </figure>
        <figure className="ap-ledger-block" aria-label="Net profit today and with the gap closed">
          <figcaption className="ap-chart-title">Net profit, per year</figcaption>
          <ul className="ap-lg-rows">
            <li className="ap-lg-row">
              <span className="ap-lg-label">Today, at {Math.round(NET_MARGIN * 100)}%</span>
              <span className="ap-lg-track">
                <span className="ap-lg-bar tone-ink" style={{ width: w(PROFIT_NOW) }} />
              </span>
              <strong className="ap-lg-value">{usd(PROFIT_NOW)}</strong>
            </li>
            <li className="ap-lg-row is-total">
              <span className="ap-lg-label">With the gap closed</span>
              <span className="ap-lg-track">
                <span className="ap-lg-bar tone-ink" style={{ width: w(PROFIT_NOW) }} />
                <span
                  className="ap-lg-bar tone-result is-added"
                  style={{ left: w(PROFIT_NOW), width: w(PROFIT) }}
                >
                  <small>+{usd(PROFIT)}</small>
                </span>
              </span>
              <strong className="ap-lg-value">{usd(PROFIT_NOW + PROFIT)}</strong>
            </li>
          </ul>
          <p className="ap-lg-note">Nearly double. Same room, same rent.</p>
        </figure>
      </div>
      <dl className="ap-stats ap-stats-foot">
        <div>
          <dt>Your servers</dt>
          <dd>+{usd(TIPS_WEEK_EACH)} a week</dd>
          <span>Each, in tips. {usd(TIPS)} a year across the team.</span>
        </div>
        <div>
          <dt>Each week you wait</dt>
          <dd>{usd(TOTAL / 52)}</dd>
          <span>In sales and savings. {usd(PROFIT / 52)} of it profit.</span>
        </div>
        <div>
          <dt>Sales today</dt>
          <dd>{usd(SALES_NOW)}</dd>
          <span>
            {COVERS_PER_SERVICE} tickets a night, six nights, {cents(ROOM_NOW)} a ticket.
          </span>
        </div>
      </dl>
      <p className="ap-assumptions">
        Assumptions: {Math.round(FLOW_THROUGH * 100)}% of added sales kept after cost of goods and
        card fees; comps and pour savings kept in full; tips at {Math.round(TIP_RATE * 100)}%;
        liquor at 18% of sales with a 20% pour cost; {Math.round(NET_MARGIN * 100)}% net margin
        today (fine dining typically runs 5 to 10%).
      </p>
    </>
  );
}

const RENDER = [Summary, Servers, Priorities, Evidence, BottomLine];

export function SampleAudit() {
  const [page, setPage] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // In the horizontal (phone) tab row, slide the active tab fully into view.
  useEffect(() => {
    const tab = tabs.current[page];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - list.offsetLeft;
    const target = Math.max(0, left - (list.clientWidth - tab.offsetWidth) / 2);
    list.scrollTo({ left: target, behavior: "smooth" });
  }, [page]);

  const go = (next: number, focusTab = false) => {
    const n = (next + PAGES.length) % PAGES.length;
    setPage(n);
    if (focusTab) tabs.current[n]?.focus();
    // On phones the pages differ in height: keep the top of the new page in view.
    const top = paperRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) paperRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(page + 1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(page - 1, true);
    }
  };

  const Page = RENDER[page];

  return (
    <div className="audit-viewer" ref={rootRef} data-inview={inView ? "true" : "false"}>
      <nav className="audit-rail" aria-label="Sample report pages">
        <span className="audit-rail-title">
          The Undercover Audit
          <em>Sample report</em>
        </span>
        <div role="tablist" aria-orientation="vertical" tabIndex={-1} onKeyDown={onKey}>
          {PAGES.map((p, i) => (
            <button
              key={p.id}
              ref={(b) => {
                tabs.current[i] = b;
              }}
              role="tab"
              id={`audit-tab-${p.id}`}
              aria-selected={page === i}
              aria-controls={`audit-page-${p.id}`}
              tabIndex={page === i ? 0 : -1}
              onClick={() => go(i)}
            >
              <span>{NUMERALS[i]}</span>
              {p.title}
            </button>
          ))}
        </div>
        <p className="audit-rail-note">
          A modeled dining room of 110 tickets a night. Every figure is illustrative. Yours is built from
          your POS data and your floor.
        </p>
      </nav>

      <div className="audit-paper" ref={paperRef}>
        <div className="audit-running">
          <span>The Undercover Audit · Sample</span>
          <span>Modeled restaurant · Illustrative figures</span>
        </div>
        <section
          key={PAGES[page].id}
          className={`audit-page page-${PAGES[page].id}`}
          role="tabpanel"
          id={`audit-page-${PAGES[page].id}`}
          aria-labelledby={`audit-tab-${PAGES[page].id}`}
        >
          <Page />
        </section>
        <footer className="audit-foot">
          <button
            type="button"
            onClick={() => go(page - 1)}
            aria-label="Previous page"
            disabled={page === 0}
          >
            <ArrowLeft size={14} />
          </button>
          <span className="audit-folio">
            {page + 1} <em>/</em> {PAGES.length}
          </span>
          {page < PAGES.length - 1 ? (
            <button type="button" className="audit-next" onClick={() => go(page + 1)}>
              Next · {PAGES[page + 1].title} <ArrowRight size={14} />
            </button>
          ) : (
            <button type="button" className="audit-next" onClick={() => go(0)}>
              Back to the summary <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
