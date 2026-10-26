// Demo data for the Platform film. Staff, ratings and sales are fictional and illustrative.
// Module titles and page references follow the 1906 Bar & Grille training manual.

export const VENUE = "1906 Bar & Grille";
export const MODULE_COUNT = 14;

export const COMPETENCIES = [
  "Greeting",
  "Menu Introduction",
  "Leading Questions & Upsell",
  "Order & POS Accuracy",
  "Food & Drink Delivery Etiquette",
  "Rapport, Recovery & Thank You",
] as const;

export type Module = {
  title: string;
  pages: string;
  check: string;
  floor?: string;
};

export const MODULES: Module[] = [
  {
    title: "Standards & Hunting Mentality",
    pages: "pp. 02–04",
    check: "4 questions",
    floor: "Floor walk",
  },
  { title: "Order of Operations: Introduction", pages: "pp. 05–06", check: "Written greeting" },
  { title: "The Art of the Upsell", pages: "pp. 07–09", check: "Menu study", floor: "Roleplay" },
  { title: "Order Accuracy: Food", pages: "p. 10", check: "Ticket review" },
  {
    title: "After Taking Orders & Micros",
    pages: "pp. 11–12, 23",
    check: "POS check",
    floor: "Full roleplay",
  },
  { title: "Liquor Brands: Well / Call / Premium", pages: "pp. 13–14", check: "5 questions" },
  { title: "Beer Brands", pages: "pp. 15–16", check: "8 questions" },
  { title: "Food & Drink Delivery Standards", pages: "p. 17", check: "Tray drill", floor: "Floor" },
  { title: "Leo Says: Special Requests", pages: "pp. 18–19", check: "3 scenarios" },
  { title: "End of Shift", pages: "Checklist", check: "Closing sign-off" },
  { title: "Wine List: Red & White", pages: "pp. 20–21", check: "Pairing quiz" },
  { title: "Specialty Cocktails", pages: "p. 22", check: "Recipe check" },
  { title: "Breakfast (AM)", pages: "p. 24", check: "AM walkthrough" },
  { title: "Table Map", pages: "3 map drills", check: "Label the floor" },
];

export type Staff = {
  name: string;
  initials: string;
  role: "Server" | "Bartender";
  modules: number;
  stars: number;
  ads: number;
  baseline: number;
  checkAvg: number;
  last: string;
  flag?: "Sign-off waiting" | "Check overdue";
  attach: [number, number, number, number];
  attachBase: [number, number, number, number];
};

export const STAFF: Staff[] = [
  {
    name: "Maya Collins",
    initials: "MC",
    role: "Server",
    modules: 9,
    stars: 4.3,
    ads: 76.4,
    baseline: 61.2,
    checkAvg: 172,
    last: "Full roleplay · Today",
    flag: "Sign-off waiting",
    attach: [41, 34, 38, 22],
    attachBase: [26, 18, 21, 12],
  },
  {
    name: "Jordan Price",
    initials: "JP",
    role: "Server",
    modules: 11,
    stars: 4.4,
    ads: 79.3,
    baseline: 69.8,
    checkAvg: 178,
    last: "Delivery drill · Tue",
    attach: [44, 31, 35, 24],
    attachBase: [37, 25, 29, 18],
  },
  {
    name: "Elena Ruiz",
    initials: "ER",
    role: "Server",
    modules: 7,
    stars: 3.6,
    ads: 70.1,
    baseline: 60.6,
    checkAvg: 158,
    last: "Upsell roleplay · Mon",
    flag: "Sign-off waiting",
    attach: [33, 22, 27, 15],
    attachBase: [28, 19, 22, 13],
  },
  {
    name: "Marcus Hill",
    initials: "MH",
    role: "Server",
    modules: 12,
    stars: 4.5,
    ads: 81.6,
    baseline: 73.6,
    checkAvg: 186,
    last: "Full roleplay · Sat",
    attach: [46, 36, 33, 26],
    attachBase: [40, 30, 28, 21],
  },
  {
    name: "Tessa Grant",
    initials: "TG",
    role: "Server",
    modules: 5,
    stars: 3.1,
    ads: 62.0,
    baseline: 57.6,
    checkAvg: 140,
    last: "Floor walk · Sun",
    flag: "Check overdue",
    attach: [24, 15, 19, 10],
    attachBase: [22, 14, 18, 10],
  },
  {
    name: "Devin Shaw",
    initials: "DS",
    role: "Server",
    modules: 8,
    stars: 3.8,
    ads: 71.2,
    baseline: 62.4,
    checkAvg: 161,
    last: "Ticket review · Tue",
    flag: "Sign-off waiting",
    attach: [35, 24, 28, 16],
    attachBase: [30, 21, 24, 13],
  },
  {
    name: "Sam Whitaker",
    initials: "SW",
    role: "Bartender",
    modules: 13,
    stars: 4.6,
    ads: 78.4,
    baseline: 68.1,
    checkAvg: 129,
    last: "Cocktail check · Mon",
    attach: [29, 28, 0, 11],
    attachBase: [21, 20, 0, 7],
  },
  {
    name: "Nadia Brooks",
    initials: "NB",
    role: "Bartender",
    modules: 10,
    stars: 4.1,
    ads: 73.9,
    baseline: 64.0,
    checkAvg: 121,
    last: "Liquor brands · Sun",
    flag: "Sign-off waiting",
    attach: [25, 24, 0, 9],
    attachBase: [20, 19, 0, 7],
  },
  {
    name: "Chris Ortega",
    initials: "CO",
    role: "Bartender",
    modules: 6,
    stars: 3.4,
    ads: 63.3,
    baseline: 58.5,
    checkAvg: 104,
    last: "Beer brands · Sat",
    flag: "Check overdue",
    attach: [19, 17, 0, 6],
    attachBase: [18, 16, 0, 6],
  },
];

export const ATTACH_LABELS = ["Appetizer", "Bottle vs. glass", "Side salad", "Dessert"];

// Maya's profile
export const MAYA_SIGNED = [
  { title: "Standards & Hunting Mentality", by: "Tr. SW · Mgr. DK", date: "Sep 4" },
  { title: "Order of Operations: Introduction", by: "Tr. SW · Mgr. DK", date: "Sep 6" },
  { title: "Order Accuracy: Food", by: "Tr. JP · Mgr. DK", date: "Sep 11" },
  { title: "The Art of the Upsell", by: "Tr. JP · Mgr. DK", date: "Sep 15" },
  { title: "Food & Drink Delivery Standards", by: "Tr. MH · Mgr. DK", date: "Sep 19" },
  { title: "Beer Brands", by: "Tr. SW · Mgr. DK", date: "Sep 24" },
  { title: "Leo Says: Special Requests", by: "Tr. JP · Mgr. DK", date: "Sep 27" },
  { title: "Table Map", by: "Tr. MH · Mgr. DK", date: "Oct 1" },
  { title: "End of Shift", by: "Tr. MH · Mgr. DK", date: "Oct 3" },
];

export const MAYA_COMPETENCY = [4.6, 4.3, 3.9, 4.4, 4.2, 4.1];
export const MAYA_COMPETENCY_START = [3.2, 2.6, 2.1, 2.9, 3.0, 2.8];

// Weekly ADS, audit baseline first
export const MAYA_ADS = [61.2, 62.4, 64.9, 66.3, 68.8, 70.6, 72.9, 74.8, 76.4];

export const MAYA_NOTES = [
  {
    who: "D. Kerr · Manager",
    when: "Today",
    text: "Asked about the occasion at table 14 and sent out a dessert with a candle. Exactly the hunting mentality.",
  },
  {
    who: "J. Price · Trainer",
    when: "Sep 27",
    text: "Special prep entered for the kitchen, not the bar. Re-rang and caught it before send.",
  },
];

// Grading scene
export const GRADE_SCORES = [5, 4, 4, 5, 4, 4];
export const GRADE_WELL =
  "Greeted table 12 inside a minute. Offered the side salad with both steaks and moved them from two glasses to a bottle.";
export const GRADE_REVIEW = "pp. 13–14, Liquor Brands: call vs. premium on the Moscow Mule.";

// Quiz scene: three questions from the wine list and specialty cocktails (pp. 20–22)
export const QUIZ = [
  {
    module: "Wine List: Red · p. 20",
    q: "Table 12 orders the KC strip, medium rare, and wants a bold, full-bodied red by the bottle. Your pick?",
    options: [
      "Meiomi Pinot Noir",
      "Decoy red blend",
      "The Hess Collection Cabernet",
      "Erath Pinot Noir",
    ],
    correct: 2,
  },
  {
    module: "Wine List: Red · p. 20",
    q: "A guest asks for your driest red. What do you recommend?",
    options: [
      "Decoy red blend",
      "Josh Cellars Cabernet",
      "Meiomi Pinot Noir",
      "Deloach Pinot Noir",
    ],
    correct: 1,
  },
  {
    module: "Specialty Cocktails · p. 22",
    q: "Strang’s Sidecar is built on which two spirits?",
    options: [
      "Hennessy VS and Cointreau",
      "Bulleit Bourbon and Cointreau",
      "Knob Creek and turbinado syrup",
      "Hennessy VS and Kahlúa",
    ],
    correct: 0,
  },
];

// v2: the program in use on the floor
export const ADS_TARGET = 78;
export const MANAGER = { name: "D. Kerr", role: "General Manager", initials: "DK" };
export const NEW_HIRE = { name: "Camille Rhodes", role: "Server", initials: "CR" };
export const TRAINER = { name: "Marcus Hill", role: "Server · Trainer", initials: "MH" };
export const ROLES = ["Server", "Bartender", "Sommelier", "Host", "Server Assistant", "Barback"];

export const COWORKER = { name: "Chris Ortega", role: "Bartender", initials: "CO" };

/** A checklist line: who did it (initials) and when it was ticked. */
export type CheckItem = { text: string; by: string[]; time: string };

// v3: staff tick and initial each line as it's done; the manager verifies and signs.
// Row order follows the filmed taps (O4 ticks row 2; C7 ticks rows 3 and 5).
export const OPENING_CHECKLIST: CheckItem[] = [
  { text: "Centerpieces out, fresh water", by: ["CR"], time: "7:44" },
  { text: "Ice bins filled, bar wells iced", by: ["CO"], time: "7:49" },
  { text: "Place settings set to standard", by: ["CR"], time: "7:51" },
  { text: "POS on, printers loaded", by: ["CO"], time: "7:53" },
  { text: "Glassware polished, spot- and print-free", by: ["CR"], time: "7:55" },
  { text: "Specials and 86 list checked with the chef", by: ["CR"], time: "7:58" },
];

export const CLOSING_CHECKLIST: CheckItem[] = [
  { text: "Centerpieces cleared and stored", by: ["CR"], time: "11:14" },
  { text: "Linens stripped, fresh linens laid", by: ["CR", "CO"], time: "11:21" },
  { text: "Tables wiped down", by: ["CO"], time: "11:26" },
  { text: "Silverware rolled and put away", by: ["CR", "CO"], time: "11:33" },
  { text: "Bar wells emptied, ice bins cleaned", by: ["CO"], time: "11:39" },
  { text: "Floor vacuumed, chairs set", by: ["CR"], time: "11:44" },
  { text: "Server reports run, cash counted in", by: ["DK"], time: "11:49" },
];

export const POS_STEPS = [
  { title: "Ring the call drink", detail: "Moscow Mule → Call → Ketel One", page: "p. 14" },
  { title: "Add the modifier", detail: "KC strip · medium rare · sub side salad", page: "p. 11" },
  { title: "Split the check", detail: "Seat 1 and seat 2, by item", page: "p. 12" },
  { title: "Send to the kitchen", detail: "Course 1 fires, entrées held", page: "p. 23" },
];

export const POS_TICKET = [
  { seat: 1, item: "Moscow Mule", mod: "Call · Ketel One", price: 13 },
  { seat: 1, item: "KC Strip", mod: "Medium rare · Sub side salad", price: 46 },
  { seat: 2, item: "Parmesan Crusted Chicken", mod: "No modifications", price: 28 },
  { seat: 2, item: "Smokin’ Old Fashion", mod: "Knob Creek", price: 15 },
];

export const SILVER_CRITERIA = [
  "Glassware spot- and print-free, checked against the light",
  "Glasses carried by the stem, never the bowl",
  "Cutlery set 1″ from the edge, handled only by the handle",
  "Knife to the right, blade facing in",
  "Setting aligned to the chair and centrepiece",
];
export const SILVER_SCORES = [5, 5, 4, 5, 4];

export const EDUCATION = {
  title: "Seasonal updates · Autumn",
  due: "Due Friday",
  items: [
    { kind: "New on the menu", text: "Braised short rib, celery root purée, red-wine jus" },
    { kind: "New on the menu", text: "Apple tart with salted caramel, made in house" },
    { kind: "By the glass", text: "The Hess Collection Cabernet now poured by the glass" },
    { kind: "Retired", text: "Summer berry mule leaves the cocktail list" },
  ],
  check: [
    "Which Cabernet is new by the glass?",
    "What comes with the braised short rib?",
    "Which dessert is made in house?",
  ],
  complete: 7,
  of: 9,
};

export const GUEST_QUOTES = [
  {
    quote:
      "My mother was cold before she said a word. Maya brought her a wrap and moved us by the fire. Setting the standard, every visit.",
    who: "Maya Collins",
    role: "Server",
    source: "Guest survey · Table 14",
    pinned: true,
  },
  {
    quote:
      "The Old Fashioned wasn’t on the zero-proof list, so Sam built one for my husband. Always finding a way.",
    who: "Sam Whitaker",
    role: "Bartender",
    source: "Guest survey · Bar",
  },
  {
    quote:
      "Jordan remembered our anniversary from last year and had the Hess open before we sat down. Above and beyond.",
    who: "Jordan Price",
    role: "Server",
    source: "Guest survey · Table 6",
  },
  {
    quote: "It was pouring. Nadia called our car and walked my father out under an umbrella.",
    who: "Nadia Brooks",
    role: "Bartender",
    source: "Guest survey · Bar",
  },
];

export const INCENTIVES = [
  { title: "Paid day off", detail: "A full quarter at or above your own target, 8 solo shifts a month" },
  { title: "Guest quote recognition", detail: "Read aloud at line up, kept on the profile" },
  { title: "Monthly ADS bonus", detail: "$150 cash at 5% over target on the rolling 30 days, 8 solo shifts" },
  { title: "Chef’s Table for two", detail: "With the sommelier’s pairing" },
  { title: "Certification paid in full", detail: "WSET Level 2 or CMS Introductory" },
  { title: "Ten guests, by name", detail: "Every 10 reviews that name you: a shift with no side work, or $50 to spend here" },
  { title: "Winery or distillery visit", detail: "Top performer of the year" },
];
