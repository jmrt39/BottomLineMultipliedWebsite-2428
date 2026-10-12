import { useState } from "react";

/**
 * Estimated contribution: the share of each added sales dollar left after cost of goods
 * (about 30%) and card fees (about 4%). Same rate as the sample audit.
 */
const KEPT = 0.66;
const HORIZON = 24; // months shown on the timeline
/** Weeks from the first audit shift to launch: two weeks on the floor, then the build. */
const LEAD_MONTHS = 1.5;
const PROGRAM = { 1: 85_000, 2: 140_000 } as const;
const PLATFORM_MONTHLY = { 1: 650, 2: 900 } as const;
const PLATFORM_COMMITTED = { 1: 450, 2: 650 } as const;

const SCENARIOS = [
  { id: "conservative", label: "Conservative", factor: 0.5, note: "Half the lift" },
  { id: "expected", label: "Expected", factor: 1, note: "Your estimate" },
  { id: "higher", label: "Higher", factor: 1.5, note: "One and a half times" },
] as const;
type ScenarioId = (typeof SCENARIOS)[number]["id"];

type Result = {
  spend: number;
  sales: number;
  contribution: number;
  months: number;
  yearOne: number;
};

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const usd = (n: number) => (n < 0 ? `(${money(n)})` : money(n));
const perTicket = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

function paybackLabel(months: number) {
  if (!Number.isFinite(months)) return { value: "Not yet", unit: "" };
  if (months > 36) return { value: "3+", unit: "years" };
  if (months < 2) {
    const weeks = Math.max(1, Math.ceil((months * 52) / 12));
    return { value: String(weeks), unit: weeks === 1 ? "week" : "weeks" };
  }
  const m = months < 10 ? Math.round(months * 10) / 10 : Math.round(months);
  return { value: String(m), unit: "months" };
}
const paybackText = (months: number) => {
  const l = paybackLabel(months);
  return l.unit ? `${l.value} ${l.unit}` : l.value;
};

const ROWS: [string, (x: Result) => string][] = [
  ["Added sales a year", (x) => usd(x.sales)],
  ["Estimated contribution", (x) => usd(x.contribution)],
  ["Time to recover the fee", (x) => paybackText(x.months)],
  ["First year after the fee", (x) => usd(x.yearOne)],
];

export function PaybackCalculator() {
  const [locations, setLocations] = useState<1 | 2>(1);
  const [covers, setCovers] = useState(100);
  const [lift, setLift] = useState(8);
  const [nights, setNights] = useState(5);
  const [scenarioId, setScenarioId] = useState<ScenarioId>("expected");

  const fee = PROGRAM[locations];
  const nightsYear = nights * 52;
  const run = (factor: number): Result => {
    const spend = lift * factor;
    const sales = covers * spend * nightsYear * locations;
    const contribution = sales * KEPT;
    return {
      spend,
      sales,
      contribution,
      months: fee / (contribution / 12),
      yearOne: contribution - fee,
    };
  };
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const r = run(scenario.factor);
  const label = paybackLabel(r.months);
  const fill = Math.min(r.months / HORIZON, 1) * 100;
  const beyond = r.months > HORIZON;
  const markerMonth = Math.max(1, Math.ceil(r.months));

  return (
    <div className="calculator payback">
      <fieldset className="payback-locations" aria-label="Program">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={locations === n}
            onClick={() => setLocations(n)}
          >
            <span>{n === 1 ? "One location" : "Two locations"}</span>
            <b>{usd(PROGRAM[n])}</b>
          </button>
        ))}
      </fieldset>

      <div className="calculator-controls">
        <label>
          <span>
            Tickets per night{locations === 2 ? ", each location" : ""} <strong>{covers}</strong>
          </span>
          <input
            type="range"
            aria-label="Tickets per night"
            min="40"
            max="300"
            step="5"
            value={covers}
            onChange={(e) => setCovers(+e.target.value)}
          />
        </label>
        <label>
          <span>
            Nights open per week{" "}
            <strong>
              {nights} <em className="calc-sub">= {nightsYear} a year</em>
            </strong>
          </span>
          <input
            type="range"
            aria-label="Nights open per week"
            min="3"
            max="7"
            step="1"
            value={nights}
            onChange={(e) => setNights(+e.target.value)}
          />
        </label>
        <label>
          <span>
            Expected added spend per ticket <strong>${lift}</strong>
          </span>
          <input
            type="range"
            aria-label="Expected added spend per ticket"
            min="2"
            max="25"
            step="1"
            value={lift}
            onChange={(e) => setLift(+e.target.value)}
          />
        </label>
      </div>

      <fieldset className="payback-scenarios" aria-label="Scenario">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenarioId === s.id}
            onClick={() => setScenarioId(s.id)}
          >
            <span>{s.label}</span>
            <b>{perTicket(lift * s.factor)} a ticket</b>
            <em>{s.note}</em>
          </button>
        ))}
      </fieldset>

      <div className="calculator-total" aria-live="polite">
        <span className="eyebrow">
          {scenario.label.toUpperCase()} · ESTIMATED TIME TO RECOVER THE FEE
        </span>
        <span className="total">
          {label.value}
          {label.unit && <em> {label.unit}</em>}
        </span>
        <p>
          Counted from launch, out of estimated contribution, not sales. Launch comes about 6 weeks
          after the first audit shift, so from the day we start it is about{" "}
          {paybackText(r.months + LEAD_MONTHS)}. The model assumes the full lift from launch; in
          practice it builds as your team adopts the program.
        </p>
      </div>

      <div className={`payback-timeline${beyond ? " is-beyond" : ""}`} aria-hidden="true">
        <div className="payback-track">
          <span className="payback-fill" style={{ width: `${fill}%` }} />
          {!beyond && <span className="payback-after" style={{ left: `${fill}%` }} />}
          <span className="payback-pin" style={{ left: `${fill}%` }} />
          <span
            className="payback-marker"
            style={{ left: `${fill}%`, transform: `translateX(-${fill}%)` }}
          >
            {beyond ? `Beyond month ${HORIZON}` : `Fee recovered · month ${markerMonth}`}
          </span>
        </div>
        <div className="payback-ticks">
          {[0, 6, 12, 18, 24].map((t) => (
            <span key={t} style={{ left: `${(t / HORIZON) * 100}%` }}>
              {t === 0 ? "Launch" : `${t} mo`}
            </span>
          ))}
        </div>
      </div>

      <dl className="payback-ledger">
        <div>
          <dt>
            Added sales a year
            <small>
              {covers} tickets × {perTicket(r.spend)} × {nightsYear} nights
              {locations === 2 ? " × 2 locations" : ""}
            </small>
          </dt>
          <dd>{usd(r.sales)}</dd>
        </div>
        <div>
          <dt>
            Estimated contribution
            <small>
              {Math.round(KEPT * 100)}% of added sales, after cost of goods and card fees
            </small>
          </dt>
          <dd>{usd(r.contribution)}</dd>
        </div>
        <div>
          <dt>
            Less the program fee
            <small>
              {locations === 1 ? "One location, audit first" : "Two locations, audit first"}
            </small>
          </dt>
          <dd className="is-negative">{usd(-fee)}</dd>
        </div>
        <div className="is-total">
          <dt>
            First year after the fee
            <small>Estimated contribution in the first 12 months from launch, less the fee</small>
          </dt>
          <dd className={r.yearOne < 0 ? "is-negative" : undefined}>{usd(r.yearOne)}</dd>
        </div>
      </dl>

      <div className="payback-compare">
        <span className="eyebrow">THE SAME RESTAURANT, THREE WAYS</span>
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Measure</span>
              </th>
              {SCENARIOS.map((s) => (
                <th
                  scope="col"
                  key={s.id}
                  className={s.id === scenarioId ? "is-current" : undefined}
                >
                  {s.label}
                  <em>{perTicket(lift * s.factor)}</em>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([name, cell]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                {SCENARIOS.map((s) => {
                  const x = run(s.factor);
                  const neg = name === "First year after the fee" && x.yearOne < 0;
                  return (
                    <td
                      key={s.id}
                      className={
                        [s.id === scenarioId && "is-current", neg && "is-negative"]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      {cell(x)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {run(0.5).contribution < fee && (
          <p className="payback-warning">
            At half your estimate, a year of estimated contribution ({usd(run(0.5).contribution)})
            is below the {usd(fee)} fee. It takes {paybackText(run(0.5).months)} to recover.
          </p>
        )}
      </div>

      <p className="calculator-disclaimer">
        A model, not a promise. Estimated contribution is what remains of added sales after roughly
        30% cost of goods and 4% card fees, before tax and any added labor; rent and salaries are
        already paid. The fee counts $85,000 for one location and $140,000 for two, the audit first
        path, with the first year of the platform included. Commit before the audit and it is
        $75,000 or $120,000; pay in full and it is $65,000 or $100,000. From year two the platform
        is {usd(PLATFORM_MONTHLY[locations])} a month for{" "}
        {locations === 2 ? "two locations" : "one location"} at the standard rate, or{" "}
        {usd(PLATFORM_COMMITTED[locations])} with a 24 month commitment. Results depend on your
        operation, costs, guest demand and how consistently the program is used.
      </p>
    </div>
  );
}
