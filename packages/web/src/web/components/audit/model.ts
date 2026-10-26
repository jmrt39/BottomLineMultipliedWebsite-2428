// The modeled (not real) restaurant behind the sample gap report. Every figure on
// the page is derived from these assumptions, so the report always adds up.

export const COVERS_PER_SERVICE = 110;
export const SERVICES_PER_YEAR = 312; // six dinner services a week
export const COVERS = COVERS_PER_SERVICE * SERVICES_PER_YEAR; // 34,320
export const NET_MARGIN = 0.07; // fine dining commonly runs 5–10%
export const FLOW_THROUGH = 0.66; // added items after ~30% cost of goods and ~4% card fees
export const TIP_RATE = 0.2;
export const CARD_FEES = 0.04;
export const FOOD_COST = 0.3;
export const WEEKEND_NIGHTS = 104;

// Average spend per ticket during the audit, by server (net sales ÷ tickets).
const OBSERVED = [
  { name: "Server A", now: 91.1 },
  { name: "Server B", now: 86.3 },
  { name: "Server C", now: 81.7 },
  { name: "Server D", now: 78.1 },
  { name: "Server E", now: 75.3 },
  { name: "Server F", now: 72.6 },
  { name: "Server G", now: 69.8 },
  { name: "Server H", now: 65.1 },
];
export const COVERS_EACH = COVERS / OBSERVED.length; // 4,290 covers a year per server
export const NIGHTS_PER_WEEK = SERVICES_PER_YEAR / 52;
export const ROOM_NOW = OBSERVED.reduce((s, x) => s + x.now, 0) / OBSERVED.length;
export const SALES_NOW = ROOM_NOW * COVERS;

// Targets come from the room's own top two servers, not an industry benchmark,
// and each server is asked to close only half the distance.
export const BENCH = (OBSERVED[0].now + OBSERVED[1].now) / 2;
export const servers = OBSERVED.map((s) => {
  const target = Math.max(s.now, s.now + (BENCH - s.now) / 2);
  const gap = target - s.now;
  return { ...s, target, gap, annual: Math.round(gap * COVERS_EACH) };
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
  /** Short before and after, for the ranked list. */
  from: string;
  to: string;
  /** The measured starting point, in a sentence. */
  now: string;
  /** The target, and what on the floor gets the room there. */
  target: string;
  /** The arithmetic, written out, ending just before the result. */
  math: string;
  value: number;
  kind: Kind;
};

// The arithmetic behind a per ticket gap, written the way the owner would check it.
const BASE = `${COVERS_PER_SERVICE} tickets × ${NIGHTS_PER_WEEK} nights × 52 weeks`;
const money2 = (n: number) => `$${n.toFixed(2)}`;
const whole = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
function perGuest(how: string, gap: number) {
  return { math: `${how} = ${money2(gap)} per ticket × ${BASE}`, value: Math.round(gap * COVERS) };
}

// Per ticket gaps for the five check findings. Together they are exactly the room's
// check lift on the Servers page ($5.75 a ticket), so every page reconciles.
const STARTER = perGuest("9 more starters per 100 tickets × $15 average starter", 0.09 * 15);
const WINE = perGuest("$19.90 target less $17.80 today", 19.9 - 17.8);
const FEATURES = perGuest(
  "6 more entrées in 100 as features × $14 above the average entrée",
  0.06 * 14,
);
const CALL = perGuest(
  "22 house pours per 100 tickets moved to a call brand × $2.50 upcharge",
  0.22 * 2.5,
);
const DESSERT = perGuest("7 more desserts per 100 tickets × $13 average dessert", 0.07 * 13);

export const LIQUOR_SHARE = 0.18;
export const POUR_COST = 0.2;
const OVERPOUR = 0.25 / 2; // 0.25 oz over a 2 oz spec
const POURS_OVER = 18 / 24;
const WALKED_PER_NIGHT = 3;
// Comps and remakes are valued separately, because different costs change in each.
// A comp that is collected instead: the dish was made either way, so the restaurant gains
// the price, less card fees. A remake prevented: the guest pays the same, so only the
// cost of goods of the plate that would have been thrown out is saved.
const COMPS_NOW = 0.011;
const COMPS_TARGET = 0.007;
const REMAKES_NOW = 0.008;
const REMAKES_TARGET = 0.005;
export const COMP_COLLECTED = Math.round(SALES_NOW * (COMPS_NOW - COMPS_TARGET));
export const REMAKE_SAVED = Math.round(SALES_NOW * (REMAKES_NOW - REMAKES_TARGET) * FOOD_COST);
const pct1 = (n: number) => `${(n * 100).toFixed(1)}%`;

// Each finding is rounded to the dollar once, here, so the figures on the page add up
// to the totals exactly.
// In the order a table meets them.
export const findings: Finding[] = [
  {
    moment: "Lineup · 4:30 pm",
    title: "The meeting before service",
    saw: "A lineup ran before 3 of 6 services. The kitchen attended none, and features were never tasted. Two dishes ran out and were still sold, then comped. Plates went back for a remake when an allergy or temperature was missed at the order.",
    from: "Comps 1.1%, remakes 0.8%",
    to: "0.7%, 0.5%",
    now: "Comps run at 1.1% of sales and remakes at 0.8%, at menu price.",
    target:
      "Comps at 0.7% and remakes at 0.5%, the rates on nights a full lineup ran with the kitchen there and sold out dishes called before doors.",
    math: `Comps collected instead: ${pct1(COMPS_NOW - COMPS_TARGET)} of ${whole(SALES_NOW)} = ${whole(COMP_COLLECTED)}. Remakes prevented: ${pct1(REMAKES_NOW - REMAKES_TARGET)} of ${whole(SALES_NOW)} × ${Math.round(FOOD_COST * 100)}% cost of goods, the only cost saved = ${whole(REMAKE_SAVED)}. Together`,
    value: COMP_COLLECTED + REMAKE_SAVED,
    kind: "comps",
  },
  {
    moment: "Seating · first two minutes",
    title: "A starter, named at the table",
    saw: "A specific starter was recommended at 11 of 46 tables. Naming one dish sold a starter to 52% of tables; “any appetizers?” sold 19%.",
    from: "24 starters per 100 tickets",
    to: "33",
    now: "24 starters for every 100 tickets.",
    target:
      "33 for every 100 tickets, achieved when every server names one specific starter at seating.",
    ...STARTER,
    kind: "check",
  },
  {
    moment: "Ordering · the wine list",
    title: "The wine list, explained",
    saw: "Asked for a pairing, 3 of 8 servers named a wine and said why. A second glass was offered 1 time in 3. Tables of four were offered a bottle at 9 of 22.",
    from: "$17.80 wine per ticket",
    to: "$19.90",
    now: "$17.80 current wine per ticket.",
    target:
      "$19.90, achieved when a second glass is offered and bottle upgrades are suggested to tables of four.",
    ...WINE,
    kind: "check",
  },
  {
    moment: "Ordering · the menu",
    title: "Knowing what’s on the plate",
    saw: "6 of 8 servers couldn’t describe the market fish. Allergy questions went back to the kitchen 14 times. Features sold 7% of entrées; 13% when tasted at lineup.",
    from: "Features 7% of entrées",
    to: "13%",
    now: "Features are 7% of entrées sold.",
    target: "13%, the rate on nights the features were tasted at lineup.",
    ...FEATURES,
    kind: "check",
  },
  {
    moment: "Ordering · the bar",
    title: "Call it by name",
    saw: "A “vodka soda” was rung in with the house vodka 81% of the time. Guests were asked which brand on 1 order in 5.",
    from: "Asked 1 in 5",
    to: "every order",
    now: "Guests are asked which brand on 1 spirit order in 5.",
    target: "Every order, by offering two call brands by name instead of asking “any preference?”",
    ...CALL,
    kind: "check",
  },
  {
    moment: "After the entrée",
    title: "The last course",
    saw: "Dessert menus were dropped without a recommendation at 68% of tables. Coffee or an after dinner drink was offered at 1 table in 4.",
    from: "17 desserts per 100 tickets",
    to: "24",
    now: "17 desserts for every 100 tickets.",
    target:
      "24 for every 100 tickets, achieved when the server recommends one dessert by name as the menu goes down.",
    ...DESSERT,
    kind: "check",
  },
  {
    moment: "The check",
    title: "The check that arrives late",
    saw: "On Saturdays: 8 min 40 s from “whenever you’re ready” to the check on the table. Meanwhile about three tables a night walked from the wait list.",
    from: "8 min 40 s",
    to: "under 3 min",
    now: "About 3 tables a night walk from the wait list on Fridays and Saturdays.",
    target: "Seat them, by getting the check down within 3 minutes of being asked.",
    math: `${WALKED_PER_NIGHT} tables × ${WEEKEND_NIGHTS} Friday and Saturday nights × ${money2(ROOM_NOW)} average ticket`,
    value: Math.round(WALKED_PER_NIGHT * WEEKEND_NIGHTS * ROOM_NOW),
    kind: "covers",
  },
  {
    moment: "All night · the well",
    title: "The two ounce pour that isn’t",
    saw: "Cocktails poured freehand measured 2.25 oz against a 2 oz spec on 18 of the 24 we checked.",
    from: "2.25 oz",
    to: "2.00 oz",
    now: "18 of 24 freehand pours measured 2.25 oz against a 2 oz spec.",
    target: "2.00 oz on every pour, with jiggers in the well.",
    math: `${whole(SALES_NOW)} sales × ${Math.round(LIQUOR_SHARE * 100)}% liquor × ${Math.round(POUR_COST * 100)}% pour cost × ${OVERPOUR * 100}% over spec × 18 of 24 pours`,
    value: Math.round(SALES_NOW * LIQUOR_SHARE * POUR_COST * OVERPOUR * POURS_OVER),
    kind: "cost",
  },
];

const sum = (k: Kind) => findings.filter((f) => f.kind === k).reduce((s, f) => s + f.value, 0);
export const TOTAL = findings.reduce((s, f) => s + f.value, 0);
// The check findings and the server by server model are two views of the same lift.
if (import.meta.env.DEV && Math.abs(sum("check") - CHECK_LIFT) > 1) {
  console.warn(
    "Sample audit: check findings do not add up to the server lift",
    sum("check"),
    CHECK_LIFT,
  );
}
export const COMPS = sum("comps");
export const COVER_SALES = sum("covers");
export const POUR = sum("cost");
export const CHECK_FINDINGS = sum("check");
// Added sales: higher checks, tables seated, and comps collected instead of given away.
export const ADDED_SALES = CHECK_LIFT + COVER_SALES + COMP_COLLECTED;
// New dishes carry cost of goods and card fees; a collected comp was cooked anyway, so only card fees.
export const COGS = (CHECK_LIFT + COVER_SALES) * (1 - FLOW_THROUGH) + COMP_COLLECTED * CARD_FEES;
// Cost saved outright: product not poured and plates not remade.
export const SAVINGS = POUR + REMAKE_SAVED;
export const PROFIT = ADDED_SALES - COGS + SAVINGS;
export const PROFIT_NOW = SALES_NOW * NET_MARGIN;
export const TIPS = (CHECK_LIFT + COVER_SALES) * TIP_RATE;
export const TIPS_WEEK_EACH = TIPS / servers.length / 52;

export const composition = [
  { label: "Higher checks", value: CHECK_LIFT, tone: "ink" },
  { label: "Tables that walked", value: COVER_SALES, tone: "gold" },
  { label: "Comps collected & remakes saved", value: COMPS, tone: "taupe" },
  { label: "Overpour", value: POUR, tone: "pale" },
] as const;

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const cents = (n: number) => `$${n.toFixed(2)}`;
export const pctOf = (n: number, of: number) => `${Math.round((n / of) * 100)}%`;
export const pctOf1 = (n: number, of: number) => `${((n / of) * 100).toFixed(1)}%`;
