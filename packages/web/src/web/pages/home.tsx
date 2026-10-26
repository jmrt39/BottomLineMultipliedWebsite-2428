import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, ArrowRight, ArrowDown, X, Menu, Check, Minus, Plus } from "lucide-react";
import { CinematicRoom } from "../components/cinematic-room";
import { TourFilm } from "../components/tour-film";
import { OwnerQuestions } from "../components/owner-questions";
import { isFounderOpen } from "../lib/founder";
import { Fold, Interlude } from "../components/fold";
import { PaybackCalculator } from "../components/payback-calculator";
import { SampleAudit } from "../components/audit/sample-audit";
import { useReveal } from "../hooks/use-reveal";
import { createInquiryOptions } from "../queries/inquiries";

// Where clients sign in to The Platform. Set VITE_PLATFORM_URL when the platform is published.
const PLATFORM_URL: string =
  import.meta.env.VITE_PLATFORM_URL ?? "https://theplat-hjcx7ui-preview-4200.runable.site/";

// Everything outside the chapters eases in as it scrolls into view. Chapter content
// has its own entrance when it opens.
const REVEAL_TARGETS = [
  ".interlude-frame",
  ".interlude-caption",
  ".culinary-intro > div > *",
  ".culinary-intro > p",
  ".culinary-course",
  ".culinary-signoff",
  ".closing > *",
  ".footer-top > *",
];

// The chapters of the home page, in order. Each opens on its own; one at a time.
const FOLDS = [
  "proof",
  "perspective",
  "approach",
  "deliverable",
  "opportunity",
  "investment",
  "tour",
  "fit",
  "questions",
] as const;
type FoldId = (typeof FOLDS)[number];
const isFold = (id: string): id is FoldId => (FOLDS as readonly string[]).includes(id);
/** Anchors inside a chapter: following one opens its chapter first. */
const INNER_ANCHORS = new Map<string, FoldId>([["founder", "investment"]]);

const TABS: readonly (readonly [FoldId, string])[] = [
  ["proof", "Meet Andrea"],
  ["approach", "The method"],
  ["deliverable", "Sample audit"],
  ["opportunity", "Your numbers"],
  ["investment", "Investment"],
  ["tour", "Platform demo"],
  ["fit", "Is it a fit"],
  ["questions", "Questions"],
];
const HEADER_TABS: FoldId[] = ["proof", "approach", "deliverable", "tour", "investment"];

const methods = [
  {
    title: "First, the truth.",
    phase: "DIAGNOSE",
    time: "WEEKS 1 AND 2 · SIX SHIFTS INSIDE YOUR TEAM",
    description:
      "I join your team as a new employee being trained. You know why I’m there; your staff don’t. Across six shifts (two weekdays, two Fridays and two Saturdays) I experience exactly what every new hire experiences, and see the habits a scheduled inspection never will.",
    details: [
      "A written gap report: every gap, what it is worth a year, and the arithmetic",
      "Spend per ticket by server, from your POS data",
      "A prioritized list of fixes",
      "A debrief, in person or by video",
    ],
  },
  {
    title: "Then, your standard.",
    phase: "BUILD",
    time: "WEEKS 3 TO 5",
    photo: {
      src: "/images/method-tablescape.webp",
      alt: "A fine dining table set in white linen, with crystal stemware, folded napkins and a small green centerpiece, beside a tufted banquette",
    },
    description:
      "Your menu. Your people. Your gaps. The diagnosis becomes a custom training program, not a borrowed playbook, built for the way your restaurant should feel.",
    details: [
      "Your training program, written around your menu and your service",
      "Greeting, recommendation, wine and check scripts",
      "Knowledge checks and floor exercises for every role",
      "Six competencies, each with a 1 to 5 grading guide for managers",
    ],
  },
  {
    title: "Finally, staying power.",
    phase: "INSTALL",
    time: "WEEK 6, THEN THE FIRST YEAR",
    photo: {
      src: "/images/evening-chocolate-cake-natural.webp",
      alt: "A slice of dark chocolate layer cake under a glossy ganache with a fleck of gold leaf, a quenelle of crème fraîche, raspberries and cocoa nibs on a matte white plate",
    },
    description:
      "Your program goes live on our platform. Your team learns, practices and is signed off on the floor. Managers finally have a system for coaching, not just scheduling.",
    details: [
      "A login for every server and bartender",
      "A one day platform training for your staff and managers",
      "Monthly sales reports by server, against the audit starting point",
      "An owner login that shows everything still outstanding, by manager, new hire and server",
      "Guest feedback and recognition tied to each team member",
      "Technical support for as long as you use the platform",
    ],
  },
];

// The rest of the platform, as shown in the demo film.
const platformMore = [
  {
    title: "Guest feedback",
    body: "Post visit survey quotes, each tied to the team member the guest names. The best are read aloud at pre shift and kept on the profile.",
  },
  {
    title: "Recognition and rewards",
    body: "Every server’s average sale from your POS against a monthly target, with the rewards they are working toward and who has earned them. Sections and shifts are never a reward.",
  },
  {
    title: "Checklists",
    body: "Glassware, silverware and end of shift checklists, with every sign off on record.",
  },
  {
    title: "Add a Colleague",
    body: "A new hire enters the same program on day one, with the same modules, checks and sign offs, at no extra cost.",
  },
  {
    title: "Seasonal updates",
    body: "New menus, standards and policies rolled out to the whole team, with each sign off on record.",
  },
];

// The core promise of the platform, in the order it runs.
const coreLoop: [string, string][] = [
  ["Find the gap", "The audit puts a dollar figure on each one."],
  ["Teach the behavior", "Modules and scripts built from your menu."],
  ["Verify execution", "Managers sign off each skill on the floor."],
  ["Measure change", "Monthly sales by server, against the audit."],
  ["Coach and reward", "Coaching from the numbers; rewards for the result."],
];

const platformRules = [
  {
    title: "Your policies, configured per restaurant",
    body: "Conduct, attendance and uniform policies are yours, set up for your restaurant. The platform keeps the record; it applies no policy of its own. Every consequential decision about a team member is made and approved by a manager, never by the platform.",
  },
  {
    title: "Coaching, opportunity and rewards, kept separate",
    body: "Three separate decisions. Coaching goes first to whoever is furthest from target. Sections and shifts are assigned by your managers under your own scheduling rules, and are never a reward. Rewards are earned against a stated target that everyone on the team can reach.",
  },
  {
    title: "Proven before onboarding",
    body: "Before your team goes live, I demonstrate each promised capability with you on your own setup: private records and access restrictions by role, a failed import and how it is caught, a data correction, and a backup restored.",
  },
];

// The owner's view in the platform section. Demo data, fictional.
const ownerOutstanding = [
  {
    who: "Managers",
    what: "3 floor sign offs due",
    detail: "Wine service for Maya and Theo, table touches for Jonah",
    status: "Due Friday",
    tone: "due",
  },
  {
    who: "New hires",
    what: "2 modules not finished",
    detail: "Sofia and Luca, module 3: wine and pairings",
    status: "In progress",
    tone: "open",
  },
  {
    who: "Servers",
    what: "4 knowledge checks overdue",
    detail: "The autumn menu, assigned 9 days ago",
    status: "Overdue",
    tone: "late",
  },
  {
    who: "Bartenders",
    what: "Pour consistency check",
    detail: "Signed off for 2 of 3 bartenders",
    status: "1 open",
    tone: "open",
  },
  {
    who: "Monthly report",
    what: "September sales by server",
    detail: "Against the audit starting point",
    status: "Ready",
    tone: "done",
  },
];

const reportChapters = [
  {
    title: "The habits holding revenue back.",
    body: "Missed recommendations, wine and upsell, pacing and timing, the greeting, guest recognition, table touches, and how service recovers when something goes wrong.",
  },
  {
    title: "How training works today.",
    body: "How new hires are onboarded, and what is actually written down versus passed along by word of mouth.",
  },
  {
    title: "How accountability is managed today.",
    body: "How managers track, coach and sign off their staff, or whether they do.",
  },
  {
    title: "Where money slips out.",
    body: "Comps, voids, price reductions and items never rung in; pour consistency and bar leakage; check delivery, closing out tables and end of shift side work; sections, staffing and tickets per server.",
  },
  {
    title: "What your numbers say.",
    body: "Analysis of your point of sale (POS) data, including average check and attach rates by server.",
  },
  {
    title: "What to fix first.",
    body: "A prioritized list of fixes, each with what it is worth.",
  },
];

const fit = [
  {
    label: "Your restaurant",
    yes: "A fine dining restaurant, or an upscale hotel bar or restaurant, where guests expect exemplary guidance from informed, educated waitstaff who go above and beyond.",
    no: "Counter service, or a menu with little to recommend.",
  },
  {
    label: "Locations",
    yes: "One or two locations. Groups of three to five are quoted individually.",
    no: "A large chain that needs a corporate rollout.",
  },
  {
    label: "Dinner volume",
    yes: "Roughly 100 tickets a night or more, about $2 million or more in annual sales. At 100 tickets, five nights a week, $8 more per ticket adds $208,000 in sales a year. After $6,000 a year in team rewards, $4,000 of training time and six months to full adoption, it recovers the $75,000 fee in about 10 months from launch.",
    no: "Fewer tickets, where the numbers in the calculator above don’t work yet.",
  },
  {
    label: "POS data",
    yes: "You can share sales reports by server from your POS before the first shift.",
    no: "Sales by server can’t be exported or shared.",
  },
  {
    label: "Manager involvement",
    yes: "A manager who will sign off floor exercises, grade the team and coach from the monthly reports.",
    no: "No one on the management team has time to hold the standard.",
  },
];

function Wordmark() {
  return (
    <a className="brand-lockup" href="#top" aria-label="Bottom Line Multiplied home">
      <span className="brand-logo">
        <img src="/images/blm-logo-corrected.png" alt="" width={100} height={70} />
      </span>
      <span className="wordmark">
        <span>Bottom Line</span>
        <span>Multiplied</span>
      </span>
    </a>
  );
}

type Choice<T extends string> = { value: T; label: string };
const ROLES: Choice<"owner" | "gm" | "fnb" | "other">[] = [
  { value: "owner", label: "Owner" },
  { value: "gm", label: "General manager" },
  { value: "fnb", label: "Food & beverage director" },
  { value: "other", label: "Other" },
];
const VENUES: Choice<"restaurant" | "hotel" | "other">[] = [
  { value: "restaurant", label: "Fine dining restaurant" },
  { value: "hotel", label: "Hotel bar or restaurant" },
  { value: "other", label: "Something else" },
];
const VOLUMES: Choice<"under60" | "60to120" | "120to200" | "over200">[] = [
  { value: "under60", label: "Under 60" },
  { value: "60to120", label: "60 to 120" },
  { value: "120to200", label: "120 to 200" },
  { value: "over200", label: "Over 200" },
];
const POS: Choice<"yes" | "unsure" | "no">[] = [
  { value: "yes", label: "Yes" },
  { value: "unsure", label: "Not sure" },
  { value: "no", label: "No" },
];

function Select<T extends string>({
  id,
  name,
  label,
  options,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  options: Choice<T>[];
  defaultValue: T;
}) {
  return (
    <label htmlFor={id}>
      {label}
      <select id={id} name={name} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The 2026 terms, defined again on the inquiry form. */
function FounderTerms({ asking = false }: { asking?: boolean }) {
  const body = (
    <dl className="inquiry-founder-terms">
      <div>
        <dt>What it is</dt>
        <dd>
          Sign by December 31, 2026, on any path, and two things are added to your agreement. The
          price is the same.
        </dd>
      </div>
      <div>
        <dt>18 months of the platform</dt>
        <dd>
          The platform is included for 18 months from launch instead of 12. The subscription starts
          after that, at the year two rate written into your agreement before you sign.
        </dd>
      </div>
      <div>
        <dt>A return visit at month 6</dt>
        <dd>
          Two shifts back on your floor six months after launch, checked against what the audit
          found, with a written update.
        </dd>
      </div>
      <div>
        <dt>Audit first</dt>
        <dd>
          Book your audit in 2026 and both carry over to the program if you go on after the report.
        </dd>
      </div>
    </dl>
  );
  if (asking)
    return (
      <div className="inquiry-founder">
        <p>
          You are asking about the 2026 terms. It starts with the same complimentary 20 minute
          consultation.
        </p>
        {body}
      </div>
    );
  return (
    <details className="inquiry-founder is-collapsed">
      <summary>What the 2026 terms are</summary>
      {body}
    </details>
  );
}

function Inquiry({ onClose, founder }: { onClose: () => void; founder: boolean }) {
  const send = useMutation(createInquiryOptions());
  const founderOpen = isFounderOpen();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialogRef.current?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <dialog
      ref={dialogRef}
      className="modal-backdrop"
      aria-labelledby="inquiry-title"
      onCancel={onClose}
    >
      <div className="inquiry-dialog">
        <button className="close-dialog" aria-label="Close inquiry" onClick={onClose}>
          <X size={22} />
        </button>
        <span className="eyebrow">
          {founder
            ? "THE 2026 TERMS · SIGN BY DECEMBER 31"
            : "A COMPLIMENTARY 20 MINUTE CONSULTATION"}
        </span>
        <h2 id="inquiry-title">
          Let’s see if
          <br />
          <em>this fits your restaurant.</em>
        </h2>
        {send.isSuccess ? (
          <div className="inquiry-success" aria-live="polite">
            <Check size={32} />
            <h3>Thank you. Your note is with me.</h3>
            <p>
              I read every inquiry personally and will be in touch to find a time for our
              conversation.
            </p>
            <button className="solid-button" onClick={onClose}>
              Return to the site <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="inquiry-intro">
              A few quick questions so our conversation is about your restaurant, not a pitch. If it
              isn’t a fit, I’ll tell you.
            </p>
            {founder && founderOpen && <FounderTerms asking />}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (send.isPending) return;
                const data = new FormData(e.currentTarget);
                const field = (key: string) => String(data.get(key) ?? "");
                send.mutate({
                  name: field("name"),
                  role: field("role") as (typeof ROLES)[number]["value"],
                  email: field("email"),
                  restaurant: field("restaurant"),
                  venue: field("venue") as (typeof VENUES)[number]["value"],
                  locations: field("locations") as "1" | "2" | "3+",
                  volume: field("volume") as (typeof VOLUMES)[number]["value"],
                  pos: field("pos") as (typeof POS)[number]["value"],
                  message: field("message"),
                  founder: field("founder") === "yes" ? "yes" : "no",
                  website: field("website"),
                });
              }}
            >
              <label className="inquiry-trap" aria-hidden="true">
                Website
                <input name="website" aria-label="Leave empty" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="form-grid">
                <label htmlFor="inquiry-name">
                  Your name
                  <input
                    id="inquiry-name"
                    aria-label="Your name"
                    name="name"
                    required
                    placeholder="First & last name"
                    autoComplete="name"
                  />
                </label>
                <Select
                  id="inquiry-role"
                  name="role"
                  label="Your role"
                  options={ROLES}
                  defaultValue="owner"
                />
              </div>
              <div className="form-grid">
                <label htmlFor="inquiry-email">
                  Email address
                  <input
                    id="inquiry-email"
                    aria-label="Email address"
                    name="email"
                    type="email"
                    required
                    placeholder="you@restaurant.com"
                    autoComplete="email"
                  />
                </label>
                <label htmlFor="inquiry-restaurant">
                  Restaurant or group
                  <input
                    id="inquiry-restaurant"
                    aria-label="Restaurant or group"
                    name="restaurant"
                    required
                    placeholder="Name"
                  />
                </label>
              </div>
              <div className="form-grid">
                <Select
                  id="inquiry-venue"
                  name="venue"
                  label="Type of venue"
                  options={VENUES}
                  defaultValue="restaurant"
                />
                <label htmlFor="inquiry-locations">
                  Locations
                  <select id="inquiry-locations" name="locations" defaultValue="1">
                    <option value="1">One location</option>
                    <option value="2">Two locations</option>
                    <option value="3+">Three or more</option>
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <Select
                  id="inquiry-volume"
                  name="volume"
                  label="Tickets on a typical night"
                  options={VOLUMES}
                  defaultValue="60to120"
                />
                <Select
                  id="inquiry-pos"
                  name="pos"
                  label="Can you share POS sales by server?"
                  options={POS}
                  defaultValue="yes"
                />
              </div>
              {founderOpen && (
                <>
                  <label htmlFor="inquiry-founder">
                    When you would like to start
                    <select id="inquiry-founder" name="founder" defaultValue={founder ? "yes" : "no"}>
                      <option value="yes">
                        I would like to sign in 2026, on the 2026 terms
                      </option>
                      <option value="no">In 2027, or not sure yet</option>
                    </select>
                  </label>
                  {!founder && <FounderTerms />}
                </>
              )}
              <label htmlFor="inquiry-message">
                What would you most like to fix?
                <textarea
                  id="inquiry-message"
                  aria-label="What would you most like to fix?"
                  name="message"
                  rows={2}
                  placeholder="The gap between the experience you intend and the one your guests receive…"
                />
              </label>
              {send.isError && (
                <p className="inquiry-error" role="alert">
                  Your inquiry did not go through. Please try again in a moment.
                </p>
              )}
              <button className="solid-button" type="submit" disabled={send.isPending}>
                {send.isPending ? "Sending" : "Send my inquiry"} <ArrowUpRight size={17} />
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [inquiry, setInquiry] = useState<false | "standard" | "founder">(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [guaranteeOpen, setGuaranteeOpen] = useState(false);
  const [founderOpen] = useState(() => isFounderOpen());
  const closeInquiry = useRef(() => setInquiry(false)).current;
  const siteRef = useRef<HTMLDivElement>(null);
  useReveal(siteRef, REVEAL_TARGETS);
  const openInquiry = () => {
    setMobileMenu(false);
    setInquiry("standard");
  };
  const openFounder = () => {
    setMobileMenu(false);
    setInquiry("founder");
  };
  const nav = TABS.filter(([id]) => HEADER_TABS.includes(id));

  // Which chapter is open, and how the page should move once it renders.
  const [openFold, setOpenFold] = useState<FoldId | null>(null);
  const openRef = useRef<FoldId | null>(null);
  openRef.current = openFold;
  const move = useRef<{
    id: FoldId;
    mode: "anchor" | "scroll" | "head";
    top: number;
    target?: string;
  } | null>(null);
  const show = useCallback((id: FoldId, mode: "anchor" | "scroll", target?: string) => {
    const el = document.getElementById(id);
    if (mode === "scroll") history.replaceState(null, "", `#${target ?? id}`);
    if (openRef.current === id) {
      if (mode === "scroll")
        document
          .getElementById(target ?? id)
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    move.current = { id, mode, top: el?.getBoundingClientRect().top ?? 0, target };
    setOpenFold(id);
  }, []);
  const close = (id: FoldId, toHead: boolean) => {
    move.current = toHead ? { id, mode: "head", top: 0 } : null;
    setOpenFold(null);
  };
  useLayoutEffect(() => {
    const m = move.current;
    move.current = null;
    const el = m && document.getElementById(m.id);
    if (!m || !el) return;
    if (m.mode === "anchor") {
      // A chapter above may have just closed: keep the one you clicked where it was.
      const shift = el.getBoundingClientRect().top - m.top;
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
    } else if (m.mode === "head") {
      if (el.getBoundingClientRect().top < 0)
        el.scrollIntoView({ block: "start", behavior: "instant" });
    } else {
      (document.getElementById(m.target ?? m.id) ?? el).scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    }
  }, [openFold]);
  // Any link to a chapter, anywhere on the page or in the address bar, opens it.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      const id = link?.getAttribute("href")?.slice(1) ?? "";
      const fold = isFold(id) ? id : INNER_ANCHORS.get(id);
      if (!fold) return;
      e.preventDefault();
      setMobileMenu(false);
      show(fold, "scroll", fold === id ? undefined : id);
    };
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const fold = isFold(id) ? id : INNER_ANCHORS.get(id);
      if (fold) show(fold, "scroll", fold === id ? undefined : id);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", fromHash);
    fromHash();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [show]);
  const foldProps = (id: FoldId) => ({
    open: openFold === id,
    onToggle: () => (openFold === id ? close(id, false) : show(id, "anchor")),
    onClose: () => close(id, true),
    onBook: openInquiry,
  });

  return (
    <div className="site theme-noir selected-noir" id="top" ref={siteRef}>
      <header className="header">
        <Wordmark />
        <nav aria-label="Main navigation">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-signin" href={PLATFORM_URL} rel="noopener">
            Client sign in
          </a>
          <button className="header-cta" onClick={openInquiry}>
            Book your consultation <ArrowUpRight size={17} />
          </button>
        </div>
        <button
          className="menu-toggle"
          aria-expanded={mobileMenu}
          aria-label="Toggle navigation"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>
      {mobileMenu && (
        <nav className="mobile-nav">
          {TABS.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMobileMenu(false)}>
              {label}
            </a>
          ))}
          <a href={PLATFORM_URL} rel="noopener" onClick={() => setMobileMenu(false)}>
            Client sign in
          </a>
          <button onClick={openInquiry}>
            Book your consultation <ArrowUpRight size={16} />
          </button>
        </nav>
      )}

      <main>
        <section className="hero hero-noir" aria-labelledby="hero-title">
          <div className="hero-image">
            <CinematicRoom />
          </div>
          <div className="hero-content">
            <span className="eyebrow">
              <span className="tiny-line" /> FOR FINE DINING AND UPSCALE HOTEL RESTAURANTS
            </span>
            <h1 id="hero-title">
              <span className="headline-primary">Train the habits. Hold the standard.</span>{" "}
              <em className="headline-promise">Multiply your bottom line.</em>
            </h1>
            <p>
              Every night, small moments at the table decide how much each guest spends. To see them
              the way your guests do, I join your team as a new hire, and only you know why I’m
              there. After <strong>six shifts</strong>, you receive a written report that puts a
              dollar figure on every gap, drawn from your own POS data. Then I build the training
              that closes those gaps and install it on our platform, so the standard holds long
              after I leave.
            </p>
            <ul className="hero-glance" aria-label="At a glance">
              <li>Six shifts</li>
              <li>A dollar figure on every gap</li>
              <li>A custom program</li>
              <li>The Audit Opportunity Guarantee</li>
            </ul>
            <div className="hero-actions">
              <button className="hero-cta" onClick={openInquiry}>
                Book your complimentary consultation &amp; reserve your audit&nbsp;dates{" "}
                <ArrowUpRight size={18} />
              </button>
              <a className="hero-secondary" href="#deliverable">
                View a sample audit <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="hero-foot">
            <a href="#proof">
              <ArrowDown size={15} /> $68 TO $84 A TICKET. SEE HOW.
            </a>
          </div>
        </section>

        <nav className="tabbar" aria-label="Chapters">
          <div className="tabbar-inner">
            <ul className="tabbar-tabs">
              {TABS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={openFold === id ? "true" : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <button className="tabbar-book" onClick={openInquiry}>
              <span className="tabbar-book-long">Book your consultation</span>
              <span className="tabbar-book-short">Book</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </nav>

        <div className="chapters-intro section-shell">
          <p className="chapters-hint">
            <span className="eyebrow">NINE CHAPTERS</span>
            Open the one you came for. Each takes a minute or two.
          </p>
          <ul className="assurance" aria-label="Before you book">
            <li>A complimentary 20 minute consultation</li>
            <li>No obligation</li>
            <li>
              The Audit Opportunity Guarantee: if the audit identifies less than 5% of your annual
              net sales in modeled opportunity,{" "}
              <em>you only pay for the audit</em>
            </li>
          </ul>
        </div>

        <Fold
          id="proof"
          number="01"
          label="THE PROOF"
          kicker="HISTORICAL RESULT · ONE RESTAURANT"
          headline="$68 to $84."
          promise="Same menu, one year later."
          action="See how"
          className="proof"
          cta="What could your own average ticket become? Let’s find out, in 20 minutes."
          {...foldProps("proof")}
        >
          <div className="proof-grid">
            <div className="proof-heading">
              <figure className="proof-founder">
                <img
                  src="/images/andrea-martin.webp"
                  alt="Andrea Martin"
                  width={640}
                  height={788}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span className="proof-founder-name">I’m Andrea Martin.</span>
                  <span className="proof-founder-role">Founder · 15+ years in hospitality</span>
                </figcaption>
              </figure>
              <div className="proof-story">
                <p className="proof-intro">
                  For more than 15 years I’ve worked in hospitality, front of house as a server in
                  upscale restaurants and at corporate events, galas and weddings. Everywhere, I saw
                  the same thing: how a company onboards, trains and keeps developing its people can
                  make or break the reputation of the entire establishment.
                </p>
                <p>
                  This method didn’t start in an office. I was a server at an upscale fine dining
                  bar. On day one my manager told me to memorize the menu and the table numbers.
                  Three days later I was on the floor alone, taking tables of eight to ten.
                </p>
                <p>
                  I asked for training materials. There weren’t any. I was told to figure it out, so
                  I did, and built the first version of this system for myself. When management saw
                  it working, they rolled it out to the whole team. A year later, this is what had
                  changed.
                </p>
              </div>
            </div>
            <div className="proof-panel">
              <p className="proof-kind">
                <b>Historical result</b> From one restaurant’s own POS. Not a model, and not the
                sample audit.
              </p>
              <div className="proof-results">
                <div>
                  <span className="proof-label">Average ticket</span>
                  <span className="proof-figure">
                    $68 <em>to</em> $84
                  </span>
                  <span className="proof-note">
                    Up $16, about 24%, over one year. Net sales divided by checks, before tax and
                    tips.
                  </span>
                </div>
                <div>
                  <span className="proof-label">Regional rank, total food & beverage revenue</span>
                  <span className="proof-figure">
                    #11 <em>to</em> #5
                  </span>
                  <span className="proof-note">Among 25 locations in its region</span>
                </div>
              </div>
              <dl className="proof-facts">
                <div>
                  <dt>Venue</dt>
                  <dd>Upscale fine dining bar</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>Dinner</dd>
                </div>
                <div>
                  <dt>Team measured</dt>
                  <dd>2 full time bartenders, 4 full time servers, 6 part time servers</dd>
                </div>
                <div>
                  <dt>Average ticket</dt>
                  <dd>Net sales divided by the number of checks, before tax and tips, from the POS</dd>
                </div>
                <div>
                  <dt>My role</dt>
                  <dd>
                    A server on the team. I wrote the standard for myself; management then trained
                    it to every server and bartender
                  </dd>
                </div>
                <div>
                  <dt>What changed</dt>
                  <dd>One written service standard, trained to every member of the team</dd>
                </div>
                <div>
                  <dt>What did not</dt>
                  <dd>Menu prices, volume, staffing and menu mix: no changes during the year</dd>
                </div>
                <div>
                  <dt>How long</dt>
                  <dd>One year of consistent use</dd>
                </div>
              </dl>
              <p className="proof-caveat">
                One restaurant’s result, shared as evidence of the method. Its POS records are
                confidential to that restaurant and cannot be shared. It is not a forecast for
                yours; your report prices your own restaurant.
              </p>
            </div>
          </div>
          <div className="proof-close">
            <p className="proof-close-lead">
              Now I do for other owners
              <br />
              <em>what I once did for myself.</em>
            </p>
            <div className="proof-close-body">
              <p>
                I work with owners of privately owned, upscale restaurants to win back the revenue
                that slips away during service, often without anyone noticing. My proprietary six
                shift audit shows you exactly where it’s happening and what it’s costing you, in
                dollars. Then I give your team a system that fixes it, and keeps it fixed.
              </p>
              <a className="text-link" href="#approach">
                How the six shift audit works <ArrowDown size={16} />
              </a>
            </div>
          </div>
        </Fold>

        {founderOpen && (
          <div className="founder-band section-shell">
            <aside className="founder-note" aria-labelledby="founder-note-title">
              <span className="founder-note-mark">THE 2026 TERMS · SIGN BY DECEMBER 31</span>
              <p className="founder-note-line" id="founder-note-title">
                Sign in 2026. <em>18 months of the platform, and a return visit.</em>
              </p>
              <p className="founder-note-sub">
                Every restaurant that signs by December 31, 2026, on any path, gets the platform for
                18 months instead of 12 and a return visit at month 6: two shifts back on the floor,
                checked against the audit. The price is the same.
              </p>
              <div className="founder-note-actions">
                <a className="founder-note-link" href="#founder">
                  Read the 2026 terms <ArrowRight size={15} />
                </a>
                <button className="fold-book" onClick={openFounder}>
                  Ask about the 2026 terms <ArrowUpRight size={16} />
                </button>
              </div>
            </aside>
          </div>
        )}

        <Fold
          id="perspective"
          number="02"
          label="THE OWNER’S BLIND SPOT"
          kicker="WHAT NEVER REACHES YOUR DESK"
          headline="None of it reaches your desk."
          promise="All of it reaches your bottom line."
          action="See what I mean"
          className="perspective"
          cta="Twenty minutes, no obligation. Tell me about your floor."
          {...foldProps("perspective")}
        >
          <div className="perspective-grid">
            <h2>
              You know what
              <br />
              your restaurant
              <br />
              <em>could be.</em>
            </h2>
            <div className="perspective-copy">
              <h3>
                But do you know what happens <br />
                when you’re not on the floor?
              </h3>
              <p>
                The greeting that changes with every server. The wine list presented as prices, not
                possibilities. The check that arrives ten minutes too late.
              </p>
              <p>
                None of it makes its way to your desk. All of it makes its way to your bottom line.
              </p>
              <p className="statement">
                You don’t need another workshop.
                <br />
                You need the truth, and a system that holds.
              </p>
            </div>
          </div>
          <div className="perspective-bottom">
            <p>
              For the owner whose reputation <br />
              is personal. And whose standards are, too.
            </p>
            <span>
              FINE DINING RESTAURANTS AND UPSCALE HOTEL BARS. ONE UNCOMPROMISING STANDARD.
            </span>
          </div>
        </Fold>

        <Interlude
          kind="band"
          images={[
            {
              src: "/images/band-before-doors.webp",
              alt: "Illustrative still from the platform demo film: a manager in a gray jacket arrives in a wood paneled dining room as a server sets up behind him, tables dressed in white linen",
            },
          ]}
          caption={["Before the doors open.", "The standard is set long before the first guest."]}
        />

        <Fold
          id="approach"
          number="03"
          label="THE METHOD"
          kicker="DIAGNOSE. BUILD. INSTALL. ABOUT 6 WEEKS."
          headline="Six shifts on your floor."
          promise="Every gap priced in dollars."
          action="See the method"
          className="approach"
          cta="Your first shift starts with a 20 minute conversation. Reserve your audit dates on the call."
          {...foldProps("approach")}
        >
          <div className="section-heading">
            <h2>
              Three steps.
              <br />
              <em>Each with something in your hands.</em>
            </h2>
            <p>
              I don’t arrive with answers.
              <br />I earn them on your floor.
            </p>
          </div>
          <div className="method-layout">
            <div className="method-rail">
              <div className="method-photo">
                <img
                  src="/images/beef-tenderloin-medium-rare.webp"
                  alt="Photograph of medium rare sliced beef tenderloin with dark jus, roasted potatoes under a light cream, microgreens and herb oil dots on an unobstructed white plate in low evening light"
                  loading="lazy"
                />
                <div className="method-photo-label">
                  <span>THE WORK BEGINS HERE.</span>
                  <span>Not in a classroom.</span>
                </div>
              </div>
              {methods.map((m) =>
                m.photo ? (
                  <figure className="method-figure" key={m.phase}>
                    <img src={m.photo.src} alt={m.photo.alt} loading="lazy" />
                  </figure>
                ) : null,
              )}
            </div>
            <ol className="method-steps">
              {methods.map((m, i) => (
                <li className="method-item is-open" key={m.phase}>
                  {m.photo ? (
                    <figure className="method-figure method-figure-inline" aria-hidden="true">
                      <img src={m.photo.src} alt="" loading="lazy" />
                    </figure>
                  ) : null}
                  <div className="method-head">
                    <span className="method-number">0{i + 1}</span>
                    <span className="method-title">
                      <span className="eyebrow">{m.phase}</span>
                      <span>{m.title}</span>
                    </span>
                  </div>
                  <div className="method-details" id={`method-${i}`}>
                    <span className="timing">{m.time}</span>
                    <p>{m.description}</p>
                    <span className="method-receive">YOU RECEIVE</span>
                    <ul>
                      {m.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="method-support">
            <span className="eyebrow">SUPPORT AFTER LAUNCH</span>
            <p>
              Included for the first 12 months: the platform for your whole team, an owner login
              that shows what is still outstanding across the restaurant, new hires entering the
              same program at no extra cost, monthly reports by server, and technical support. After
              the first year, the platform continues on a subscription basis.
            </p>
          </div>
        </Fold>

        <Fold
          id="deliverable"
          number="04"
          label="A SAMPLE AUDIT"
          kicker="MODELED FIGURES · NOT A CLIENT"
          headline="Read the report"
          promise="before you commit to anything."
          action="Open the sample audit"
          className="deliverable"
          cta="Your own report, priced from your own POS data, starts with one call."
          {...foldProps("deliverable")}
        >
          <div className="deliverable-grid">
            <div className="deliverable-heading">
              <h2>
                Everything I saw.
                <br />
                <em>Every dollar worked out.</em>
              </h2>
            </div>
            <div className="deliverable-intro">
              <p>
                After the sixth shift you receive a written gap report: every gap I found and what
                it is worth a year, with the arithmetic shown. Then we sit down together, in person
                or on video, and walk through every page.
              </p>
              <p>
                Below is the short version of a sample report: the summary and what to fix first,
                for a modeled restaurant of 110 tickets a night. Open all six pages to see how every
                number was built. In yours, every number comes from your own restaurant.
              </p>
              <dl className="deliverable-notes">
                <div>
                  <dt>BEFORE WE BEGIN</dt>
                  <dd>Access to your POS reports.</dd>
                </div>
                <div>
                  <dt>DEBRIEF</dt>
                  <dd>In person or by video.</dd>
                </div>
                <div>
                  <dt>TIMELINE</dt>
                  <dd>5 to 6 weeks from the first shift to delivery.</dd>
                </div>
              </dl>
            </div>
          </div>
          <SampleAudit />
          <div className="report-contents">
            <span className="eyebrow">INSIDE EVERY REPORT</span>
            <ol className="report-chapters">
              {reportChapters.map((c, i) => (
                <li className="report-chapter" key={c.title}>
                  <span className="report-numeral">{["I", "II", "III", "IV", "V", "VI"][i]}</span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Fold>

        <Interlude
          kind="trio"
          images={[
            {
              src: "/images/still-set-by-hand.webp",
              alt: "Illustrative still from the platform demo film: a manager straightens a place setting on a white linen table",
              label: "Set by hand.",
            },
            {
              src: "/images/still-graded-on-floor.webp",
              alt: "Illustrative still from the platform demo film: a smiling server rings in an order at the POS while her manager checks it beside her",
              label: "Checked on the floor.",
            },
            {
              src: "/images/still-napkins.webp",
              alt: "Illustrative still from the platform demo film: a server and a colleague fold napkins together at the bar, both smiling",
              label: "Practiced together.",
            },
          ]}
          caption={["Three habits.", "Trained, practiced and signed off, shift after shift."]}
        />

        <Fold
          id="opportunity"
          number="05"
          label="RUN YOUR OWN NUMBERS"
          kicker="A SCENARIO MODEL, NOT A PROMISE"
          headline="What is $8 a ticket worth"
          promise="to your restaurant?"
          action="Run your numbers"
          className="revenue"
          cta="Bring these numbers to your consultation and we’ll test them against your POS."
          {...foldProps("opportunity")}
        >
          <div className="revenue-layout">
            <div>
              <h2>
                A few dollars a ticket.
                <br />
                <em>Three honest scenarios.</em>
              </h2>
              <p>
                Set your tickets, your nights and the added spend per ticket you think is realistic,
                then your own costs: team rewards, paid training time, anything else the program
                adds, and how many months your team takes to adopt it. The model shows a
                conservative case at half your estimate and a higher case at one and a half times.
              </p>
              <p>
                Every result is <b>estimated contribution</b>: added sales less cost of goods and
                card fees, the part that reaches your bottom line. Payback and the first year also
                take off the costs you enter. Not sales, and not a guarantee.
              </p>
              <dl className="revenue-key">
                <div>
                  <dt>Ticket</dt>
                  <dd>One check, as your POS counts it.</dd>
                </div>
                <div>
                  <dt>Contribution</dt>
                  <dd>66% of added sales, after about 30% cost of goods and 4% card fees.</dd>
                </div>
                <div>
                  <dt>Fee recovered</dt>
                  <dd>
                    When contribution, month by month as adoption builds, less your costs, adds up
                    to the fee and training time.
                  </dd>
                </div>
              </dl>
            </div>
            <PaybackCalculator />
          </div>
        </Fold>

        <Fold
          id="investment"
          number="06"
          label="THE INVESTMENT"
          kicker="ONE PROGRAM. TWO WAYS TO START."
          headline="Find less than 5% of your sales?"
          promise="You only pay for the audit."
          action="See the investment"
          className="investment"
          cta="Start with a complimentary 20 minute consultation. No obligation."
          {...foldProps("investment")}
        >
          <div className="investment-grid">
            <div>
              <h2>
                Know the gap.
                <br />
                <em>Then close it.</em>
              </h2>
              <p>
                Two ways to start. Pay for the audit, read the report, then decide. Or commit to
                implementation from the start, under terms written down before the first shift.
              </p>
              <button className="text-link" onClick={openInquiry}>
                Book your complimentary consultation &amp; reserve your audit&nbsp;dates{" "}
                <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="invest-cards">
              <div className="invest-paths" aria-label="Two ways to start">
                <div className="invest-path">
                  <span className="invest-path-step">PATH ONE</span>
                  <h3>Start with the audit</h3>
                  <span className="invest-path-price">$10,000</span>
                  <p>
                    Pay $10,000, receive the report, then decide. Six shifts over two weeks, a
                    written gap report with the arithmetic shown, a breakdown by server and a
                    debrief. $5,000 secures your dates (nonrefundable) and $5,000 is due when the
                    report is delivered. You keep the report and owe nothing more.
                  </p>
                  <span className="invest-path-then">
                    If you go on, the program is $65,000. $75,000 in total.
                  </span>
                </div>
                <div className="invest-path is-commit">
                  <span className="invest-path-step">PATH TWO</span>
                  <h3>Commit to implementation</h3>
                  <span className="invest-path-price">
                    From $55,000 <em>Audit included, paid in full</em>
                  </span>
                  <p>
                    The defined audit to launch program in one agreement: the audit and report, your
                    custom training program, the platform installed and trained, and its first
                    year. The Audit Opportunity Guarantee applies.
                  </p>
                  <span className="invest-path-then">
                    $55,000 paid in full before the audit begins, or $65,000 in two payments.
                  </span>
                </div>
              </div>
              <div className="invest-card is-main">
                <span className="eyebrow">THE FULL PROGRAM · ONE LOCATION</span>
                <div className="invest-price">
                  <h3>Diagnose. Build. Install.</h3>
                  <span className="price">From $55,000</span>
                </div>
                <p className="invest-price-note">
                  Your final program fee is confirmed on your consultation, based on the size of
                  your operation, and written into your agreement.
                </p>
                <p>
                  The audit and gap report, the debrief, your custom training program, the first
                  year of the platform, a one day platform training for staff and managers, and
                  technical support.
                </p>
                <span className="invest-pay-title">HOW TO PAY</span>
                <div className="invest-options is-three">
                  <div>
                    <span className="invest-option">Start with the audit</span>
                    <b>$75,000</b>
                    <span>
                      $10,000 for the audit, then $65,000 for the program in one payment or two:
                      half when you sign on, half when the platform is handed over. Decide after
                      you see the report.
                    </span>
                  </div>
                  <div>
                    <span className="invest-option">Commit up front, two payments</span>
                    <b>$65,000</b>
                    <span>
                      Audit included. $32,500 when you sign on, $32,500 when the platform is handed
                      over.
                    </span>
                  </div>
                  <div>
                    <span className="invest-option">Commit up front, paid in full</span>
                    <b>$55,000</b>
                    <span>Audit included. One payment before the audit begins.</span>
                  </div>
                </div>
                <p className="invest-renewal">
                  <b>After year one.</b> The platform continues on a subscription basis. The year two
                  rate is written into your agreement before you sign, so you know it before you
                  buy.
                </p>
                <p className="invest-renewal invest-publication">
                  <b>Publication, in every agreement.</b> I may publish the findings and results
                  from your restaurant: the figures, your restaurant’s name and video. Staff appear
                  by role only, never by name, and anyone on camera signs a release. You check every
                  fact before it goes out, and nothing is published before the 90 day results check.
                </p>
              </div>
              <div className="guarantee">
                <span className="eyebrow">THE AUDIT OPPORTUNITY GUARANTEE</span>
                <h3>
                  If the audit identifies less than 5% of your annual net sales in modeled annual
                  improvement opportunity, <em>you are not committed to the remaining program fee.</em>
                </h3>
                <p className="guarantee-def">
                  You keep the audit report. This is a diagnostic threshold, not a guarantee of
                  realized results.
                </p>
                <dl>
                  <div>
                    <dt>Started with the audit</dt>
                    <dd>
                      You have paid $10,000 for the audit. You owe nothing more and keep the report.
                    </dd>
                  </div>
                  <div>
                    <dt>Committed up front, two payments</dt>
                    <dd>
                      You have paid $32,500. $22,500 comes back, the second payment is never due,
                      and you keep the report.
                    </dd>
                  </div>
                  <div>
                    <dt>Committed up front, paid in full</dt>
                    <dd>You have paid $55,000. $45,000 comes back, and you keep the report.</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>Decided at the debrief, before your program is built.</dd>
                  </div>
                </dl>
                <button
                  className="guarantee-toggle"
                  onClick={() => setGuaranteeOpen(!guaranteeOpen)}
                  aria-expanded={guaranteeOpen}
                >
                  How the threshold is tested{" "}
                  {guaranteeOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {guaranteeOpen && (
                  <dl className="guarantee-terms">
                    <div>
                      <dt>The threshold</dt>
                      <dd>
                        5% of your actual net sales for the last 12 months, taken from your own POS
                        and written into your agreement before the first shift. Nothing is
                        annualized from a shorter period.
                      </dd>
                    </div>
                    <div>
                      <dt>What counts</dt>
                      <dd>
                        Modeled annual improvement opportunity: the yearly total of added sales and
                        cost savings the report ties to specific, fixable gaps seen on the six
                        shifts. Each is valued by what actually changes: a comp collected counts its
                        price, a remake prevented counts only its cost of goods, and product not used
                        counts at cost.
                      </dd>
                    </div>
                    <div>
                      <dt>Assumptions sheet</dt>
                      <dd>
                        Before the first shift, you and I agree a written assumptions sheet: cost
                        of goods, card fees, nights open, tickets, and how each type of finding is
                        valued. The report cannot change it.
                      </dd>
                    </div>
                    <div>
                      <dt>Exclusions</dt>
                      <dd>
                        Left out of the count, and listed in the report: price increases, new menu
                        items, anything not seen on the six shifts, and any gap you and I agree
                        cannot be fixed by training.
                      </dd>
                    </div>
                    <div>
                      <dt>Conservative case</dt>
                      <dd>
                        The threshold is tested on the report’s conservative case, never the
                        expected or higher case. Each server’s target closes only half the
                        distance to your own top two, never an industry benchmark.
                      </dd>
                    </div>
                    <div>
                      <dt>Like for like</dt>
                      <dd>
                        Before assigning a target, we review whether differences reflect service
                        behavior or different selling opportunities: party size, section, daypart,
                        private events, comps and price reductions on the check, and shift mix.
                      </dd>
                    </div>
                    <div>
                      <dt>Disputed inputs</dt>
                      <dd>
                        Your accountant can review every figure before the debrief. Any input you
                        dispute in writing is settled from your POS records; if it cannot be
                        settled, the lower figure is used.
                      </dd>
                    </div>
                    <div>
                      <dt>Fit check</dt>
                      <dd>
                        After you sign, you send two POS exports: net sales for the last 12 months,
                        which set the threshold, and 90 days of sales by server, which set each
                        server’s starting point. We confirm both before the first shift. If the
                        numbers don’t support the program, everything you’ve paid beyond the
                        $10,000 audit fee is returned in full.
                      </dd>
                    </div>
                    <div>
                      <dt>Two locations</dt>
                      <dd>
                        The same rule for each location: 5% of that restaurant’s own annual net
                        sales, with $10,000 kept for each audit.
                      </dd>
                    </div>
                  </dl>
                )}
                <p className="guarantee-note">
                  The full terms are written into your agreement before the first shift.
                </p>
              </div>
              {founderOpen && (
                <div className="founder-card" id="founder">
                  <span className="eyebrow">THE 2026 TERMS · ANY PATH</span>
                  <h3>
                    Sign by December&nbsp;31, 2026, <em>and two things are added.</em>
                  </h3>
                  <p>
                    The prices above stay the same. Every restaurant that signs its agreement by
                    December&nbsp;31, 2026 receives both of these, written into the agreement.
                  </p>
                  <div className="invest-options founder-options">
                    <div>
                      <span className="invest-option">The platform</span>
                      <b>18 months</b>
                      <span>
                        Included from launch instead of 12. The subscription starts after that, at
                        the year two rate written into your agreement before you sign.
                      </span>
                    </div>
                    <div>
                      <span className="invest-option">A return visit</span>
                      <b>Month 6</b>
                      <span>
                        Two shifts back on your floor six months after launch, checked against what
                        the audit found, with a written update.
                      </span>
                    </div>
                  </div>
                  <dl className="founder-terms">
                    <div>
                      <dt>Any path</dt>
                      <dd>
                        Paid in full, two payments, or audit first. Book your audit in 2026 and both
                        carry over to the program if you go on after the report.
                      </dd>
                    </div>
                    <div>
                      <dt>Two locations</dt>
                      <dd>Both apply to each location, with a return visit to each restaurant.</dd>
                    </div>
                    <div>
                      <dt>The guarantee</dt>
                      <dd>The Audit Opportunity Guarantee and its refunds are unchanged.</dd>
                    </div>
                    <div>
                      <dt>The date</dt>
                      <dd>Agreements signed by December 31, 2026.</dd>
                    </div>
                  </dl>
                  <div className="founder-claim">
                    <button className="fold-book" onClick={openFounder}>
                      Ask about the 2026 terms <ArrowUpRight size={16} />
                    </button>
                    <span>It begins with a complimentary 20 minute consultation.</span>
                  </div>
                </div>
              )}
              <button
                className="terms-toggle"
                onClick={() => setTermsOpen(!termsOpen)}
                aria-expanded={termsOpen}
              >
                Two locations, and the platform after year one{" "}
                {termsOpen ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              {termsOpen && (
                <div className="payment-details">
                  <table className="price-table">
                    <caption>The program, by location</caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="sr-only">Locations</span>
                        </th>
                        <th scope="col">Audit first</th>
                        <th scope="col">Commit up front, two payments</th>
                        <th scope="col">Commit up front, paid in full</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">One location</th>
                        <td>From $75,000</td>
                        <td>From $65,000</td>
                        <td>From $55,000</td>
                      </tr>
                      <tr>
                        <th scope="row">Two locations</th>
                        <td>From $120,000</td>
                        <td>From $100,000</td>
                        <td>From $80,000</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Two locations audit first: $20,000 for the two audits, then $100,000 for the
                    program. Both floors are audited against one shared standard. Three or more
                    locations are quoted individually.
                  </p>
                  <p>
                    Year one of the platform is included with the program, for every server,
                    bartender and manager, with an owner login for you. It includes quarterly
                    updates (seasonal rollouts, new standards and new policies, each sign off on
                    record) and up to four further customizations. Support is a one day platform
                    training at launch, and technical support for as long as you use the platform.
                    After the first year, the platform continues on a subscription basis, at the
                    year two rate written into your agreement before you sign.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Fold>

        <Interlude
          kind="band"
          images={[
            {
              src: "/images/band-last-table.webp",
              alt: "Illustrative still from the platform demo film: two staff smooth a fresh white cloth over a round table in a lamplit dining room",
            },
          ]}
          caption={["The last table of the night.", "Dressed exactly like the first."]}
        />

        <Fold
          id="tour"
          number="07"
          label="THE PLATFORM DEMO"
          kicker="95 SECONDS · NO LOGIN NEEDED"
          headline="The standard holds"
          promise="even when you’re not watching."
          action="Watch the demo"
          className="tour"
          cta="See the platform built around your menu, your team and your standard."
          {...foldProps("tour")}
        >
          <div className="tour-heading">
            <h2 id="tour-title">
              The work continues.
              <br />
              <em>Even when I don’t.</em>
            </h2>
            <p>
              A great service shouldn’t depend on who is working, or whether the owner is watching.
              Here is the platform your program lives on, shown with a fictional demo restaurant.
            </p>
          </div>
          <div className="core-loop" aria-labelledby="core-loop-title">
            <p className="core-loop-title" id="core-loop-title">
              One loop. <em>Everything in the platform supports it.</em>
            </p>
            <ol>
              {coreLoop.map(([step, body], i) => (
                <li key={step}>
                  <span className="core-loop-n">{i + 1}</span>
                  <b>{step}</b>
                  <span>{body}</span>
                </li>
              ))}
            </ol>
          </div>
          <TourFilm />
          <div className="lasting-grid">
            <div>
              <span className="small-index">I</span>
              <h3>Learn it.</h3>
              <p>
                Custom modules and knowledge checks built around your actual service, not someone
                else’s restaurant.
              </p>
            </div>
            <div>
              <span className="small-index">II</span>
              <h3>Live it.</h3>
              <p>
                Floor exercises signed off by managers. Six competencies. A 1 to 5 grading system.
                Clear, shared expectations.
              </p>
            </div>
            <div>
              <span className="small-index">III</span>
              <h3>Prove it.</h3>
              <p>
                Monthly sales reports by server, measured against the audit starting point. Managers
                coach with evidence. Standards become habits.
              </p>
            </div>
          </div>
          <div className="owner-view">
            <div className="owner-view-copy">
              <span className="small-index">IV</span>
              <h3>
                Oversee it.
                <em>Everything still outstanding, in one view.</em>
              </h3>
              <p>
                The platform is yours as well. From your own owner login you see what is still open
                across the restaurant: the sign offs your managers have not yet completed, the
                modules your new hires have not finished, the knowledge checks that are overdue, and
                how every server is tracking against the audit starting point.
              </p>
              <p className="owner-view-goal">
                The goal is owner transparency across every part of the business. You no longer have
                to ask, or be on the floor, to know where things stand.
              </p>
            </div>
            <figure className="owner-panel" aria-label="Example of the owner view, demo data">
              <figcaption>
                <span>Owner view · Outstanding</span>
                <em>Demo restaurant</em>
              </figcaption>
              <ul>
                {ownerOutstanding.map((o) => (
                  <li key={o.who}>
                    <span className="owner-panel-who">{o.who}</span>
                    <span className="owner-panel-what">
                      {o.what}
                      <small>{o.detail}</small>
                    </span>
                    <span className={`owner-panel-status is-${o.tone}`}>{o.status}</span>
                  </li>
                ))}
              </ul>
              <p className="owner-panel-note">Demo data · names and figures are fictional.</p>
            </figure>
          </div>
          <div className="platform-more">
            <div className="platform-more-head">
              <span className="small-index">V</span>
              <h3>
                Also in the platform.
                <em>Shown in the demo above.</em>
              </h3>
            </div>
            <ul>
              {platformMore.map((m) => (
                <li key={m.title}>
                  <span>{m.title}</span>
                  <p>{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="platform-rules">
            <p className="platform-rules-head">
              How the platform is governed. <em>Your rules, people deciding.</em>
            </p>
            <ul>
              {platformRules.map((m) => (
                <li key={m.title}>
                  <span>{m.title}</span>
                  <p>{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Fold>

        <Fold
          id="fit"
          number="08"
          label="WHO THIS FITS"
          kicker="AN HONEST CHECK BEFORE WE TALK"
          headline="This is not for every restaurant."
          promise="Is it right for yours?"
          action="Check the fit"
          className="fit"
          {...foldProps("fit")}
        >
          <div className="fit-heading">
            <h2 id="fit-title">
              Right for some restaurants.
              <br />
              <em>Not for every restaurant.</em>
            </h2>
            <p>
              If most of what is marked a good fit sounds like you, a complimentary consultation is
              worth 20 minutes.
            </p>
          </div>
          <table className="fit-table">
            <caption className="sr-only">Who this fits</caption>
            <thead>
              <tr className="fit-row fit-cols">
                <th scope="col">
                  <span className="sr-only">Area</span>
                </th>
                <th scope="col">
                  <Check size={15} aria-hidden="true" />A good fit
                </th>
                <th scope="col">
                  <X size={15} aria-hidden="true" />
                  Probably not yet
                </th>
              </tr>
            </thead>
            <tbody>
              {fit.map((f) => (
                <tr className="fit-row" key={f.label}>
                  <th className="fit-label" scope="row">
                    {f.label}
                  </th>
                  <td className="fit-yes">
                    <Check size={15} aria-hidden="true" />
                    <span>
                      <span className="fit-tag" aria-hidden="true">
                        A good fit
                      </span>
                      {f.yes}
                    </span>
                  </td>
                  <td className="fit-no">
                    <X size={15} aria-hidden="true" />
                    <span>
                      <span className="fit-tag" aria-hidden="true">
                        Probably not yet
                      </span>
                      {f.no}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="hero-cta fit-cta" onClick={openInquiry}>
            Book your complimentary consultation &amp; reserve your audit&nbsp;dates{" "}
            <ArrowUpRight size={18} />
          </button>
        </Fold>

        <Interlude
          kind="pair"
          images={[
            {
              src: "/images/still-the-room.webp",
              alt: "Illustrative still from the platform demo film: a manager stands in a wood paneled dining room set for service, under a chandelier",
              label: "Seen by the owner.",
            },
            {
              src: "/images/still-after-hours.webp",
              alt: "Illustrative still from the platform demo film: after close, a server clears a bin of white flowers from a sideboard",
              label: "Held after close.",
            },
          ]}
          caption={["Whoever is working.", "Whether or not you are watching."]}
        />

        <Fold
          id="questions"
          number="09"
          label="BEFORE WE BEGIN"
          kicker="THE DETAILS MATTER."
          headline="Am I really an employee?"
          promise="And eight more questions owners ask first."
          action="Read the answers"
          className="owner-questions"
          cta="Still have a question? Ask it on the call."
          {...foldProps("questions")}
        >
          <OwnerQuestions founder={founderOpen} />
        </Fold>

        <section className="culinary section-shell" aria-labelledby="culinary-title">
          <div className="culinary-intro">
            <div>
              <span className="eyebrow">THE STANDARD YOU’VE BUILT</span>
              <h2 id="culinary-title">
                The kitchen sets the standard.
                <br />
                <em>The service must match it.</em>
              </h2>
            </div>
            <p>
              Your guests should feel the same precision in the greeting, the recommendation, and
              the final pour as they do in every dish.
            </p>
          </div>
          <div className="culinary-gallery">
            <figure className="culinary-course course-scallops">
              <div className="course-image">
                <img
                  src="/images/method-gloved-service.webp"
                  alt="A server in white gloves setting a plated course on a white linen table"
                  loading="lazy"
                />
              </div>
              <figcaption>
                <span>01 / CRAFT</span>
                <em>Precise on the plate.</em>
              </figcaption>
            </figure>
            <figure className="culinary-course course-lobster">
              <div className="course-image">
                <img
                  src="/images/guest-served-pexels-3717879.webp"
                  alt="A smiling guest in a black top looks up as a server in a white shirt sets down her plate"
                  loading="lazy"
                />
              </div>
              <figcaption>
                <span>02 / CARE</span>
                <em>Felt at every table.</em>
              </figcaption>
            </figure>
            <figure className="culinary-course course-duck">
              <div className="course-image">
                <img
                  src="/images/pristine-occupied-dining.webp"
                  alt="Illustrative scene of an occupied, pristine fine dining restaurant with elegantly dressed guests, attentive black suited service, full ivory linen, polished crystal and cream upholstery"
                  loading="lazy"
                />
              </div>
              <figcaption>
                <span>03 / REPUTATION</span>
                <em>Memorable by design.</em>
              </figcaption>
            </figure>
          </div>
          <div className="culinary-signoff">
            <span>EXCEPTIONAL FOOD DESERVES EXCEPTIONAL SERVICE.</span>
            <span>From the first impression to the final pour.</span>
          </div>
        </section>

        <section className="closing section-shell">
          <span className="eyebrow">THE NEXT CHAPTER OF YOUR RESTAURANT</span>
          <h2>
            Your reputation is earned
            <br />
            every evening.
            <br />
            <em>Let’s make every one count.</em>
          </h2>
          <button className="hero-cta" onClick={openInquiry}>
            Book your complimentary consultation &amp; reserve your audit&nbsp;dates{" "}
            <ArrowUpRight size={18} />
          </button>
          <span className="closing-note">20 MINUTES. YOUR RESTAURANT. NO OBLIGATION.</span>
          {founderOpen && (
            <a className="closing-founder" href="#founder">
              Sign by December 31, 2026: 18 months of the platform and a return visit.{" "}
              <em>Read the terms</em>
            </a>
          )}
        </section>
      </main>
      <footer className="footer section-shell">
        <div className="footer-top">
          <Wordmark />
          <p>
            Inside your restaurant.
            <br />
            Beyond your expectations.
          </p>
          <a href="#top">
            Back to the beginning <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bottom Line Multiplied.</span>
          <span>DIAGNOSTIC TRAINING FOR FINE DINING AND HOTEL HOSPITALITY</span>
          <span>PRIVATE. PRECISE. BUILT TO LAST.</span>
        </div>
      </footer>
      {inquiry && <Inquiry onClose={closeInquiry} founder={inquiry === "founder"} />}
    </div>
  );
}
