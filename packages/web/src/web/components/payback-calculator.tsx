import { useState } from "react";

/**
 * Estimated contribution: the share of each added sales dollar left after cost of goods
 * (about 30%) and card fees (about 4%). Same rate as the sample audit.
 */
const KEPT = 0.66;
const HORIZON = 24; // months shown on the timeline
/** Weeks from the first audit shift to launch: two weeks on the floor, then the build. */
const LEAD_MONTHS = 1.5;
const PROGRAM = { 1: 75_000, 2: 120_000 } as const;

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
  /** Contribution not earned in year one while the team adopts the program. */
  rampLoss: number;
  months: number;
  yearOne: number;
};

export type Costs = {
  /** Team rewards a year: cash bonuses, paid days off, meals, certifications. */
  rewards: number;
  /** Added paid training time, at launch. */
  training: number;
  /** Any other added operating cost a year. */
  other: number;
  /** Months from launch until the full lift is reached, rising evenly. */
  ramp: number;
};

export const DEFAULT_COSTS: Costs = { rewards: 6_000, training: 4_000, other: 0, ramp: 6 };

/** Share of the full lift reached in month m after launch (1 is the first month). */
const adoption = (m: number, ramp: number) => (ramp <= 0 ? 1 : Math.min(1, m / ramp));

/** Months from launch until cumulative contribution, less running costs, covers the fee and training. */
export function paybackMonths(contribution: number, fee: number, c: Costs) {
  const upfront = fee + c.training;
  const running = (c.rewards + c.other) / 12;
  let total = 0;
  for (let m = 1; m <= 120; m++) {
    const net = (contribution / 12) * adoption(m, c.ramp) - running;
    if (net > 0 && total + net >= upfront) return m - 1 + (upfront - total) / net;
    total += net;
  }
  return Infinity;
}

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const usd = (n: number) => (n < 0 ? `(${money(n)})` : money(n));
const perTicket = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

function paybackLabel(months: number) {
  if (!Number.isFinite(months)) return { value: "10+", unit: "years" };
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

function Money({
  label,
  hint,
  value,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label>
      <span>
        {label} <strong>{money(value)}</strong>
      </span>
      <input
        type="range"
        aria-label={label}
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <small className="calc-hint">{hint}</small>
    </label>
  );
}

export function PaybackCalculator() {
  const [locations, setLocations] = useState<1 | 2>(1);
  const [covers, setCovers] = useState(100);
  const [lift, setLift] = useState(8);
  const [nights, setNights] = useState(5);
  const [scenarioId, setScenarioId] = useState<ScenarioId>("expected");
  const [costs, setCosts] = useState<Costs>(DEFAULT_COSTS);
  const setCost = (k: keyof Costs) => (n: number) => setCosts((c) => ({ ...c, [k]: n }));

  const fee = PROGRAM[locations];
  const nightsYear = nights * 52;
  const run = (factor: number): Result => {
    const spend = lift * factor;
    const sales = covers * spend * nightsYear * locations;
    const contribution = sales * KEPT;
    let earned = 0;
    for (let m = 1; m <= 12; m++) earned += (contribution / 12) * adoption(m, costs.ramp);
    return {
      spend,
      sales,
      contribution,
      rampLoss: contribution - earned,
      months: paybackMonths(contribution, fee, costs),
      yearOne: earned - costs.rewards - costs.other - costs.training - fee,
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

      <fieldset className="calculator-costs">
        <legend>
          Your costs and adoption <em>Set these to your own figures</em>
        </legend>
        <div className="calculator-controls">
          <Money
            label="Team rewards a year"
            hint="Cash bonuses, paid days off, meals and certifications"
            value={costs.rewards}
            max={30_000}
            step={500}
            onChange={setCost("rewards")}
          />
          <Money
            label="Added paid training time"
            hint="Hours your team is paid to train at launch"
            value={costs.training}
            max={20_000}
            step={500}
            onChange={setCost("training")}
          />
          <Money
            label="Other added operating costs a year"
            hint="Anything else the program adds to run"
            value={costs.other}
            max={30_000}
            step={500}
            onChange={setCost("other")}
          />
          <label>
            <span>
              Months to full adoption{" "}
              <strong>
                {costs.ramp === 0 ? "From launch" : costs.ramp}
                {costs.ramp > 0 && <em className="calc-sub"> rising evenly</em>}
              </strong>
            </span>
            <input
              type="range"
              aria-label="Months to full adoption"
              min="0"
              max="12"
              step="1"
              value={costs.ramp}
              onChange={(e) => setCost("ramp")(+e.target.value)}
            />
            <small className="calc-hint">The lift builds as your team adopts the program</small>
          </label>
        </div>
      </fieldset>

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
          Counted from launch, out of estimated contribution after your team rewards, training time
          and other costs, not sales.{" "}
          {costs.ramp > 0
            ? `The lift rises evenly to its full level over ${costs.ramp} ${costs.ramp === 1 ? "month" : "months"}. `
            : "The full lift is assumed from launch. "}
          Launch comes about 6 weeks after the first audit shift, so from the day we start it is
          about {paybackText(r.months + LEAD_MONTHS)}.
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
            Less the lift not yet reached
            <small>
              {costs.ramp > 0
                ? `Year one, while adoption rises over ${costs.ramp} ${costs.ramp === 1 ? "month" : "months"}`
                : "None: full lift assumed from launch"}
            </small>
          </dt>
          <dd className={r.rampLoss > 0 ? "is-negative" : undefined}>{usd(-r.rampLoss)}</dd>
        </div>
        <div>
          <dt>
            Less team rewards and other costs
            <small>
              {money(costs.rewards)} rewards and {money(costs.other)} other costs a year, plus{" "}
              {money(costs.training)} training time
            </small>
          </dt>
          <dd className="is-negative">{usd(-(costs.rewards + costs.other + costs.training))}</dd>
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
            <small>
              Estimated contribution in the first 12 months from launch, less costs and the fee
            </small>
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
        {run(0.5).yearOne < 0 && (
          <p className="payback-warning">
            At half your estimate, the first year after costs and the fee is{" "}
            {usd(run(0.5).yearOne)}. It takes {paybackText(run(0.5).months)} to recover.
          </p>
        )}
      </div>

      <p className="calculator-disclaimer">
        A model, not a promise. Estimated contribution is what remains of added sales after roughly
        30% cost of goods and 4% card fees, before tax; rent and salaries are already paid. Team
        rewards, training time and other costs are the figures you set above. The fee counts
        $75,000 for one location and $120,000 for two, the audit first path, with the first year of
        the platform included. Committing up front it is $65,000 or $100,000 in two payments, and
        $55,000 or $80,000 paid in full. After the first year, the platform continues on a
        subscription basis at the rate written into your agreement before you sign, which is not
        counted here. Results depend on your operation, costs, guest demand and how consistently
        the program is used.
      </p>
    </div>
  );
}
