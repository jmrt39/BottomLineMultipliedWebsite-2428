import { AppFrame, Bar, Stars } from "./frame";
import { MODULE_COUNT, STAFF } from "./data";
import { ease, easeOut, lerp, money, remap, rise } from "./timeline";

const totalSigned = STAFF.reduce((s, p) => s + p.modules, 0);
const avgStars = STAFF.reduce((s, p) => s + p.stars, 0) / STAFF.length;
const avgAds = STAFF.reduce((s, p) => s + p.ads, 0) / STAFF.length;
const avgBase = STAFF.reduce((s, p) => s + p.baseline, 0) / STAFF.length;

export function DashboardScene({ t: tv }: { t: number }) {
  // v1 timings (6–20 s), played 1.4× faster inside the v2 window
  const t = remap(tv, "dashboard", 6, 1.4);
  const count = ease(t, 7.2, 9.6, easeOut);
  const push = ease(t, 13.2, 20.4);
  const focus = ease(t, 12.4, 13.4);
  const drift = lerp(0, 1, ease(t, 5.6, 13.2));
  const scale = lerp(0.985, 1, drift) * lerp(1, 1.2, push);
  return (
    <AppFrame
      active="dashboard"
      style={{
        transform: `translate(${lerp(0, 120, push)}px, ${lerp(0, 40, push)}px) scale(${scale})`,
        transformOrigin: "520px 360px",
      }}
    >
      <header className="platform-head" style={rise(t, 6.4, 0)}>
        <div>
          <span className="platform-kicker">Evening floor · Week 6 of the program</span>
          <h2>Team overview</h2>
        </div>
        <span className="platform-alert" style={rise(t, 7.4, 0)}>
          <i />4 sign-offs waiting <b>·</b> 2 knowledge checks overdue
        </span>
      </header>
      <section className="platform-kpis">
        {[
          {
            label: "Modules signed off",
            value: `${Math.round(totalSigned * count)}`,
            unit: ` / ${STAFF.length * MODULE_COUNT}`,
            foot: "Trainer and manager signatures",
          },
          {
            label: "Competency average",
            value: (avgStars * count).toFixed(1),
            unit: " / 5",
            foot: "Six competencies, floor-graded",
          },
          {
            label: "Average dollar sale",
            value: money(lerp(avgBase, avgAds, count)),
            unit: "",
            foot: `vs. ${money(avgBase)} audit baseline`,
          },
          {
            label: "Floor exercises this week",
            value: `${Math.round(12 * count)}`,
            unit: "",
            foot: "Graded on a tablet, on shift",
          },
        ].map((k, i) => (
          <div key={k.label} className="platform-kpi" style={rise(t, 6.8, i, 0.1)}>
            <span>{k.label}</span>
            <strong>
              {k.value}
              <small>{k.unit}</small>
            </strong>
            <em>{k.foot}</em>
          </div>
        ))}
      </section>
      <section className="platform-table dash">
        <div className="platform-tr platform-th" style={rise(t, 7.4, 0)}>
          <span>Team member</span>
          <span>Training</span>
          <span>Competency</span>
          <span>ADS vs. baseline</span>
          <span>Last floor exercise</span>
          <span>Status</span>
        </div>
        {STAFF.map((p, i) => {
          const grow = ease(t, 7.8 + i * 0.09, 9.6 + i * 0.09, easeOut);
          const lift = ((p.ads - p.baseline) / p.baseline) * 100;
          const isFocus = i === 0;
          return (
            <div
              key={p.name}
              className={`platform-tr${isFocus ? " is-focus" : ""}`}
              style={{
                ...rise(t, 7.6, i, 0.09),
                ...(isFocus
                  ? {
                      background: `rgba(197,175,135,${0.09 * focus})`,
                      boxShadow: `inset 2px 0 0 rgba(197,175,135,${focus})`,
                    }
                  : { opacity: rise(t, 7.6, i, 0.09).opacity * lerp(1, 0.55, push) }),
              }}
            >
              <span className="platform-who">
                <span className="platform-avatar">{p.initials}</span>
                <span>
                  {p.name}
                  <small>{p.role}</small>
                </span>
              </span>
              <span className="platform-progress">
                <Bar value={p.modules * grow} max={MODULE_COUNT} />
                <b>
                  {Math.round(p.modules * grow)}
                  <small>/{MODULE_COUNT}</small>
                </b>
              </span>
              <span className="platform-rating">
                <Stars shown={p.stars * grow} size={16} />
                <b>{(p.stars * grow).toFixed(1)}</b>
              </span>
              <span className="platform-ads">
                <b>{money(lerp(p.baseline, p.ads, grow))}</b>
                <small>
                  +{(lift * grow).toFixed(1)}% vs {money(p.baseline)}
                </small>
              </span>
              <span className="platform-last">{p.last}</span>
              <span>
                {p.flag && (
                  <span className={`platform-chip${p.flag === "Check overdue" ? " warn" : ""}`}>
                    {p.flag}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </section>
    </AppFrame>
  );
}
