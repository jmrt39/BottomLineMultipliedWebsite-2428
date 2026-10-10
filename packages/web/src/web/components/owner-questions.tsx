const chapters = [
  { title: "The audit", from: 0, to: 4 },
  { title: "The program", from: 4, to: 8 },
  { title: "The platform", from: 8, to: 11 },
];

const questions = [
  {
    question: "Can I start with just the audit?",
    answer:
      "Yes. The audit is $10,000 per location and stands on its own. You get the diagnosis and the written gap report whether or not you continue, and the $10,000 counts toward the program if you go ahead.",
  },
  {
    question: "What does the audit involve?",
    answer:
      "Six shifts over two weeks: two weekdays, two Fridays and two Saturdays. I come in as a new employee being trained. You know; your staff don't. I experience exactly what every new hire experiences, then deliver a written report showing every gap found and the exact dollar value of what each one costs you a year.",
  },
  {
    question: "Am I really an employee?",
    answer:
      "Yes, hired through your normal process. We sign an agreement first that covers pay, tips, insurance and confidentiality.",
  },
  {
    question: "How long does it take?",
    answer:
      "5 to 6 weeks from the first audit shift to delivery: two weeks on your floor, the gap report and debrief, then your program built, installed on the platform and your team trained on it.",
  },
  {
    question: "How is the program paid?",
    answer:
      "Two ways. Pay as you go: $10,000 upfront for the audit, then $75,000 on delivery, $85,000 in total. Or pay in full upfront: $75,000, which makes the audit free and saves you $10,000.",
  },
  {
    question: "What is the guarantee?",
    answer:
      "If your gap report doesn't reveal at least $150,000 in recoverable annual revenue, you walk away and get everything back except the $10,000 audit fee. Every dollar figure in the report shows its arithmetic, so you can check the number yourself.",
  },
  {
    question: "What's included?",
    answer:
      "The audit and gap report, your custom training program, the first year of the platform at no charge, and a one day training on the platform for your staff and managers.",
  },
  {
    question: "How do you prove it worked?",
    answer:
      "During the audit I record each server's starting numbers. Every report after launch compares against that starting point.",
  },
  {
    question: "What's included in the first year of software?",
    answer:
      "Every current server and bartender gets a login, the full training program, knowledge checks and floor exercises signed off by managers, plus manager grading and monthly sales reports. New hires enter the same program at no extra cost during year one.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "From year two the platform is a subscription of $350 to $450 a month per location. Most owners keep it: it's what keeps new hires selling the same way the audit taught the originals.",
  },
  {
    question: "What if I have more than one location?",
    answer:
      "Two locations are $140,000 together. Three or more rooms are quoted individually. Every location runs on the same program and the same standard, and each floor gets its own audit against it.",
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
