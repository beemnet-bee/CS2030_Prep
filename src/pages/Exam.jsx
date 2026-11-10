import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icons.jsx";
import { lectures } from "../data/lectures/index.js";
import { useProgress } from "../lib/progress.jsx";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Exam() {
  const { setExamBest, examBest } = useProgress();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    // all lecture quizzes, each tagged with its lecture number
    const all = lectures.flatMap((l) =>
      l.quiz.map((q) => ({ ...q, lecture: l.num, lectureTitle: l.title }))
    );
    return shuffle(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  function submit() {
    setSubmitted(true);
    setExamBest(pct);
    window.scrollTo({ top: 0 });
  }

  function restart() {
    setSeed((s) => s + 1);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Practice Exam</h1>
        <p className="muted mb-3">
          {questions.length} questions drawn from all 8 lectures — the same style the slides used.
          Answer everything, submit, and read the explanations for every miss.
          {examBest !== null && <> Best so far: <b>{examBest}%</b>.</>}
        </p>

        {!submitted ? (
          <>
            <div className="card mb-3" style={{ position: "sticky", top: 72, zIndex: 5 }}>
              <div className="flex justify-between flex-wrap" style={{ gap: 10 }}>
                <span className="small muted">{answeredCount}/{questions.length} answered</span>
                <button className="btn btn-primary btn-sm" onClick={submit} disabled={answeredCount === 0}>
                  <Icon name="checkCircle" size={14} /> Submit &amp; score
                </button>
              </div>
            </div>
            {questions.map((q, i) => (
              <div className="quiz-card exam-q" key={`${seed}-${i}`}>
                <div className="q-head">
                  <span className="q-tag">Q{i + 1} · Lecture {q.lecture}</span>
                </div>
                <div className="q-text mb-1">{q.q}</div>
                <div className="quiz-opts">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`quiz-opt${answers[i] === oi ? " correct" : ""}`}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    >
                      <span className="opt-letter">{"ABCD"[oi]}</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="card center">
              <button className="btn btn-primary" onClick={submit} disabled={answeredCount === 0}>
                <Icon name="checkCircle" size={15} /> Submit &amp; score
              </button>
              <div className="muted small mt-2">You can submit with unanswered questions — they simply score 0.</div>
            </div>
          </>
        ) : (
          <>
            <div className="exam-result mb-3">
              <div className="score-ring-text" style={{ color: pct >= 80 ? "var(--good)" : pct >= 60 ? "var(--warn)" : "var(--bad)" }}>
                {pct}%
              </div>
              <p style={{ fontSize: 17 }}>
                <b>{score} of {questions.length} correct.</b>{" "}
                {pct >= 80
                  ? "Exam ready — review the ones you missed and keep the cheat sheet handy."
                  : pct >= 60
                    ? "Solid base — revisit the lectures of your missed questions, then retake."
                    : "Work through the lectures of your missed questions, then retake the exam."}
              </p>
              <div className="row flex" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={restart}><Icon name="refresh" size={15} /> Retake (new order)</button>
                <Link to="/cheatsheet" className="btn btn-ghost"><Icon name="zap" size={15} /> Cheat sheet</Link>
                <Link to="/dashboard" className="btn btn-ghost"><Icon name="dashboard" size={15} /> Dashboard</Link>
              </div>
            </div>
            {questions.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <div className="quiz-card exam-q" key={`r-${i}`}>
                  <div className="q-head">
                    <span className="q-tag" style={{ background: ok ? "var(--good-soft)" : "var(--bad-soft)", color: ok ? "var(--good)" : "var(--bad)" }}>
                      {ok ? "Correct" : "Missed"} · Lecture {q.lecture}
                    </span>
                    <span className="q-text small">{q.lectureTitle}</span>
                  </div>
                  <div className="q-text mb-1">{q.q}</div>
                  <div className="quiz-opts">
                    {q.options.map((opt, oi) => {
                      let cls = "quiz-opt";
                      if (oi === q.answer) cls += " correct";
                      else if (oi === answers[i]) cls += " wrong";
                      return (
                        <div key={oi} className={cls} style={{ cursor: "default" }}>
                          <span className="opt-letter">{"ABCD"[oi]}</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="quiz-why"><b>Why: </b>{q.why}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
