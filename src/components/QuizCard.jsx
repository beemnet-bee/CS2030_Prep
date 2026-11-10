import { useState } from "react";

// Inline multiple-choice quiz with instant feedback and an explanation.
export default function QuizCard({ id, question, options, answer, why, tag = "Check yourself" }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const correct = picked === answer;

  function choose(i) {
    if (!answered) setPicked(i);
  }

  return (
    <div className="quiz-card">
      <div className="q-head">
        <span className="q-tag">{tag}</span>
        <span className="q-text">{question}</span>
      </div>
      <div className="quiz-opts">
        {options.map((opt, i) => {
          let cls = "quiz-opt";
          if (answered) {
            if (i === answer) cls += " correct";
            else if (i === picked) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={answered}>
              <span className="opt-letter">{"ABCD"[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-why">
          <b>{correct ? "Correct. " : "Not quite. "}</b>
          {why}
        </div>
      )}
    </div>
  );
}
