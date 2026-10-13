const chapters = [
  { title: "The audit", from: 0, to: 5 },
  { title: "The program", from: 5, to: 8 },
  { title: "The platform", from: 8, to: 9 },
];

/** Added to the pricing answers while the founder offer is on the site. */
const FOUNDER_LINES: Record<string, string> = {
  "Can I start with just the audit?":
    "Founder restaurants commit before the audit, so the audit fee is waived: $65,000 in two payments or $55,000 paid in full, for one location.",
  "What if I have more than one location?":
    "Founder terms cover one restaurant; additional locations are quoted individually.",
};

const questions = [
  {
    question: "Can I start with just the audit?",
    answer:
      "Yes. The audit is $10,000 per location and stands on its own: $5,000 to book your dates, nonrefundable, and $5,000 when the written gap report is delivered, due within 7 days. You keep the report whether or not you continue. If you go on, the program is $75,000, so $85,000 all in. Committing before the audit costs less, because the audit fee is waived.",
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
    question: "When does my team find out?",
    answer:
      "When you choose, and I recommend before the program is built. I tell them myself, and I frame it as what it is: a look at the system and the training they were given, not a review of anyone personally. Server level figures stay with you and your managers.",
  },
  {
    question: "How long does it take?",
    answer:
      "5 to 6 weeks from the first audit shift to launch. Weeks 1 and 2 on your floor. The gap report and debrief follow, then your program is built, installed on the platform, and your team and managers are trained on it.",
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
    question: "What if I have more than one location?",
    answer:
      "Every floor is audited against one shared standard, and the guarantee applies to each restaurant separately. Two locations: $140,000 audit first, $120,000 committed in two payments, or $100,000 paid in full. Three or more locations are quoted individually.",
  },
  {
    question: "What happens after the first year?",
    answer:
      "Year one of the platform is included in the program. After the first year, the platform continues on a subscription basis. Nothing is rebuilt. Your program, your team's records and every grade so far carry on as they are, and the monthly report keeps measuring every server against the starting point recorded in the audit.",
  },
];

/** The FAQ. The page wraps it in its own chapter. */
export function OwnerQuestions({ founder = false }: { founder?: boolean }) {
  return (
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
                  <p>
                    {answer}
                    {founder && FOUNDER_LINES[question] && (
                      <>
                        {" "}
                        <span className="question-founder">{FOUNDER_LINES[question]}</span>
                      </>
                    )}
                  </p>
                </details>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
