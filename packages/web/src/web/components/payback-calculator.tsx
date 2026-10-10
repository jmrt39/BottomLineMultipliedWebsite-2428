import { useState } from "react";

/** Share of each added sales dollar kept after cost of goods and card fees (same as the sample audit). */
const KEPT = 0.66;
const HORIZON = 24; // months shown on the timeline
const PROGRAM = { 1: 85_000, 2: 140_000 } as const;

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const usd = (n: number) => (n < 0 ? `(${money(n)})` : money(n));

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

export function PaybackCalculator() {
  const [locations, setLocations] = useState<1 | 2>(1);
  const [covers, setCovers] = useState(100);
  const [lift, setLift] = useState(8);
  const [nights, setNights] = useState(5);

  const investment = PROGRAM[locations];
  const services = nights * 52;
  const sales = covers * lift * services * locations;
  const profit = sales * KEPT;
  const months = investment / (profit / 12);
  const label = paybackLabel(months);
  const fill = Math.min(months / HORIZON, 1) * 100;
  const beyond = months > HORIZON;
  const markerMonth = Math.max(1, Math.ceil(months));

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
            Additional spend per ticket <strong>${lift}</strong>
          </span>
          <input
            type="range"
            aria-label="Additional spend per ticket"
            min="2"
            max="25"
            step="1"
            value={lift}
            onChange={(e) => setLift(+e.target.value)}
          />
        </label>
        <label>
          <span>
            Nights open per week <strong>{nights}</strong>
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
      </div>

      <div className="calculator-total" aria-live="polite">
        <span className="eyebrow">THE PROGRAM PAYS FOR ITSELF IN</span>
        <span className="total">
          {label.value}
          {label.unit && <em> {label.unit}</em>}
        </span>
        <p>From launch, out of added profit, not added sales.</p>
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
            {beyond ? `Beyond month ${HORIZON}` : `Paid back · month ${markerMonth}`}
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

      <dl className="payback-stats">
        <div>
          <dt>Added sales a year</dt>
          <dd>{usd(sales)}</dd>
        </div>
        <div>
          <dt>Kept as profit</dt>
          <dd>{usd(profit)}</dd>
        </div>
        <div>
          <dt>Year one, after the program</dt>
          <dd className={profit - investment < 0 ? "is-negative" : undefined}>
            {usd(profit - investment)}
          </dd>
        </div>
      </dl>

      <p className="calculator-disclaimer">
        {covers} tickets × ${lift} × {services} nights
        {locations === 2 ? " × 2 locations" : ""}, with {Math.round(KEPT * 100)}% of added sales
        kept after cost of goods and card fees. Program at $85,000 pay as you go for one location
        ($75,000 if paid in full upfront), first year of the platform included. Illustrative only; results depend on your operation, costs,
        guest demand and implementation.
      </p>
    </div>
  );
}
