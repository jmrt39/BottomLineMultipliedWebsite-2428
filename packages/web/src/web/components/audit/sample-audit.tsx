import {
  type KeyboardEvent,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ADDED_SALES,
  BENCH,
  CHECK_FINDINGS,
  CHECK_LIFT,
  COGS,
  COVERS,
  COVERS_EACH,
  COVERS_PER_SERVICE,
  FLOW_THROUGH,
  LIQUOR_SHARE,
  NET_MARGIN,
  NIGHTS_PER_WEEK,
  POUR,
  POUR_COST,
  PROFIT,
  PROFIT_NOW,
  REST_AVG,
  ROOM_NOW,
  ROOM_TARGET,
  SALES_NOW,
  SERVICES_PER_YEAR,
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
  { id: "method", title: "How the numbers were built" },
] as const;
const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];
const METHOD = PAGES.length - 1;
/** The short version an owner sees first: the summary and what to fix first. */
const SHORT = [0, 2];
const ALL = PAGES.map((_, i) => i);

/** Event the rest of the page can dispatch to open the report on its back page. */
export const OPEN_AUDIT_METHOD = "audit:open-method";

// Lets any page turn to the back page, where its arithmetic is worked out.
const ToMethod = createContext<() => void>(() => {});

function MethodLink({ children }: { children: ReactNode }) {
  const open = useContext(ToMethod);
  return (
    <button type="button" className="ap-to-method" onClick={open}>
      <span>{children}</span>
      <em>
        Page {NUMERALS[METHOD]} <ArrowRight size={11} />
      </em>
    </button>
  );
}

/** A note on the first page: where the arithmetic lives. */
function MethodNote() {
  const open = useContext(ToMethod);
  return (
    <aside className="ap-method-note">
      <p>
        <b>How the math was calculated.</b> Every figure in this report, and one finding worked
        through in full, is on the last page.
      </p>
      <button type="button" onClick={open}>
        Go to page {NUMERALS[METHOD]} · How the numbers were built <ArrowRight size={11} />
      </button>
    </aside>
  );
}

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
        title="What this modeled restaurant is leaving on the table."
      />
      <MethodNote />
      <div className="ap-summary">
        <div className="ap-hero-figure">
          <span className="ap-figure">{usd(TOTAL)}</span>
          <span className="ap-figure-note">estimated, every year</span>
          <span className="ap-figure-guarantee">
            This model finds 9.4% of annual sales. Our guarantee starts at 5%.
          </span>
        </div>
        <blockquote className="ap-pull">
          Two of your eight servers already average {cents(BENCH)} a ticket. The other six average{" "}
          {cents(REST_AVG)}. The gap isn’t the menu, the setting or the prices. It’s what happens at
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
          <dt>Estimated contribution</dt>
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
        <MethodLink>How each of these figures was calculated</MethodLink>
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
            Same menu. Same tables. <br />A {cents(SPREAD)} spread per ticket.
          </>
        }
        lede="Average spend per ticket by server, across six shifts over two weeks. Each target closes half the distance to your own top two."
      />
      <figure
        className="ap-servers"
        aria-label="Average spend per ticket by server, now and target"
      >
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
            <i className="k-avg" /> Average today · {cents(ROOM_NOW)}
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
          <span>The restaurant</span>
          <span>
            {cents(ROOM_NOW)} <em>→</em> {cents(ROOM_TARGET)} per ticket
          </span>
          <strong>+{usd(CHECK_LIFT)} a year</strong>
        </div>
        <MethodLink>How each target and yearly figure was calculated</MethodLink>
      </figure>
    </>
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
        lede={`The wine list and the starter at seating are ${pctOf(topTwo, TOTAL)} of the total. That is where the program starts. The arithmetic behind every figure is on the back page.`}
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
        lede="Observed from inside your team, across six shifts. Every finding shows what we measured and the target. The arithmetic behind each dollar figure is on the back page."
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
            </dl>
          </li>
        ))}
      </ol>
      <MethodLink>The arithmetic behind each of the eight figures</MethodLink>
    </>
  );
}

function BottomLine() {
  // One scale for every bar on the page, so the same dollars are always the same length.
  const max = PROFIT_NOW + PROFIT;
  const w = (v: number) => `${(v / max) * 100}%`;
  const rows = [
    { label: "Added sales & comps recovered", value: ADDED_SALES, sign: "", tone: "ink" },
    { label: "Less cost of goods & fees", value: COGS, sign: "", tone: "neg" },
    { label: "Plus pour savings", value: POUR, sign: "+", tone: "gold" },
  ];
  return (
    <>
      <PageHead
        index={4}
        kicker="The bottom line"
        title="From the floor to the bottom line."
        lede="Rent and salaries are already paid. Added sales carry only their cost of goods and card fees, so most of every recovered dollar reaches the bottom line. We call that estimated contribution."
      />
      <div className="ap-ledger">
        <figure className="ap-ledger-block" aria-label="Annual sales recovered to profit kept">
          <figcaption className="ap-chart-title">
            Recovered sales to estimated contribution, per year
          </figcaption>
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
              <span className="ap-lg-label">Estimated contribution</span>
              <span className="ap-lg-track">
                <span className="ap-lg-bar tone-result" style={{ width: w(PROFIT) }} />
              </span>
              <strong className="ap-lg-value">{usd(PROFIT)}</strong>
            </li>
          </ul>
        </figure>
        <figure className="ap-ledger-block" aria-label="Net profit today and with the gap closed">
          <figcaption className="ap-chart-title">Modeled net profit, per year</figcaption>
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
          <p className="ap-lg-note">Nearly double, in this model. Same restaurant, same rent.</p>
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
          <span>In sales and savings. {usd(PROFIT / 52)} of it estimated contribution.</span>
        </div>
        <div>
          <dt>Modeled sales today</dt>
          <dd>{usd(SALES_NOW)}</dd>
          <span>
            {COVERS_PER_SERVICE} tickets a night, six nights, {cents(ROOM_NOW)} a ticket.
          </span>
        </div>
      </dl>
      <MethodLink>Every assumption behind this page, and the arithmetic</MethodLink>
    </>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="ap-mt-block">
      <h4 className="ap-mt-step">
        <span>{n}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function HowBuilt() {
  const n = (v: number) => v.toLocaleString("en-US");
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const [a, b] = servers;
  const ex = servers[2];
  const wine = findings.find((f) => f.title === "The wine list, explained")!;
  const newSales = CHECK_LIFT + COVER_SALES;
  const kept = Math.round(newSales * FLOW_THROUGH);
  const inputs = [
    [
      "Tickets a night",
      n(COVERS_PER_SERVICE),
      "Set for a typical independent fine dining restaurant",
    ],
    ["Dinners a year", n(SERVICES_PER_YEAR), `${NIGHTS_PER_WEEK} services a week × 52 weeks`],
    ["Tickets a year", n(COVERS), `${COVERS_PER_SERVICE} × ${SERVICES_PER_YEAR}`],
    [
      "Servers",
      String(servers.length),
      `Each carries ${n(COVERS_EACH)} tickets a year (${n(COVERS)} ÷ ${servers.length})`,
    ],
    [
      "Average ticket today",
      cents(ROOM_NOW),
      "Net sales ÷ tickets for each server in step B; the restaurant is the average of the eight",
    ],
    ["Sales a year", usd(SALES_NOW), `${cents(ROOM_NOW)} × ${n(COVERS)} tickets`],
    [
      "Kept from each added dollar",
      pct(FLOW_THROUGH),
      "Left after about 30% cost of goods and 4% card fees",
    ],
    ["Liquor", `${pct(LIQUOR_SHARE)} of sales`, `At a ${pct(POUR_COST)} pour cost`],
    ["Tips", pct(TIP_RATE), "Of every added dollar on the check"],
    ["Net margin today", pct(NET_MARGIN), "Fine dining typically runs 5 to 10%"],
  ];
  return (
    <>
      <PageHead
        index={5}
        kicker="How the numbers were built"
        title="Every figure in this report, worked out."
        lede="Where each number comes from, so any of it can be checked with a calculator. In your report, every input below is replaced with your own POS data and what we observe on your floor."
      />

      <Step n="A" title="The inputs">
        <table className="ap-mt-table ap-mt-inputs">
          <thead>
            <tr>
              <th scope="col">Input</th>
              <th scope="col">Value</th>
              <th scope="col">How it was set</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map(([label, value, from]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td className="is-num">{value}</td>
                <td>{from}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ap-mt-text">
          In your report, tickets, sales and the average ticket by server come from your POS; the
          rates seen at the table come from the six shifts we work; cost and margin figures come
          from you.
        </p>
      </Step>

      <Step n="B" title="Higher checks, server by server">
        <p className="ap-mt-text">
          Each target closes half the distance between a server’s average today and the average of
          the restaurant’s own top two, {cents(BENCH)} ({cents(a.now)} and {cents(b.now)}). Not an
          industry benchmark. For {ex.name}: ({cents(BENCH)} less {cents(ex.now)}) ÷ 2 ={" "}
          {cents(ex.gap)} per ticket × {n(COVERS_EACH)} tickets = <b>{usd(ex.annual)}</b> a year.
        </p>
        <table className="ap-mt-table ap-mt-servers">
          <thead>
            <tr>
              <th scope="col">Server</th>
              <th scope="col">Now</th>
              <th scope="col">Target</th>
              <th scope="col">Per ticket</th>
              <th scope="col">A year</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((s) => (
              <tr key={s.name}>
                <th scope="row">{s.name}</th>
                <td className="is-num">{cents(s.now)}</td>
                <td className="is-num">{cents(s.target)}</td>
                <td className="is-num">{s.gap > 0 ? `+${cents(s.gap)}` : "Top"}</td>
                <td className="is-num">{s.gap > 0 ? usd(s.annual) : "None"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">All eight</th>
              <td className="is-num">{cents(ROOM_NOW)}</td>
              <td className="is-num">{cents(ROOM_TARGET)}</td>
              <td className="is-num">+{cents(CHECK_LIFT / COVERS)}</td>
              <td className="is-num">{usd(CHECK_LIFT)}</td>
            </tr>
          </tfoot>
        </table>
      </Step>

      <Step n="C" title="The eight findings">
        <ol className="ap-mt-findings">
          {findings.map((f) => (
            <li key={f.title}>
              <span className="ap-mt-f-title">{f.title}</span>
              <span className="ap-mt-f-math">
                {f.math} = <b>{usd(f.value)}</b>
              </span>
            </li>
          ))}
        </ol>
        <p className="ap-mt-text">
          The five habits at the table (starter, wine, features, call brands, dessert) add up to{" "}
          <b>{usd(CHECK_FINDINGS)}</b>, the same lift as step B seen by habit instead of by server,
          so it is counted once. All eight together: <b>{usd(TOTAL)}</b> a year in added sales and
          savings.
        </p>
      </Step>

      <Step n="D" title="One finding, worked in full">
        <p className="ap-mt-text">
          Every finding in a real report is laid out this way. Here is the largest one in this
          sample: <i>{wine.title}</i>.
        </p>
        <dl className="ap-mt-case">
          <div>
            <dt>
              <span>I</span>Finding
            </dt>
            <dd>
              Servers present the wine list as prices, not pairings. Wine per ticket sits at $17.80,
              and the restaurant’s own best nights show it can carry $19.90.
            </dd>
          </div>
          <div>
            <dt>
              <span>II</span>Evidence
            </dt>
            <dd>
              {wine.saw} Wine per ticket comes from the POS, divided by tickets rung in across the
              six observed shifts.
            </dd>
          </div>
          <div>
            <dt>
              <span>III</span>Estimated opportunity
            </dt>
            <dd>
              <span className="ap-mt-case-math">
                {wine.math} = <b>{usd(wine.value)} added sales a year</b>
              </span>
              <span className="ap-mt-case-math">
                {usd(wine.value)} × {pct(FLOW_THROUGH)} after cost of goods and card fees ={" "}
                <b>{usd(wine.value * FLOW_THROUGH)} estimated contribution</b>
              </span>
            </dd>
          </div>
          <div>
            <dt>
              <span>IV</span>Recommended action
            </dt>
            <dd>
              <ul>
                <li>Every server learns two pairings for each entrée and one line on why.</li>
                <li>A second glass is offered as the first runs low, every time.</li>
                <li>Tables of four or more are offered a bottle by name.</li>
                <li>
                  Tracked monthly on the platform: wine per ticket by server, against the $17.80
                  starting point.
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </Step>

      <Step n="E" title="From added sales to the bottom line">
        <dl className="ap-mt-ledger">
          <div>
            <dt>Higher checks, from step B</dt>
            <dd>{usd(CHECK_LIFT)}</dd>
          </div>
          <div>
            <dt>
              <i>+</i> Tables that walked
            </dt>
            <dd>{usd(COVER_SALES)}</dd>
          </div>
          <div className="is-sub">
            <dt>
              <i>=</i> New sales
            </dt>
            <dd>{usd(newSales)}</dd>
          </div>
          <div>
            <dt>
              <i>×</i> {pct(FLOW_THROUGH)} kept after cost of goods and card fees
            </dt>
            <dd>{usd(kept)}</dd>
          </div>
          <div>
            <dt>
              <i>+</i> Comps recovered, kept in full
            </dt>
            <dd>{usd(COMPS)}</dd>
          </div>
          <div>
            <dt>
              <i>+</i> Pour savings, kept in full
            </dt>
            <dd>{usd(POUR)}</dd>
          </div>
          <div className="is-total">
            <dt>
              <i>=</i> Estimated contribution
            </dt>
            <dd>{usd(PROFIT)}</dd>
          </div>
        </dl>
        <p className="ap-mt-text">
          Rent and salaries are already paid, so an added sale only carries its cost of goods and
          card fees. Comps and overpour are kept in full: the food and liquor are already bought,
          and the restaurant simply stops giving them away.
        </p>
      </Step>

      <Step n="F" title="The other figures in the report">
        <ul className="ap-mt-others">
          <li>
            <span>Per ticket</span>
            <p>
              {usd(CHECK_LIFT)} ÷ {n(COVERS)} tickets = <b>+{cents(CHECK_LIFT / COVERS)}</b>
            </p>
          </li>
          <li>
            <span>Every week</span>
            <p>
              {usd(TOTAL)} ÷ 52 = <b>{usd(TOTAL / 52)}</b>
            </p>
          </li>
          <li>
            <span>Net profit today</span>
            <p>
              {usd(SALES_NOW)} × {pct(NET_MARGIN)} = <b>{usd(PROFIT_NOW)}</b>
            </p>
          </li>
          <li>
            <span>With the gap closed</span>
            <p>
              {usd(PROFIT_NOW)} + {usd(PROFIT)} = <b>{usd(PROFIT_NOW + PROFIT)}</b>
            </p>
          </li>
          <li>
            <span>Your servers</span>
            <p>
              {usd(newSales)} × {pct(TIP_RATE)} tips = {usd(TIPS)} ÷ {servers.length} servers ÷ 52
              weeks = <b>{usd(TIPS_WEEK_EACH)} a week each</b>
            </p>
          </li>
        </ul>
      </Step>

      <p className="ap-mt-close">
        This is a model, not a forecast. Every target is set from the restaurant’s own best servers
        and best nights, and each server is asked to close only half the gap.
      </p>
    </>
  );
}

const RENDER = [Summary, Servers, Priorities, Evidence, BottomLine, HowBuilt];

export function SampleAudit() {
  const [page, setPage] = useState(0);
  const [full, setFull] = useState(false);
  const visible = full ? ALL : SHORT;
  const pos = Math.max(0, visible.indexOf(page));
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

  const keepInView = () => {
    // On phones the pages differ in height: keep the top of the new page in view.
    const top = paperRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) paperRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  /** Turn to a page by its place in the report; opens the full report if it is hidden. */
  const show = (index: number) => {
    if (!visible.includes(index)) setFull(true);
    setPage(index);
    keepInView();
  };

  /** Step through the visible pages. */
  const go = (next: number, focusTab = false) => {
    const k = (next + visible.length) % visible.length;
    const n = visible[k] ?? 0;
    setPage(n);
    if (focusTab) tabs.current[k]?.focus();
    keepInView();
  };

  const toggleFull = () => {
    if (full) {
      setFull(false);
      if (!SHORT.includes(page)) setPage(0);
    } else {
      setFull(true);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(pos + 1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(pos - 1, true);
    }
  };

  // Elsewhere on the page, a link can open the report straight to its back page.
  useEffect(() => {
    const open = () => {
      setInView(true);
      setFull(true);
      setPage(METHOD);
      paperRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    window.addEventListener(OPEN_AUDIT_METHOD, open);
    return () => window.removeEventListener(OPEN_AUDIT_METHOD, open);
  }, []);

  const Page = RENDER[page];

  return (
    <div className="audit-viewer" ref={rootRef} data-inview={inView ? "true" : "false"}>
      <nav className="audit-rail" aria-label="Sample report pages">
        <span className="audit-rail-title">
          The Undercover Audit
          <em>Sample report</em>
        </span>
        <div role="tablist" aria-orientation="vertical" tabIndex={-1} onKeyDown={onKey}>
          {visible.map((i, k) => {
            const p = PAGES[i];
            return (
              <button
                key={p.id}
                ref={(b) => {
                  tabs.current[k] = b;
                }}
                role="tab"
                id={`audit-tab-${p.id}`}
                aria-selected={page === i}
                aria-controls={`audit-page-${p.id}`}
                tabIndex={page === i ? 0 : -1}
                onClick={() => go(k)}
              >
                <span>{NUMERALS[i]}</span>
                {p.title}
              </button>
            );
          })}
        </div>
        <button type="button" className="audit-expand" aria-expanded={full} onClick={toggleFull}>
          {full ? (
            <>
              Show the short version <em>2 pages</em>
            </>
          ) : (
            <>
              See how every number was built <em>All 6 pages</em>
            </>
          )}
        </button>
        <p className="audit-rail-note">
          A modeled restaurant, not a client: {COVERS_PER_SERVICE} tickets a night, six nights a
          week, eight servers. Every figure is illustrative. Yours is built from your POS data and
          your floor.
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
          <ToMethod.Provider value={() => show(METHOD)}>
            <Page />
          </ToMethod.Provider>
        </section>
        <footer className="audit-foot">
          <button
            type="button"
            onClick={() => go(pos - 1)}
            aria-label="Previous page"
            disabled={pos === 0}
          >
            <ArrowLeft size={14} />
          </button>
          <span className="audit-folio">
            {pos + 1} <em>/</em> {visible.length}
          </span>
          {pos < visible.length - 1 ? (
            <button type="button" className="audit-next" onClick={() => go(pos + 1)}>
              Next · {PAGES[visible[pos + 1] ?? 0].title} <ArrowRight size={14} />
            </button>
          ) : full ? (
            <button type="button" className="audit-next" onClick={() => go(0)}>
              Back to the summary <ArrowRight size={14} />
            </button>
          ) : (
            <button type="button" className="audit-next" onClick={() => show(1)}>
              See how every number was built <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
