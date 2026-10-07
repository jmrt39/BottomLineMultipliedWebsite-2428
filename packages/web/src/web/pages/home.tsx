import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, X, Menu, Check } from "lucide-react";
import { CinematicRoom } from "../components/cinematic-room";
import { AmbientClip } from "../components/ambient-clip";
import { OwnerQuestions } from "../components/owner-questions";
import { PaybackCalculator } from "../components/payback-calculator";
import { SampleAudit } from "../components/audit/sample-audit";
import { useReveal } from "../hooks/use-reveal";

// Everything below the hero eases in as it scrolls into view.
const REVEAL_TARGETS = [
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
  ".lasting > .eyebrow",
  ".lasting-heading > *",
  ".lasting-grid > div",
  ".platform-line",
  ".investment-grid > div:first-child > *",
  ".deliverable-heading > *",
  ".deliverable-intro > *",
  ".audit-viewer",
  ".report-contents > .eyebrow",
  ".report-chapter",
  ".price-row",
  ".audit-credit",
  ".questions-heading > *",
  ".question-chapter",
  ".closing > *",
  ".footer-top > *",
];

const methods = [
  {
    title: "First, the truth.",
    phase: "DIAGNOSE",
    time: "THREE WEEKENDS · INSIDE YOUR TEAM",
    description:
      "We become a regular employee in your dining room. Only you know why we’re there. Across shifts and three weekends, we see the habits that a scheduled inspection never will.",
    details: [
      "Real service, observed from inside your team",
      "Missed recommendations, wine opportunities & timing gaps",
      "A written gap report with the dollar figure attached",
    ],
  },
  {
    title: "Then, your standard.",
    phase: "BUILD",
    time: "APPROXIMATELY 30 DAYS",
    description:
      "Your menu. Your people. Your gaps. We turn the diagnosis into a custom training system—not a borrowed playbook. Every detail is built for the way your restaurant should feel.",
    details: [
      "Greeting and guest-recognition scripts",
      "Upsell frameworks & wine presentation",
      "Check delivery & end-of-shift discipline",
    ],
  },
  {
    title: "Finally, staying power.",
    phase: "INSTALL & ACCOUNTABILITY",
    time: "BUILT TO LAST",
    description:
      "We install your program on our proprietary platform. Your team learns, practices, and is signed off on the floor. Managers finally have a system for coaching—not just scheduling.",
    details: [
      "Knowledge checks & manager-signed floor exercises",
      "Six competencies graded from 1–5 for every team member",
      "Live performance reporting tied to sales data",
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
    body: "Comps, voids, discounts and items never rung in; pour consistency and bar leakage; check delivery, closing out tables and end-of-shift side work; sections, staffing and covers per server.",
  },
  {
    title: "What your numbers say.",
    body: "Analysis of your point-of-sale (POS) data, including average check and attach rates by server.",
  },
  {
    title: "What to fix first.",
    body: "A prioritised list of fixes, each with what it is worth.",
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

function Inquiry({ onClose }: { onClose: () => void }) {
  const [saved, setSaved] = useState(false);
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
        <span className="eyebrow">A CONVERSATION BETWEEN OWNERS & EXPERTS</span>
        <h2 id="inquiry-title">
          Let’s talk about
          <br />
          <em>your dining room.</em>
        </h2>
        {saved ? (
          <div className="inquiry-success">
            <Check size={32} />
            <h3>Your preview inquiry is saved.</h3>
            <p>
              It is stored only in this browser. Nothing has been sent, and no call has been booked.
              The live inquiry system will be connected after you choose a direction.
            </p>
            <button className="solid-button" onClick={onClose}>
              Return to the preview <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="inquiry-intro">
              A focused, 20-minute discovery conversation. No generic pitch. Just your restaurant,
              your standards, and what might be getting in the way.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                try {
                  localStorage.setItem("blm-preview-inquiry", JSON.stringify(data));
                  setSaved(true);
                } catch {
                  alert("Browser storage is unavailable. Nothing has been sent.");
                }
              }}
            >
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
              </div>
              <div className="form-grid">
                <label htmlFor="inquiry-restaurant">
                  Restaurant
                  <input
                    id="inquiry-restaurant"
                    aria-label="Restaurant"
                    name="restaurant"
                    required
                    placeholder="Restaurant name"
                  />
                </label>
                <label htmlFor="inquiry-locations">
                  Locations
                  <select id="inquiry-locations" name="locations" defaultValue="1">
                    <option value="1">One location</option>
                    <option value="2">Two locations</option>
                    <option value="3+">Three or more</option>
                  </select>
                </label>
              </div>
              <label htmlFor="inquiry-message">
                What is on your mind?
                <textarea
                  id="inquiry-message"
                  aria-label="What is on your mind?"
                  name="message"
                  rows={3}
                  placeholder="The gap between the experience you intend and the one your guests receive…"
                />
              </label>
              <p className="preview-note">
                DESIGN PREVIEW · This form saves locally only. No inquiry will be sent.
              </p>
              <button className="solid-button" type="submit">
                Preview an inquiry <ArrowUpRight size={17} />
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
  const [step, setStep] = useState(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const closeInquiry = useRef(() => setInquiry(false)).current;
  const siteRef = useRef<HTMLDivElement>(null);
  useReveal(siteRef, REVEAL_TARGETS);
  const openInquiry = () => {
    setMobileMenu(false);
    setInquiry(true);
  };

  return (
    <div className="site theme-noir selected-noir" id="top" ref={siteRef}>
      <header className="header">
        <Wordmark />
        <nav aria-label="Main navigation">
          <a href="#perspective">The perspective</a>
          <a href="#approach">The approach</a>
          <a href="#investment">The investment</a>
        </nav>
        <button className="header-cta" onClick={openInquiry}>
          Begin a conversation <ArrowUpRight size={17} />
        </button>
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
          <a href="#perspective" onClick={() => setMobileMenu(false)}>
            The perspective
          </a>
          <a href="#approach" onClick={() => setMobileMenu(false)}>
            The approach
          </a>
          <a href="#investment" onClick={() => setMobileMenu(false)}>
            The investment
          </a>
          <button onClick={openInquiry}>
            Begin a conversation <ArrowUpRight size={16} />
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
              <span className="tiny-line" /> THREE WEEKENDS. THE WHOLE PICTURE.
            </span>
            <h1 id="hero-title">
              <span className="headline-primary">Your servers are leaving money on the table.</span>{" "}
              <em className="headline-promise">I can show you exactly how much.</em>
            </h1>
            <p>
              I join your floor as a new hire. Only you know who I am. Across{" "}
              <strong>three weekends</strong>, I experience your current training exactly as your
              staff does—where expectations are left unclear, shortcuts become habits, and
              accountability slips. Then I hand you the number your dining room leaks every single
              year.
            </p>
            <button className="hero-cta" onClick={openInquiry}>
              Discover the Disconnect <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="hero-foot">
            <a href="#perspective">
              <ArrowDown size={15} /> THE DIFFERENCE IS IN THE DETAILS
            </a>
          </div>
        </section>

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
                  alt="Photograph of medium-rare sliced beef tenderloin with dark jus, roasted potatoes under a light cream, microgreens and herb-oil dots on an unobstructed white plate in low evening light"
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
                  alt="Guests framed below the eyes: a woman in a black dress smiles over a raised glass of champagne in a wood-panelled dining room"
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

        <section className="perspective section-shell" id="perspective">
          <div className="section-label">
            <span className="eyebrow">01 / THE OWNER’S BLIND SPOT</span>
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
                You need the truth—and a system that holds.
              </p>
            </div>
          </div>
          <div className="perspective-bottom">
            <p>
              For the owner whose reputation
              <br />
              is personal. And whose standards are, too.
            </p>
            <span>ONE OR TWO LOCATIONS. ONE UNCOMPROMISING VISION.</span>
          </div>
        </section>

        <section className="approach section-shell" id="approach">
          <div className="section-label">
            <span className="eyebrow">02 / THE BOTTOM LINE MULTIPLIED METHOD</span>
            <span className="eyebrow">OBSERVE. BUILD. EMBED.</span>
          </div>
          <div className="section-heading">
            <h2>
              Not a seminar.
              <br />
              <em>A transformation from within.</em>
            </h2>
            <p>
              We don’t arrive with answers.
              <br />
              We earn them on your floor.
            </p>
          </div>
          <div className="method-layout">
            <div className="method-photo">
              <img
                src="/images/pristine-occupied-dining.webp"
                alt="Illustrative scene of an occupied, pristine fine-dining room with elegantly dressed guests, attentive black-suited service, full ivory linen, polished crystal and cream upholstery"
                loading="lazy"
              />
              <div className="method-photo-label">
                <span>THE WORK BEGINS HERE.</span>
                <span>Not in a classroom.</span>
              </div>
            </div>
            <div className="method-steps">
              {methods.map((m, i) => (
                <div className={`method-item ${step === i ? "is-open" : ""}`} key={m.phase}>
                  <button
                    onClick={() => setStep(i)}
                    aria-expanded={step === i}
                    aria-controls={`method-${i}`}
                  >
                    <span className="method-number">0{i + 1}</span>
                    <span className="method-title">
                      <span className="eyebrow">{m.phase}</span>
                      <span>{m.title}</span>
                    </span>
                    {step === i ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                  {step === i && (
                    <div className="method-details" id={`method-${i}`}>
                      <span className="timing">{m.time}</span>
                      <p>{m.description}</p>
                      <ul>
                        {m.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="method-signoff">
            <span className="serif-italic">Your menu. Your team. Your numbers.</span>
            <span>NOTHING OFF THE SHELF.</span>
          </div>
        </section>

        <section className="revenue section-shell" id="opportunity">
          <div className="section-label">
            <span className="eyebrow">03 / THE OPPORTUNITY IN PLAIN SIGHT</span>
            <span className="eyebrow">AN ILLUSTRATION, NOT A PROMISE</span>
          </div>
          <div className="revenue-layout">
            <div>
              <h2>
                A small shift.
                <br />
                <em>An extraordinary difference.</em>
              </h2>
              <p>
                One considered recommendation. A more confident wine presentation. A team that knows
                what to say—and when.
              </p>
              <p>
                Slide to your room and see how quickly a higher average check pays for the program.
              </p>
            </div>
            <PaybackCalculator />
          </div>
        </section>

        <section className="lasting section-shell">
          <span className="eyebrow">04 / STANDARDS WITH STAYING POWER</span>
          <div className="lasting-heading">
            <h2>
              The work continues.
              <br />
              <em>Even when we don’t.</em>
            </h2>
            <p>
              A great service shouldn’t depend on who is working.
              <br />
              Or whether the owner is watching.
            </p>
          </div>
          <div className="lasting-grid">
            <div>
              <span className="small-index">I</span>
              <h3>Learn it.</h3>
              <p>
                Custom modules and knowledge checks built around your actual service—not someone
                else’s restaurant.
              </p>
            </div>
            <div>
              <span className="small-index">II</span>
              <h3>Live it.</h3>
              <p>
                Floor exercises signed off by managers. Six competencies. A 1–5 grading system.
                Clear, shared expectations.
              </p>
            </div>
            <div>
              <span className="small-index">III</span>
              <h3>Prove it.</h3>
              <p>
                Live performance reports tied to sales data. Managers coach with evidence. Standards
                become habits.
              </p>
            </div>
          </div>
          <div className="platform-line">
            <span>YOUR CUSTOM PROGRAM. OUR PROPRIETARY PLATFORM.</span>
            <span>
              Included for the first 12 months. <ArrowUpRight size={15} />
            </span>
          </div>
        </section>

        <section className="deliverable section-shell" id="deliverable">
          <div className="section-label">
            <span className="eyebrow">05 / WHAT YOU RECEIVE</span>
            <span className="eyebrow">ONE NUMBER. EVERY REASON BEHIND IT.</span>
          </div>
          <div className="deliverable-grid">
            <div className="deliverable-heading">
              <h2>
                Everything we saw.
                <br />
                <em>Wrapped up in one figure.</em>
              </h2>
            </div>
            <div className="deliverable-intro">
              <p>
                Within 10 business days of the third weekend, you receive the gap report. Then we
                sit down together, in person or on video, and walk through every page.
              </p>
              <p>
                Below is a sample for a modeled 110-cover dining room. In yours, every number comes
                from your own room.
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
        </section>

        <section className="investment section-shell" id="investment">
          <div className="section-label">
            <span className="eyebrow">06 / THE INVESTMENT</span>
            <span className="eyebrow">CLARITY BEFORE COMMITMENT.</span>
          </div>
          <div className="investment-grid">
            <div>
              <h2>
                Know the gap.
                <br />
                <em>Then close it.</em>
              </h2>
              <p>
                Start with a conversation. Then a paid diagnosis.
                <br />
                See the evidence before you commit to the solution.
              </p>
              <button className="text-link" onClick={openInquiry}>
                Arrange a 20-minute discovery call <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="price-list">
              <div className="price-row">
                <div>
                  <span className="eyebrow">THE UNDERCOVER AUDIT</span>
                  <h3>Three weekends. The whole picture.</h3>
                  <p>Gap report, per-server breakdown and debrief within 10 business days.</p>
                </div>
                <span className="price">$10,000</span>
              </div>
              <p className="audit-credit">
                Credited in full toward your program if you proceed within 90 days.
              </p>
              <div className="price-row">
                <div>
                  <span className="eyebrow">THE COMPLETE PROGRAM</span>
                  <h3>Diagnose. Build. Install.</h3>
                  <p>Includes the first 12 months of the platform.</p>
                </div>
                <div className="program-prices">
                  <span>
                    <b>$75,000</b> one location
                  </span>
                  <span>
                    <b>$130,000</b> two locations
                  </span>
                </div>
              </div>
              <button
                className="terms-toggle"
                onClick={() => setPricingOpen(!pricingOpen)}
                aria-expanded={pricingOpen}
              >
                Payment milestones & platform renewal{" "}
                {pricingOpen ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              {pricingOpen && (
                <div className="payment-details">
                  <p>
                    <b>40%</b> to begin the audit · <b>40%</b> when you receive the gap report and
                    custom program · <b>20%</b> at launch on the platform.
                  </p>
                  <p>
                    After year one, the platform renews at <b>$450/month per location.</b> The audit
                    credit is applied to the full program price.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <OwnerQuestions />

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
            Begin a private conversation <ArrowUpRight size={18} />
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
          <span>DIAGNOSTIC TRAINING FOR INDEPENDENT FINE DINING</span>
          <span>PRIVATE. PRECISE. BUILT TO LAST.</span>
        </div>
      </footer>
      {inquiry && <Inquiry onClose={closeInquiry} />}
    </div>
  );
}
