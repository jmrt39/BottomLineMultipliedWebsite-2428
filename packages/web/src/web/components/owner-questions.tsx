const chapters = [
  { title: "The audit", from: 0, to: 4 },
  { title: "The program", from: 4, to: 9 },
  { title: "The platform", from: 9, to: 12 },
];

const questions = [
  {
    question: "Can I start with just the audit?",
    answer:
      "Yes. The audit is $10,000 per location and stands on its own. You keep the diagnosis and the written gap report whether or not you continue, and the full $10,000 is credited toward the $85,000 program if you go ahead.",
  },
  {
    question: "What does the audit involve?",
    answer:
      "Six shifts over two weeks: two weekdays, two Fridays and two Saturdays. I come in as a new employee being trained. You know; your staff don't. I experience exactly what every new hire experiences, then deliver a written report showing every gap found and what each one is worth a year, with the arithmetic shown.",
  },
  {
    question: "Am I really an employee?",
    answer:
      "Yes, hired through your normal process. We sign an agreement first that covers pay, tips, insurance and confidentiality.",
  },
  {
    question: "How long does it take?",
    answer:
      "5 to 6 weeks from the first audit shift to launch. Weeks 1 and 2 on your floor. The gap report and debrief follow, then your program is built, installed on the platform, and your team and managers are trained on it.",
  },
  {
    question: "How is the program paid?",
    answer:
      "The program is $85,000 for one location, paid one of two ways. Pay as you go: $10,000 to begin (that is the audit) and $75,000 on delivery of the program. Or pay in full upfront: $75,000, which is $10,000 less in total.",
  },
  {
    question: "What is the guarantee?",
    answer:
      "It covers what the gap report identifies, not results after training. If the report identifies less than $150,000 in recoverable annual revenue, you do not continue unless you want to. Pay as you go: you have paid $10,000 for the audit and owe nothing more. Paid in full: $65,000 of your $75,000 is refunded; the other $10,000 covers the audit. Recoverable annual revenue is the yearly total of added sales and cost savings the report ties to specific, fixable gaps, each calculated from your POS data and the six observed shifts, with the arithmetic shown so you can check it.",
  },
  {
    question: "What's included?",
    answer:
      "The audit and gap report, the debrief, your custom training program, the first year of the platform at no charge, a one day training on the platform for your staff and managers, and technical support for as long as you use the platform.",
  },
  {
    question: "How do you prove it worked?",
    answer:
      "During the audit I record every server's starting point from your own POS data: average check, spend per ticket and attach rates. After launch, the monthly sales report sets each server's current numbers against that starting point, so you see who has moved, by how much, and what the change is worth across your tickets.",
  },
  {
    question: "Will my results match the case study?",
    answer:
      "Not necessarily. The case study is one upscale fine dining bar over one year of consistent use: the average ticket went from $68 to $84 with no meaningful price changes. Your result depends on your room, your team and how consistently managers use the program. That is why the guarantee covers what the report finds, and the platform measures what actually changes.",
  },
  {
    question: "What's included in the first year of software?",
    answer:
      "Every current server and bartender gets a login, the full training program, knowledge checks and floor exercises signed off by managers, plus manager grading and monthly sales reports. New hires enter the same program at no extra cost during year one.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "From year two the platform is $450 a month for one location ($650 for two, $900 for three, $1,250 for four, $1,500 for five). Nothing is rebuilt. Your program, your team's records and every grade so far carry on as they are. New hires keep entering the same program, managers keep grading the same six competencies, and the monthly report keeps measuring every server against the starting point recorded in the audit.",
  },
  {
    question: "What if I have more than one location?",
    answer:
      "Two locations are $140,000 together, each floor audited against one shared standard. Three or more are quoted individually. After year one the platform is $650 a month for two locations, $900 for three, $1,250 for four and $1,500 for five.",
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
        <span className="eyebrow">09 / BEFORE WE BEGIN</span>
        <span className="eyebrow">THE DETAILS MATTER.</span>
      </div>
      <div className="questions-layout">
        <div className="questions-heading">
          <h2 id="questions-title">
            The questions
            <br />
            <em>owners ask first.</em>
          </h2>
          <p>Supporting detail: the commitment, the work, and what comes next.</p>
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
