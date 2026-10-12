const chapters = [
  { title: "The audit", from: 0, to: 5 },
  { title: "The program", from: 5, to: 11 },
  { title: "The platform", from: 11, to: 14 },
];

const questions = [
  {
    question: "Can I start with just the audit?",
    answer:
      "Yes. The audit is $10,000 per location and stands on its own. You get the diagnosis and the written gap report whether or not you continue. If you go on to the program, it is $75,000, so $85,000 all in. The way to pay less is to commit before the audit: $75,000 in two payments, or $65,000 paid in full, with the audit fee waived either way.",
  },
  {
    question: "How is the audit paid?",
    answer:
      "$5,000 to book your dates, nonrefundable, and $5,000 when the written gap report is delivered, due within 7 days. Invoiced by ACH or check; card is available with the processing fee passed through.",
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
      "Three ways for one location. Audit first: $85,000 all in, the $10,000 audit, then $75,000 for the program, half when you sign on and half when the platform is handed over to your team. Commit before the audit: $75,000 in two payments, $37,500 when you sign on and $37,500 at handover, with the audit fee waived. Commit and pay in full: $65,000 in one payment before the audit begins.",
  },
  {
    question: "Why commit from the start?",
    answer:
      "You pay less, and you are still protected. Committing before the audit waives the $10,000 audit fee. Paying in full takes off another $10,000 and locks the lower platform rate for years two and three: $450 a month for one location instead of $650, or $650 for two instead of $900. If the report finds less than $150,000 a year, everything you paid comes back except $10,000 for the audit.",
  },
  {
    question: "What is the guarantee?",
    answer:
      "If the written report finds less than $150,000 in recoverable annual revenue, you only pay for the audit. Audit first: you have paid $10,000 and owe nothing more. Committed in two payments: $27,500 of your $37,500 comes back and the second payment is never due. Paid in full: $55,000 of your $65,000 comes back. You keep the report either way. With two locations the $150,000 test applies to each restaurant separately. It covers what the report identifies, not results after training. Recoverable annual revenue is the yearly total of added sales and cost savings the report ties to specific, fixable gaps, each calculated from your POS data and the six observed shifts, with the arithmetic shown so you can check it.",
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
      "Not necessarily. The case study is one upscale fine dining bar over one year of consistent use: the average ticket went from $68 to $84 with no meaningful price changes. Your result depends on your restaurant, your team and how consistently managers use the program. That is why the guarantee covers what the report finds, and the platform measures what actually changes.",
  },
  {
    question: "What's included in the first year of software?",
    answer:
      "Every current server and bartender gets a login, the full training program, knowledge checks and floor exercises signed off by managers, plus manager grading and monthly sales reports. You get an owner login that shows everything still outstanding: sign offs managers have not completed, modules new hires have not finished and knowledge checks that are overdue. New hires enter the same program at no extra cost during year one. Quarterly updates are included: seasonal rollouts, new standards for anything that has since become a problem, and new policies every server reads and signs off on, all kept in the platform. Up to four further customizations beyond your original custom program are included in year one, so it can be refined once it is live.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "Year one of the platform is included in the program. From year two the standard rate is $650 a month for one location ($900 for two, $1,200 for three, $1,600 for four, $2,000 for five). Any owner who commits to 24 months or more gets the lower rate paid in full clients receive: $450 for one location ($650 for two, $900 for three, $1,250 for four, $1,500 for five). Paying in full locks it for years two and three. If a commitment is cancelled before its 24 months are up, the cancellation fee is 50% of the remaining agreement, and any new agreement is at the rate in place at the time, not the earlier one. Nothing is rebuilt. Your program, your team's records and every grade so far carry on as they are, and the monthly report keeps measuring every server against the starting point recorded in the audit.",
  },
  {
    question: "What if I have more than one location?",
    answer:
      "Both floors are audited against one shared standard. Audit first: $140,000 all in, $20,000 for the two audits and $120,000 for the program. Commit before the audits in two payments: $120,000. Commit and pay in full: $100,000. Three or more locations are quoted individually.",
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
