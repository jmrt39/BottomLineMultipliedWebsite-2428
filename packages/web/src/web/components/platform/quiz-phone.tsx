import { Check } from "lucide-react";
import { QUIZ } from "./data";
import { Cam } from "./camera";
import { SCENES, ease, easeInOut, easeOut, lerp, rise } from "./timeline";

const PHONE_X = 640;

const LETTERS = ["A", "B", "C", "D"];
// Scene clock: seconds since the quiz scene started.
const STEPS = [
  { tap: 3.0, reveal: 3.4, number: 3 },
  { tap: 6.0, reveal: 6.4, number: 7 },
  { tap: 8.6, reveal: 9.0, number: 10 },
];
const SLIDES = [4.4, 7.2, 9.7];

function Question({ i, t }: { i: number; t: number }) {
  const q = QUIZ[i];
  const { tap, reveal, number } = STEPS[i];
  return (
    <div className="platform-quiz-q">
      <div className="platform-quiz-top">
        <span>Knowledge check</span>
        <b>
          {number} <small>of 10</small>
        </b>
      </div>
      <span className="platform-quiz-bar">
        <span style={{ width: `${(number / 10) * 100}%` }} />
      </span>
      <span className="platform-quiz-module">{q.module}</span>
      <h3>{q.q}</h3>
      <div className="platform-quiz-options">
        {q.options.map((o, k) => {
          const isAnswer = k === q.correct;
          const pressed = isAnswer && t >= tap;
          const right = isAnswer && t >= reveal;
          const pop = isAnswer
            ? 1 - 0.03 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tap) / 0.3)))
            : 1;
          return (
            <span
              key={o}
              className={`platform-quiz-option${pressed ? " is-pressed" : ""}${right ? " is-right" : ""}`}
              style={{
                transform: `scale(${pop})`,
                opacity: right || t < reveal ? 1 : lerp(1, 0.45, ease(t, reveal, reveal + 0.4)),
              }}
            >
              <i>{right ? <Check size={16} strokeWidth={2} /> : LETTERS[k]}</i>
              {o}
            </span>
          );
        })}
      </div>
      <span
        className="platform-quiz-feedback"
        style={{ opacity: ease(t, reveal + 0.1, reveal + 0.5) }}
      >
        Correct <i>·</i> {q.module.split("·")[1]?.trim()}
      </span>
    </div>
  );
}

export function QuizScene({ t: tv }: { t: number }) {
  const t = tv - SCENES.quiz[0];
  const slid = SLIDES.reduce((a, at) => a + ease(t, at, at + 0.7, easeInOut), 0);
  const result = ease(t, SLIDES[2] + 0.3, SLIDES[2] + 1.1, easeOut);
  const note = ease(t, SLIDES[2] + 0.9, SLIDES[2] + 1.6, easeOut);
  const float = lerp(0, -14, ease(t, -0.4, 11.6));
  const pages = [0, 1, 2].map((i) => <Question key={i} i={i} t={t} />);
  return (
    <Cam
      t={t}
      keys={[
        { t: -0.4, x: 960, y: 485, s: 1 },
        { t: 1.4, x: 960, y: 485, s: 1.03 },
        { t: 2.4, x: PHONE_X, y: 480, s: 1.34 },
        { t: 9.4, x: PHONE_X, y: 466, s: 1.36 },
        { t: 11.2, x: 960, y: 485, s: 1.06 },
      ]}
    >
      <div className="platform-quiz-scene">
        <div
          className="platform-phone"
          style={{ ...rise(t, -0.2, 0, 0, 1.0, 40), marginTop: float }}
        >
          <div className="platform-phone-screen">
            <div className="platform-phone-status">
              <span>9:41</span>
              <span className="platform-phone-island" />
              <span>1906</span>
            </div>
            <div className="platform-quiz-track">
              {pages.map((q, i) => (
                <div key={i} style={{ transform: `translateX(${100 * i - 100 * slid}%)` }}>
                  {q}
                </div>
              ))}
              <div style={{ transform: `translateX(${300 - 100 * slid}%)` }}>
                <div className="platform-quiz-result">
                  <span className="platform-quiz-module">Weekly knowledge check</span>
                  <strong style={{ opacity: result }}>
                    {Math.round(9 * result)}
                    <small> / 10</small>
                  </strong>
                  <span className="platform-quiz-pass" style={{ opacity: result }}>
                    <Check size={16} strokeWidth={2} /> Passed
                  </span>
                  <p style={{ opacity: result }}>Pass mark 8 of 10. One to revisit:</p>
                  <span className="platform-quiz-review" style={{ opacity: result }}>
                    Liquor Brands · p. 14
                  </span>
                  <span className="platform-quiz-done" style={{ opacity: result }}>
                    Done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <aside className="platform-quiz-side">
          <span className="platform-kicker" style={rise(t, 0, 0)}>
            Staff side · on their own phone
          </span>
          <h2 style={rise(t, 0.2, 0)}>
            Ten questions,
            <br />
            <em>straight from the manual.</em>
          </h2>
          <p style={rise(t, 0.5, 0)}>
            Every answer is tied to a page. Missed questions send the server back to that page
            before the next shift.
          </p>
          <div
            className="platform-quiz-alert"
            style={{ opacity: note, transform: `translateY(${(1 - note) * 14}px)` }}
          >
            <span className="platform-avatar">MC</span>
            <span>
              Maya Collins passed her knowledge check
              <small>9 / 10 · manager notified · just now</small>
            </span>
          </div>
        </aside>
      </div>
    </Cam>
  );
}
