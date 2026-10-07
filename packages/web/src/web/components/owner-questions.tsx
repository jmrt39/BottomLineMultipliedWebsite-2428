const chapters = [
  { title: "The audit", from: 0, to: 2 },
  { title: "The program", from: 2, to: 6 },
  { title: "The platform", from: 6, to: 9 },
];

const questions = [
  {
    question: "Can I start with just the audit?",
    answer:
      "Yes. The paid audit is $10,000 per location and stands on its own. You get the diagnosis and the gap report whether or not you continue. Decide on the full program within 90 days and every audit fee comes off the program price.",
  },
  {
    question: "How is the audit paid?",
    answer:
      "Two payments per location. $5,000 to book the audit dates, nonrefundable, which holds your audit window of three weekends, and $5,000 when the written gap report is delivered, due within 7 days. Invoiced by ACH or check; card available with the processing fee passed through.",
  },
  {
    question: "How is the program paid?",
    answer:
      "In two payments. 50% when you sign on for the full program, and 50% when your platform is handed over: set up, loaded with your program and in your team's hands. Your audit credits come off the program price.",
  },
  {
    question: "Why sign on for the full program from the start?",
    answer:
      "Two reasons. You can walk away: if your gap report finds less yearly profit to recover than the program costs, you cancel and pay only for the audit. And your platform rate is locked for years two and three: $450/month for one location, or $650/month for two locations together instead of $900.",
  },
  {
    question: "How do you prove it worked?",
    answer:
      "During the audit I record each server's starting numbers. Every report after launch compares against that starting point.",
  },
  {
    question: "Am I really an employee?",
    answer:
      "Yes, hired through your normal process. We sign an agreement first that covers pay, tips, insurance and confidentiality.",
  },
  {
    question: "What's included in the 12 months of software?",
    answer:
      "Every current server and bartender gets a login, the full training program, knowledge checks and floor exercises signed off by managers, plus manager grading and monthly sales reports. New hires enter the same program at no extra cost during year one.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "The platform continues at $450 per location per month, or at your locked rate for years two and three if you signed on from the start. Most owners keep it: it's what keeps new hires selling the same way the audit taught the originals.",
  },
  {
    question: "What if I have more than two locations?",
    answer:
      "Three or more rooms are quoted individually. Every location runs on the same program and the same standard, and each floor gets its own audit against it.",
  },
];

export function OwnerQuestions() {
  return (
    <section
      className="owner-questions section-shell"
      id="questions"
      aria-labelledby="questions-title"
    >
      <div className="section-label">
        <span className="eyebrow">07 / BEFORE WE BEGIN</span>
        <span className="eyebrow">THE DETAILS MATTER.</span>
      </div>
      <div className="questions-layout">
        <div className="questions-heading">
          <h2 id="questions-title">
            The questions
            <br />
            <em>owners ask first.</em>
          </h2>
          <p>The commitment, the work, and what comes next.</p>
        </div>
        <div className="questions-list">
          {chapters.map((chapter, chapterIndex) => (
            <div className="question-chapter" key={chapter.title}>
              <div className="chapter-label">
                <span>{["I", "II", "III"][chapterIndex]}</span>
                {chapter.title}
              </div>
              {questions.slice(chapter.from, chapter.to).map(({ question, answer }, offset) => {
                const index = chapter.from + offset;
                return (
                  <details
                    className="question-item"
                    key={question}
                    open={index === 0 ? true : undefined}
                  >
                    <summary>
                      <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="question-text">{question}</span>
                      <span className="question-mark" aria-hidden="true" />
                    </summary>
                    <p>{answer}</p>
                  </details>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
