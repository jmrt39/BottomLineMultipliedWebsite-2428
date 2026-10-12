import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, ArrowRight, ArrowDown, X, Menu, Check, Minus, Plus } from "lucide-react";
import { CinematicRoom } from "../components/cinematic-room";
import { AmbientClip } from "../components/ambient-clip";
import { OwnerQuestions } from "../components/owner-questions";
import { PaybackCalculator } from "../components/payback-calculator";
import { SampleAudit } from "../components/audit/sample-audit";
import { SampleFinding } from "../components/audit/sample-finding";
import { useReveal } from "../hooks/use-reveal";
import { createInquiryOptions } from "../queries/inquiries";

// Where clients sign in to The Platform. Set VITE_PLATFORM_URL when the platform is published.
const PLATFORM_URL: string =
  import.meta.env.VITE_PLATFORM_URL ?? "https://theplat-hjcx7ui-preview-4200.runable.site/";

// Everything below the hero eases in as it scrolls into view.
const REVEAL_TARGETS = [
  ".proof-heading > *",
  ".proof-story > *",
  ".proof-results > div",
  ".proof-facts",
  ".culinary-intro > div > *",
  ".culinary-intro > p",
  ".culinary-course",
  ".culinary-signoff",
  ".section-label",
  ".perspective-grid > h2",
  ".perspective-copy > *",
  ".perspective-bottom",
  ".section-heading > *",
  ".method-photo",
  ".method-item",
  ".method-signoff",
  ".revenue-layout > div:first-child > *",
  ".calculator",
  ".tour-heading > *",
  ".tour-film",
  ".lasting-grid > div",
  ".tour-terms > div",
  ".investment-grid > div:first-child > *",
  ".invest-card",
  ".guarantee",
  ".deliverable-heading > *",
  ".deliverable-intro > *",
  ".sample-finding",
  ".audit-viewer",
  ".report-contents > .eyebrow",
  ".report-chapter",
  ".fit-heading > *",
  ".fit-row",
  ".questions-heading > *",
  ".question-chapter",
  ".closing > *",
  ".footer-top > *",
];

const methods = [
  {
    title: "First, the truth.",
    phase: "DIAGNOSE",
    time: "WEEKS 1 AND 2 · SIX SHIFTS INSIDE YOUR TEAM",
    description:
      "I join your dining room as a new employee being trained. You know why I’m there; your staff don’t. Across six shifts (two weekdays, two Fridays and two Saturdays) I experience exactly what every new hire experiences, and see the habits a scheduled inspection never will.",
    details: [
      "A written gap report: every gap, what it is worth a year, and the arithmetic",
      "Spend per ticket by server, from your POS data",
      "A prioritised list of fixes",
      "A debrief, in person or by video",
    ],
  },
  {
    title: "Then, your standard.",
    phase: "BUILD",
    time: "WEEKS 3 TO 5",
    description:
      "Your menu. Your people. Your gaps. The diagnosis becomes a custom training program, not a borrowed playbook, built for the way your room should feel.",
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
    description:
      "Your program goes live on our platform. Your team learns, practices and is signed off on the floor. Managers finally have a system for coaching, not just scheduling.",
    details: [
      "A login for every server and bartender",
      "A one day platform training for your staff and managers",
      "Monthly sales reports by server, against the audit starting point",
      "Technical support for as long as you use the platform",
    ],
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
    body: "A prioritised list of fixes, each with what it is worth.",
  },
];

const fit = [
  {
    label: "Your room",
    yes: "A fine dining restaurant, or an upscale hotel bar or restaurant, where guests expect to be guided.",
    no: "Counter service, or a menu with little to recommend.",
  },
  {
    label: "Locations",
    yes: "One or two locations. Groups of three to five are quoted individually.",
    no: "A large chain that needs a corporate rollout.",
  },
  {
    label: "Dinner volume",
    yes: "Roughly 60 tickets a night or more. At 60 tickets, five nights a week, $8 more per ticket recovers the fee in about a year.",
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

function Inquiry({ onClose }: { onClose: () => void }) {
  const send = useMutation(createInquiryOptions());
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
        <span className="eyebrow">A PRIVATE 20 MINUTE CONSULTATION</span>
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
              Six quick questions so our conversation is about your restaurant, not a pitch. If it
              isn’t a fit, I’ll tell you.
            </p>
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
                  label="Type of room"
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
  const [inquiry, setInquiry] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const closeInquiry = useRef(() => setInquiry(false)).current;
  const siteRef = useRef<HTMLDivElement>(null);
  useReveal(siteRef, REVEAL_TARGETS);
  const openInquiry = () => {
    setMobileMenu(false);
    setInquiry(true);
  };
  const nav = [
    ["#proof", "The proof"],
    ["#approach", "The method"],
    ["#deliverable", "Sample audit"],
    ["#investment", "The investment"],
  ] as const;

  return (
    <div className="site theme-noir selected-noir" id="top" ref={siteRef}>
      <header className="header">
        <Wordmark />
        <nav aria-label="Main navigation">
          {nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-signin" href={PLATFORM_URL} rel="noopener">
            Client sign in
          </a>
          <button className="header-cta" onClick={openInquiry}>
            Reserve a consultation <ArrowUpRight size={17} />
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
          {nav.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileMenu(false)}>
              {label}
            </a>
          ))}
          <a href="#tour" onClick={() => setMobileMenu(false)}>
            Platform tour
          </a>
          <a href={PLATFORM_URL} rel="noopener" onClick={() => setMobileMenu(false)}>
            Client sign in
          </a>
          <button onClick={openInquiry}>
            Reserve a consultation <ArrowUpRight size={16} />
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
              <li>Two weeks of observation</li>
              <li>Custom program</li>
              <li>First year of platform access</li>
            </ul>
            <div className="hero-actions">
              <button className="hero-cta" onClick={openInquiry}>
                Reserve a private consultation <ArrowUpRight size={18} />
              </button>
              <a className="hero-secondary" href="#sample-finding">
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

        <section className="proof section-shell" id="proof" aria-labelledby="proof-title">
          <div className="section-label">
            <span className="eyebrow">01 / THE PROOF</span>
            <span className="eyebrow">ONE RESTAURANT. ONE YEAR.</span>
          </div>
          <div className="proof-grid">
            <div className="proof-heading">
              <h2 id="proof-title">
                $68 to $84.
                <br />
                <em>Same menu, one year later.</em>
              </h2>
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
                own room.
              </p>
            </div>
          </div>
        </section>

        <section className="perspective section-shell" id="perspective">
          <div className="section-label">
            <span className="eyebrow">02 / THE OWNER’S BLIND SPOT</span>
            <span className="small-motif">×</span>
          </div>
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
                But do you know what happens
                <br />
                when you’re not in the room?
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
              For the owner whose reputation
              <br />
              is personal. And whose standards are, too.
            </p>
            <span>
              FINE DINING RESTAURANTS AND UPSCALE HOTEL BARS. ONE UNCOMPROMISING STANDARD.
            </span>
          </div>
        </section>

        <section className="approach section-shell" id="approach">
          <div className="section-label">
            <span className="eyebrow">03 / THE METHOD</span>
            <span className="eyebrow">DIAGNOSE. BUILD. INSTALL. ABOUT 6 WEEKS.</span>
          </div>
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
            <div className="method-photo">
              <img
                src="/images/pristine-occupied-dining.webp"
                alt="Illustrative scene of an occupied, pristine fine dining room with elegantly dressed guests, attentive black suited service, full ivory linen, polished crystal and cream upholstery"
                loading="lazy"
              />
              <div className="method-photo-label">
                <span>THE WORK BEGINS HERE.</span>
                <span>Not in a classroom.</span>
              </div>
            </div>
            <ol className="method-steps">
              {methods.map((m, i) => (
                <li className="method-item is-open" key={m.phase}>
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
              Included for the first 12 months: the platform for your whole team, new hires entering
              the same program at no extra cost, monthly reports by server, and technical support.
              From year two the platform is $650 a month for one location, or $450 locked for years
              two and three when you pay in full. Technical support continues for as long as you use
              it.
            </p>
          </div>
        </section>

        <section className="deliverable section-shell" id="deliverable">
          <div className="section-label">
            <span className="eyebrow">04 / A SAMPLE AUDIT</span>
            <span className="eyebrow">MODELED FIGURES · NOT A CLIENT</span>
          </div>
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
                Start with one complete finding below, then open the full sample report. It is built
                for a modeled dining room of 110 tickets a night. In yours, every number comes from
                your own room.
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
          <SampleFinding />
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
        </section>

        <section className="revenue section-shell" id="opportunity">
          <div className="section-label">
            <span className="eyebrow">05 / RUN YOUR OWN NUMBERS</span>
            <span className="eyebrow">A SCENARIO MODEL, NOT A PROMISE</span>
          </div>
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
        </section>

        <section className="investment section-shell" id="investment">
          <div className="section-label">
            <span className="eyebrow">06 / THE INVESTMENT</span>
            <span className="eyebrow">ONE PROGRAM. THREE WAYS TO START.</span>
          </div>
          <div className="investment-grid">
            <div>
              <h2>
                Know the gap.
                <br />
                <em>Then close it.</em>
              </h2>
              <p>
                Start with a private 20 minute consultation. Audit first and see the evidence before
                you commit, or commit from the start and pay less.
              </p>
              <button className="text-link" onClick={openInquiry}>
                Reserve a private consultation <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="invest-cards">
              <div className="invest-card is-main">
                <span className="eyebrow">THE FULL PROGRAM · ONE LOCATION</span>
                <div className="invest-price">
                  <h3>Diagnose. Build. Install.</h3>
                  <span className="price">$85,000</span>
                </div>
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
                    <span>
                      One payment before the audit begins. $20,000 less than audit first, and your
                      platform rate is locked for years two and three.
                    </span>
                  </div>
                </div>
              </div>
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
                  If the report finds less than $150,000 a year,
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
                      The same rule for each location: $150,000 a year per room, with $10,000 kept
                      for each audit.
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
                        <td>$85,000</td>
                        <td>$75,000</td>
                        <td>$65,000</td>
                      </tr>
                      <tr>
                        <th scope="row">Two locations</th>
                        <td>$140,000</td>
                        <td>$120,000</td>
                        <td>$100,000</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Two locations audit first: $20,000 for the two audits, then $120,000 for the
                    program. Both floors are audited against one shared standard. Three or more
                    locations are quoted individually.
                  </p>
                  <table className="price-table">
                    <caption>The platform from year two, per month, by number of locations</caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="sr-only">Rate</span>
                        </th>
                        <th scope="col">1</th>
                        <th scope="col">2</th>
                        <th scope="col">3</th>
                        <th scope="col">4</th>
                        <th scope="col">5</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Standard rate</th>
                        <td>$650</td>
                        <td>$900</td>
                        <td>$1,200</td>
                        <td>$1,600</td>
                        <td>$2,000</td>
                      </tr>
                      <tr>
                        <th scope="row">Paid in full, years two and three</th>
                        <td>$450</td>
                        <td>$650</td>
                        <td>$900</td>
                        <td>$1,250</td>
                        <td>$1,500</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    Year one is included with the program. Only owners who pay in full lock the
                    lower rate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="tour section-shell" id="tour" aria-labelledby="tour-title">
          <div className="section-label">
            <span className="eyebrow">07 / THE PLATFORM TOUR</span>
            <span className="eyebrow">90 SECONDS · NO LOGIN NEEDED</span>
          </div>
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
          <figure className="tour-film">
            <video
              src="/videos/platform-demo-90s.mp4"
              poster="/images/platform-demo-poster.webp"
              controls
              playsInline
              preload="none"
              aria-label="Platform tour, 90 seconds, music only"
            >
              <track
                kind="captions"
                src="/videos/platform-demo-90s.vtt"
                srcLang="en"
                label="English"
              />
            </video>
            <figcaption>Demo data · staff names and figures are fictional.</figcaption>
          </figure>
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
          <div className="tour-terms">
            <div>
              <span className="eyebrow">YEAR ONE</span>
              <p>Included with the program, for every server, bartender and manager.</p>
            </div>
            <div>
              <span className="eyebrow">FROM YEAR TWO</span>
              <p>
                <b>$650 a month</b> for one location, up to $2,000 for five. Pay in full and it is
                locked at <b>$450</b> for years two and three.
              </p>
            </div>
            <div>
              <span className="eyebrow">SUPPORT</span>
              <p>
                A one day platform training at launch, and technical support for as long as you use
                the platform.
              </p>
            </div>
          </div>
        </section>

        <section className="fit section-shell" id="fit" aria-labelledby="fit-title">
          <div className="section-label">
            <span className="eyebrow">08 / WHO THIS FITS</span>
            <span className="eyebrow">AN HONEST CHECK BEFORE WE TALK</span>
          </div>
          <div className="fit-heading">
            <h2 id="fit-title">
              Right for some rooms.
              <br />
              <em>Not for every room.</em>
            </h2>
            <p>
              If most of the left column sounds like you, a private consultation is worth 20
              minutes.
            </p>
          </div>
          <table className="fit-table">
            <caption className="sr-only">Who this fits</caption>
            <thead>
              <tr className="fit-row fit-cols">
                <th scope="col">
                  <span className="sr-only">Area</span>
                </th>
                <th scope="col">A good fit</th>
                <th scope="col">Probably not yet</th>
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
                    {f.yes}
                  </td>
                  <td className="fit-no">
                    <X size={15} aria-hidden="true" />
                    {f.no}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="hero-cta fit-cta" onClick={openInquiry}>
            Reserve a private consultation <ArrowUpRight size={18} />
          </button>
        </section>

        <OwnerQuestions />

        <section className="culinary section-shell" aria-labelledby="culinary-title">
          <div className="culinary-intro">
            <div>
              <span className="eyebrow">THE STANDARD YOU’VE BUILT</span>
              <h2 id="culinary-title">
                The kitchen sets the standard.
                <br />
                <em>The room must match it.</em>
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
                  src="/images/beef-tenderloin-medium-rare.webp"
                  alt="Photograph of medium rare sliced beef tenderloin with dark jus, roasted potatoes under a light cream, microgreens and herb oil dots on an unobstructed white plate in low evening light"
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
                  src="/images/guests-laughing-real-v1.webp"
                  alt="Guests framed below the eyes: a woman in a black dress smiles over a raised glass of champagne in a wood panelled dining room"
                  loading="lazy"
                />
                <AmbientClip
                  src="/videos/guests-laughing-real-v1.mp4"
                  poster="/images/guests-laughing-real-v1-poster.webp"
                  label="Silent loop of real guests framed below the eyes: a woman in a black dress smiles over champagne, then a man laughs as glasses meet in a toast"
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
                  src="/images/evening-chocolate-cake-natural.webp"
                  alt="Illustrative plated dessert in soft window light: a tall slice of dark chocolate layer cake under a glossy ganache with a fleck of gold leaf, a quenelle of crème fraîche, raspberries and cocoa nibs on a matte white plate"
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
          <span className="eyebrow">THE NEXT CHAPTER OF YOUR ROOM</span>
          <h2>
            Your reputation is earned
            <br />
            every evening.
            <br />
            <em>Let’s make every one count.</em>
          </h2>
          <button className="hero-cta" onClick={openInquiry}>
            Reserve a private consultation <ArrowUpRight size={18} />
          </button>
          <span className="closing-note">20 MINUTES. YOUR RESTAURANT. NO OBLIGATION.</span>
        </section>
      </main>
      <footer className="footer section-shell">
        <div className="footer-top">
          <Wordmark />
          <p>
            Inside your dining room.
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
      {inquiry && <Inquiry onClose={closeInquiry} />}
    </div>
  );
}
