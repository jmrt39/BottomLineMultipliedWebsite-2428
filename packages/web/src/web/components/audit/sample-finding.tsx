import {
  COVERS,
  COVERS_PER_SERVICE,
  FLOW_THROUGH,
  PROFIT,
  ROOM_NOW,
  SALES_NOW,
  SERVICES_PER_YEAR,
  TOTAL,
  findings,
  servers,
  usd,
} from "./model";

// The highest value finding in the sample report, shown whole.
const wine = findings.find((f) => f.title === "The wine list, explained")!;

/** One finding from the sample report, laid out the way every finding in a real report is. */
export function SampleFinding() {
  return (
    <div className="sample-finding" id="sample-finding">
      <div className="sf-head">
        <span className="sf-tag">MODELED EXAMPLE · ONE FINDING FROM THE SAMPLE REPORT</span>
        <h3>
          Finding 01 of 08
          <em>{wine.title}</em>
        </h3>
      </div>
      <dl className="sf-rows">
        <div>
          <dt>
            <span>I</span>Finding
          </dt>
          <dd>
            Servers present the wine list as prices, not pairings. Wine per ticket sits at $17.80,
            and the room’s own best nights show it can carry $19.90.
          </dd>
        </div>
        <div>
          <dt>
            <span>II</span>Evidence
          </dt>
          <dd>
            {wine.saw} Wine per ticket comes from the POS, divided by tickets rung in across the six
            observed shifts.
          </dd>
        </div>
        <div>
          <dt>
            <span>III</span>Estimated opportunity
          </dt>
          <dd>
            <span className="sf-math">
              {wine.math} = <strong>{usd(wine.value)} added sales a year</strong>
            </span>
            <span className="sf-math">
              {usd(wine.value)} × {Math.round(FLOW_THROUGH * 100)}% after cost of goods and card
              fees = <strong>{usd(wine.value * FLOW_THROUGH)} estimated contribution</strong>
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
      <div className="sf-model">
        <span className="sf-tag">HOW THE SAMPLE ROOM WAS BUILT</span>
        <p>
          The sample is a modeled restaurant, not a client. We chose figures typical of an
          independent fine dining room: <b>{COVERS_PER_SERVICE} tickets a night</b>, open{" "}
          <b>six nights a week</b> ({SERVICES_PER_YEAR} dinners a year,{" "}
          {COVERS.toLocaleString("en-US")} tickets), <b>{servers.length} servers</b> and a $
          {ROOM_NOW.toFixed(2)} average ticket, which comes to {usd(SALES_NOW)} in sales a year.
          Every finding is calculated from those inputs. The eight findings add up to{" "}
          <b>{usd(TOTAL)}</b> in estimated added sales and savings a year, of which{" "}
          <b>{usd(PROFIT)}</b> is estimated contribution.
        </p>
      </div>
    </div>
  );
}
