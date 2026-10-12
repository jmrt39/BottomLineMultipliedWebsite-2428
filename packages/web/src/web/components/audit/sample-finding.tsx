import { ArrowRight } from "lucide-react";
import { COVERS_PER_SERVICE, FLOW_THROUGH, TOTAL, findings, servers, usd } from "./model";
import { OPEN_AUDIT_METHOD } from "./sample-audit";

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
          The sample is a modeled restaurant, not a client: {COVERS_PER_SERVICE} tickets a night,
          six nights a week, {servers.length} servers. Every input and every calculation behind its{" "}
          <b>{usd(TOTAL)}</b> is on the back page of the report.
        </p>
        <button
          type="button"
          className="sf-to-method"
          onClick={() => window.dispatchEvent(new Event(OPEN_AUDIT_METHOD))}
        >
          Open the back page · How the numbers were built <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
