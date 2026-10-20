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
      "Technical support for as long as you use the platform",
    ],
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
    body: "Comps, voids, discounts and items never rung in; pour consistency and bar leakage; check delivery, closing out tables and end of shift side work; sections, staffing and tickets per server.",
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
    yes: "Roughly 75 tickets a night or more. At 75 tickets, five nights a week, $8 more per ticket adds $156,000 in sales a year and recovers the fee in about a year.",
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
          {founder ? "A FOUNDER PLACE · TWO RESTAURANTS" : "A COMPLIMENTARY 20 MINUTE CONSULTATION"}
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
            {founder && founderOpen && (
              <p className="inquiry-founder">
                You are asking about one of two founder places. It starts with the same
                complimentary 20 minute consultation. Audits begin the week of November 16.
              </p>
            )}
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
                <label htmlFor="inquiry-founder">
                  Founder places
                  <select id="inquiry-founder" name="founder" defaultValue={founder ? "yes" : "no"}>
                    <option value="yes">I would like to be considered for a founder place</option>
                    <option value="no">Not for now</option>
                  </select>
                </label>
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
              <li>A guarantee tied to your sales</li>
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
              The guarantee: if the report finds less than 5% of your annual sales,{" "}
              <em>you only pay for the audit</em>
            </li>
          </ul>
        </div>

        <Fold
          id="proof"
          number="01"
          label="THE PROOF"
          kicker="ONE RESTAURANT. ONE YEAR."
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
              <div className="proof-results">
                <div>
                  <span className="proof-label">Average ticket</span>
                  <span className="proof-figure">
                    $68 <em>to</em> $84
                  </span>
                  <span className="proof-note">Up $16, about 24%, over one year</span>
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
                  <dt>What changed</dt>
                  <dd>One written service standard, trained to every member of the team</dd>
                </div>
                <div>
                  <dt>How long</dt>
                  <dd>One year of consistent use</dd>
                </div>
              </dl>
              <p className="proof-caveat">
                One restaurant’s result, shared as evidence of the method. No meaningful changes to
                menu prices during the year. It is not a forecast for yours; your report prices your
                own restaurant.
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
              <span className="founder-note-mark">TWO FOUNDER RESTAURANTS</span>
              <p className="founder-note-line" id="founder-note-title">
                Two restaurants. <em>Their results, featured here.</em>
              </p>
              <p className="founder-note-sub">
                The full program for one location on founder terms, $10,000 less either way you pay,
                in return for sharing your results. Audits begin the week of November 16. Offered
                until both places are taken.
              </p>
              <div className="founder-note-actions">
                <a className="founder-note-link" href="#founder">
                  Read the founder terms <ArrowRight size={15} />
                </a>
                <button className="fold-book" onClick={openFounder}>
                  Claim your founder place <ArrowUpRight size={16} />
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
                Set your tickets, your nights and the added spend per ticket you think is realistic.
                The model shows a conservative case at half your estimate and a higher case at one
                and a half times.
              </p>
              <p>
                Every result is <b>estimated contribution</b>: added sales less cost of goods and
                card fees, the part that reaches your bottom line. Not sales, and not a guarantee.
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
                  <dd>When a year of contribution, month by month, adds up to the fee.</dd>
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
          kicker="ONE PROGRAM. THREE WAYS TO START."
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
                Start with a complimentary 20 minute consultation. Audit first and see the evidence
                before you commit, or commit from the start and pay less.
              </p>
              <button className="text-link" onClick={openInquiry}>
                Book your complimentary consultation &amp; reserve your audit&nbsp;dates{" "}
                <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="invest-cards">
              <div className="invest-card is-main">
                <span className="eyebrow">THE FULL PROGRAM · ONE LOCATION</span>
                <div className="invest-price">
                  <h3>Diagnose. Build. Install.</h3>
                  <span className="price">From $85,000</span>
                </div>
                <p className="invest-price-note">
                  Your final program fee is confirmed on your consultation, based on the size of
                  your operation.
                </p>
                <p>
                  The audit and gap report, the debrief, your custom training program, the first
                  year of the platform, a one day platform training for staff and managers, and
                  technical support.
                </p>
                <div className="invest-options is-three">
                  <div>
                    <span className="invest-option">Audit first</span>
                    <b>$85,000</b>
                    <span>
                      $10,000 for the audit, then $75,000 for the program: half when you sign on,
                      half when the platform is handed over. Decide after you see the report.
                    </span>
                  </div>
                  <div>
                    <span className="invest-option">Commit before the audit</span>
                    <b>$75,000</b>
                    <span>
                      The audit fee is waived. Two payments: $37,500 when you sign on, $37,500 when
                      the platform is handed over.
                    </span>
                  </div>
                  <div>
                    <span className="invest-option">Commit and pay in full</span>
                    <b>$65,000</b>
                    <span>One payment before the audit begins. $20,000 less than audit first.</span>
                  </div>
                </div>
              </div>
              {founderOpen && (
                <div className="founder-card" id="founder">
                  <span className="eyebrow">THE FOUNDER TERMS · TWO RESTAURANTS</span>
                  <h3>
                    The full program, <em>on founder terms.</em>
                  </h3>
                  <p>
                    Two restaurants will be the ones whose results are featured on this website. In
                    return, their program costs $10,000 less either way they pay. Audits begin the
                    week of November&nbsp;16.
                  </p>
                  <div className="invest-options founder-options">
                    <div>
                      <span className="invest-option">Founder, two payments</span>
                      <b>$65,000</b>
                      <span>
                        $32,500 when you sign on, $32,500 when the platform is handed over. The
                        audit fee is waived, as when you commit before the audit. That is the
                        standard paid in full price, in two payments.
                      </span>
                    </div>
                    <div>
                      <span className="invest-option">Founder, paid in full</span>
                      <b>$55,000</b>
                      <span>One payment when you sign on, before the audit begins.</span>
                    </div>
                  </div>
                  <dl className="founder-terms">
                    <div>
                      <dt>In return</dt>
                      <dd>
                        I will share your results and quote you in marketing material and on this
                        website. Named or anonymous: your choice.
                      </dd>
                    </div>
                    <div>
                      <dt>Check in and references</dt>
                      <dd>
                        A 90 day results check in together, and up to two reference calls with
                        prospective clients in year one.
                      </dd>
                    </div>
                    <div>
                      <dt>One location</dt>
                      <dd>
                        Founder terms cover one restaurant. Additional locations are quoted
                        individually.
                      </dd>
                    </div>
                    <div>
                      <dt>The guarantee</dt>
                      <dd>
                        It applies in full, with $10,000 kept for the audit. Two payments: $22,500
                        of your $32,500 comes back and the second payment is never due. Paid in
                        full: $45,000 of your $55,000 comes back. You keep the report.
                      </dd>
                    </div>
                    <div>
                      <dt>Places</dt>
                      <dd>
                        Two, offered until both are taken or November 16, whichever comes first.
                      </dd>
                    </div>
                  </dl>
                  <div className="founder-claim">
                    <button className="fold-book" onClick={openFounder}>
                      Claim your founder place <ArrowUpRight size={16} />
                    </button>
                    <span>It begins with a complimentary 20 minute consultation.</span>
                  </div>
                </div>
              )}
              <div className="invest-card">
                <span className="eyebrow">THE AUDIT ONLY</span>
                <div className="invest-price">
                  <h3>Six shifts. The whole picture.</h3>
                  <span className="price">$10,000</span>
                </div>
                <p>
                  Two weekdays, two Fridays and two Saturdays over two weeks, a written gap report
                  with every dollar figure worked out, a breakdown by server and a debrief. $5,000
                  secures your dates (nonrefundable) and $5,000 is due when the report is delivered.
                  You keep the report. If you go on to the program, it is $75,000, so $85,000 all
                  in.
                </p>
              </div>
              <div className="guarantee">
                <span className="eyebrow">THE GUARANTEE</span>
                <h3>
                  If the report finds less than 5% of your annual sales in recoverable revenue,
                  <em> you only pay for the audit.</em>
                </h3>
                <dl>
                  <div>
                    <dt>What it covers</dt>
                    <dd>
                      What the gap report identifies, not results after training. Results depend on
                      your team using the program; the platform measures them.
                    </dd>
                  </div>
                  <div>
                    <dt>The measure</dt>
                    <dd>
                      Recoverable annual revenue: the yearly total of added sales and cost savings
                      the report ties to specific, fixable gaps. Each is calculated from your POS
                      data and the six observed shifts, with the arithmetic shown so you can check
                      it.
                    </dd>
                  </div>
                  <div>
                    <dt>How it is set</dt>
                    <dd>
                      Your guarantee is 5% of your net sales for the last 12 months, confirmed from
                      your own POS export and written into your agreement before the first shift.
                      By rules fixed in your agreement before the first shift. Every input comes
                      from your own POS data and the six observed shifts, and every target comes
                      from your own restaurant (your best nights and your own top two servers),
                      never an industry benchmark. Your accountant can review every figure before
                      the debrief, and we go through each line together.
                    </dd>
                  </div>
                  <div>
                    <dt>Fit check</dt>
                    <dd>
                      After you sign, you send a 90 day POS export. We confirm your sales and your
                      guarantee amount before the first shift. If the numbers don’t support
                      the program, your deposit is returned in full.
                    </dd>
                  </div>
                  <div>
                    <dt>Audit first</dt>
                    <dd>
                      You have paid $10,000 for the audit. You owe nothing more and keep the report.
                    </dd>
                  </div>
                  <div>
                    <dt>Committed, two payments</dt>
                    <dd>
                      You have paid $37,500. $27,500 comes back, the second payment is never due,
                      and you keep the report.
                    </dd>
                  </div>
                  <div>
                    <dt>Paid in full</dt>
                    <dd>You have paid $65,000. $55,000 comes back, and you keep the report.</dd>
                  </div>
                  <div>
                    <dt>Two locations</dt>
                    <dd>
                      The same rule for each location: 5% of that restaurant’s own annual
                      sales, with $10,000 kept for each audit.
                    </dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>Decided at the debrief, before your program is built.</dd>
                  </div>
                </dl>
                <p className="guarantee-note">
                  The full terms are written into your agreement before the first shift.
                </p>
              </div>
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
                        <th scope="col">Commit, two payments</th>
                        <th scope="col">Commit, paid in full</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">One location</th>
                        <td>From $85,000</td>
                        <td>From $75,000</td>
                        <td>From $65,000</td>
                      </tr>
                      <tr>
                        <th scope="row">Two locations</th>
                        <td>From $140,000</td>
                        <td>From $120,000</td>
                        <td>From $100,000</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Two locations audit first: $20,000 for the two audits, then $120,000 for the
                    program. Both floors are audited against one shared standard. Three or more
                    locations are quoted individually.
                  </p>
                  <p>
                    Year one of the platform is included with the program, for every server,
                    bartender and manager, with an owner login for you. It includes quarterly
                    updates (seasonal rollouts, new standards and new policies, each sign off on
                    record) and up to four further customizations. Support is a one day platform
                    training at launch, and technical support for as long as you use the platform.
                    After the first year, the platform continues on a subscription basis.
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
              Two founder places, audits from the week of November 16. <em>Read the terms</em>
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
