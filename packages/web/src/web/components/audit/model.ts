// The modeled (not real) restaurant behind the sample gap report. Every figure on
// the page is derived from these assumptions, so the report always adds up.

export const COVERS_PER_SERVICE = 110;
export const SERVICES_PER_YEAR = 312; // six dinner services a week
export const COVERS = COVERS_PER_SERVICE * SERVICES_PER_YEAR; // 34,320
export const NET_MARGIN = 0.07; // fine dining commonly runs 5–10%
export const FLOW_THROUGH = 0.66; // added items after ~30% cost of goods and ~4% card fees
export const TIP_RATE = 0.2;
export const WEEKEND_NIGHTS = 104;

// Average spend per guest during the audit, by server.
const OBSERVED = [
  { name: "Server A", now: 91.4 },
  { name: "Server B", now: 86.2 },
  { name: "Server C", now: 81.7 },
  { name: "Server D", now: 78.1 },
  { name: "Server E", now: 75.3 },
  { name: "Server F", now: 72.6 },
  { name: "Server G", now: 69.8 },
  { name: "Server H", now: 64.9 },
];
const COVERS_EACH = COVERS / OBSERVED.length;
export const ROOM_NOW = OBSERVED.reduce((s, x) => s + x.now, 0) / OBSERVED.length;
export const SALES_NOW = ROOM_NOW * COVERS;

// Targets come from the room's own top two servers, not an industry benchmark,
// and each server is asked to close only half the distance.
export const BENCH = (OBSERVED[0].now + OBSERVED[1].now) / 2;
export const servers = OBSERVED.map((s) => {
  const target = Math.max(s.now, s.now + (BENCH - s.now) / 2);
  const gap = target - s.now;
  return { ...s, target, gap, annual: gap * COVERS_EACH };
});
export const CHECK_LIFT = servers.reduce((s, x) => s + x.annual, 0);
export const ROOM_TARGET = ROOM_NOW + CHECK_LIFT / COVERS;
export const REST_AVG = OBSERVED.slice(2).reduce((s, x) => s + x.now, 0) / (OBSERVED.length - 2);
export const SPREAD = OBSERVED[0].now - OBSERVED[OBSERVED.length - 1].now;

export type Kind = "check" | "comps" | "covers" | "cost";
export type Finding = {
  moment: string;
  title: string;
  saw: string;
  from: string;
  to: string;
  value: number;
  kind: Kind;
};

// In the order a table meets them.
export const findings: Finding[] = [
  {
    moment: "Lineup · 4:30 pm",
    title: "The meeting before service",
    saw: "A lineup ran before 3 of 6 services. The kitchen attended none, and features were never tasted. Two dishes ran out and were still sold, then comped.",
    from: "Comps 1.9% of sales",
    to: "1.2%",
    value: SALES_NOW * 0.007,
    kind: "comps",
  },
  {
    moment: "Seating · first two minutes",
    title: "A starter, named at the table",
    saw: "A specific starter was recommended at 11 of 46 tables. Naming one dish sold a starter to 52% of tables; “any appetizers?” sold 19%.",
    from: "0.24 starters per guest",
    to: "0.33",
    value: 46_330,
    kind: "check",
  },
  {
    moment: "Ordering · the wine list",
    title: "The wine list, explained",
    saw: "Asked for a pairing, 3 of 8 servers named a wine and said why. A second glass was offered 1 time in 3. Tables of four were offered a bottle at 9 of 22.",
    from: "$17.80 wine per guest",
    to: "$19.90",
    value: 72_070,
    kind: "check",
  },
  {
    moment: "Ordering · the menu",
    title: "Knowing what’s on the plate",
    saw: "6 of 8 servers couldn’t describe the market fish. Allergy questions went back to the kitchen 14 times. Features sold 7% of entrées; 13% when tasted at lineup.",
    from: "Features 7% of entrées",
    to: "13%",
    value: 29_170,
    kind: "check",
  },
  {
    moment: "Ordering · the bar",
    title: "Call it by name",
    saw: "A “vodka soda” was rung in with the house vodka 81% of the time. Guests were asked which brand on 1 order in 5.",
    from: "Asked 1 in 5",
    to: "every order",
    value: 19_315,
    kind: "check",
  },
  {
    moment: "After the entrée",
    title: "The last course",
    saw: "Dessert menus were dropped without a recommendation at 68% of tables. Coffee or an after dinner drink was offered at 1 table in 4.",
    from: "0.17 desserts per guest",
    to: "0.24",
    value: 32_600,
    kind: "check",
  },
  {
    moment: "The check",
    title: "The check that arrives late",
    saw: "On Saturdays: 8 min 40 s from “whenever you’re ready” to the check on the table. Meanwhile about three covers a night walked from the wait list.",
    from: "8 min 40 s",
    to: "under 3 min",
    value: 3 * WEEKEND_NIGHTS * ROOM_NOW,
    kind: "covers",
  },
  {
    moment: "All night · the well",
    title: "The two ounce pour that isn’t",
    saw: "Cocktails poured freehand measured 2.25 oz against a 2 oz spec on 18 of the 24 we checked.",
    from: "2.25 oz",
    to: "2.00 oz",
    value: SALES_NOW * 0.18 * 0.2 * 0.125,
    kind: "cost",
  },
];

const sum = (k: Kind) => findings.filter((f) => f.kind === k).reduce((s, f) => s + f.value, 0);
export const TOTAL = findings.reduce((s, f) => s + f.value, 0);
export const COMPS = sum("comps");
export const COVER_SALES = sum("covers");
export const POUR = sum("cost");
export const ADDED_SALES = CHECK_LIFT + COVER_SALES + COMPS;
export const COGS = (CHECK_LIFT + COVER_SALES) * (1 - FLOW_THROUGH);
export const PROFIT = ADDED_SALES - COGS + POUR;
export const PROFIT_NOW = SALES_NOW * NET_MARGIN;
export const TIPS = (CHECK_LIFT + COVER_SALES) * TIP_RATE;
export const TIPS_WEEK_EACH = TIPS / servers.length / 52;

export const composition = [
  { label: "Higher checks", value: CHECK_LIFT, tone: "ink" },
  { label: "Covers that walked", value: COVER_SALES, tone: "gold" },
  { label: "Comps & remakes", value: COMPS, tone: "taupe" },
  { label: "Overpour", value: POUR, tone: "pale" },
] as const;

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const cents = (n: number) => `$${n.toFixed(2)}`;
export const pctOf = (n: number, of: number) => `${Math.round((n / of) * 100)}%`;
