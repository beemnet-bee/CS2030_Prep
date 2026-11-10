import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import Icon from "../components/Icons.jsx";
import { ProgressBar, Callout } from "../components/ui.jsx";
import SectionRenderer from "../components/SectionRenderer.jsx";
import QuizCard from "../components/QuizCard.jsx";
import { lectures, lectureBySlug, course } from "../data/lectures/index.js";
import { useProgress } from "../lib/progress.jsx";

// A lecture page = its authored parts + an auto wrap-up part (summary, tips, scored quiz).
export default function LecturePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const lecture = lectureBySlug(slug);
  const { stats, parts: partsState, togglePart, markAllParts, setQuizScore, setLastVisit, quizzes } = useProgress();

  const wrapUp = useMemo(() => {
    if (!lecture) return null;
    return {
      id: "wrap-up",
      title: "Wrap-up: summary, exam tips, and quiz",
      blurb: "Everything from this lecture in five lines, plus the scored quiz.",
      isWrapUp: true,
    };
  }, [lecture]);

  const allParts = useMemo(() => (lecture ? [...lecture.parts, wrapUp] : []), [lecture, wrapUp]);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);

  // Fresh quiz state when switching between lectures
  useEffect(() => {
    setQuizAnswers({});
    setQuizDone(false);
  }, [slug]);

  useEffect(() => {
    if (!lecture) return;
    const p = parseInt(params.get("part") || "0", 10);
    const idx = Math.min(Math.max(0, p), allParts.length - 1);
    setLastVisit(lecture.num, idx);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, params]);

  if (!lecture) {
    return (
      <div className="page container">
        <div className="card center">
          <h2 className="mb-2">Lecture not found</h2>
          <Link to="/lectures" className="btn btn-primary">Back to all lectures</Link>
        </div>
      </div>
    );
  }

  const partIndex = Math.min(Math.max(0, parseInt(params.get("part") || "0", 10)), allParts.length - 1);
  const part = allParts[partIndex];
  const st = stats.perLecture.find((p) => p.num === lecture.num);
  const isLast = partIndex === allParts.length - 1;
  const nextLecture = lectures[lecture.num]; // num is 1-based; lectures[num] is the next one
  const prevLecture = lectures[lecture.num - 2];

  const partKey = `${lecture.num}:${part.id}`;
  const partDone = !!partsState[partKey];

  function goTo(idx) {
    if (idx < 0) {
      // previous part from part 0 → previous lecture's wrap-up
      if (prevLecture) navigate(`/lectures/${prevLecture.slug}?part=${prevLecture.parts.length}`);
      else navigate("/lectures");
      return;
    }
    if (idx >= allParts.length) {
      if (nextLecture) navigate(`/lectures/${nextLecture.slug}?part=0`);
      else navigate("/exam");
      return;
    }
    setParams({ part: String(idx) });
    window.scrollTo({ top: 0 });
  }

  function answerQuiz(qi, oi, correct) {
    if (quizDone) return;
    setQuizAnswers((a) => ({ ...a, [qi]: oi }));
    if (Object.keys({ ...quizAnswers, [qi]: oi }).length === lecture.quiz.length) {
      // finished — compute score
      const final = { ...quizAnswers, [qi]: oi };
      const score = lecture.quiz.reduce((acc, q, i) => acc + (final[i] === q.answer ? 1 : 0), 0);
      const pct = Math.round((score / lecture.quiz.length) * 100);
      setQuizScore(lecture.num, pct);
      setQuizDone(true);
    }
    void correct;
  }

  function retakeQuiz() {
    setQuizAnswers({});
    setQuizDone(false);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="lecture-head">
          <div className="chip-row">
            <span className="chip accent"><Icon name={lecture.icon} size={13} /> Lecture {lecture.num}</span>
            <span className="chip"><Icon name="clock" size={13} /> ~{lecture.minutes} min</span>
            <span className="chip"><Icon name="layers" size={13} /> {allParts.length} parts</span>
            <span className="chip"><Icon name="terminal" size={13} /> live code</span>
          </div>
          <h1>{lecture.title}</h1>
          <p className="tagline">{lecture.tagline}</p>
        </div>

        <div className="card mb-3">
          <div className="flex justify-between flex-wrap" style={{ marginBottom: 8 }}>
            <b>Your progress through this lecture</b>
            <span className="muted small">{st.done}/{st.total} parts · {st.percent}%</span>
          </div>
          <ProgressBar percent={st.percent} />
          <div className="flex justify-between mt-2 flex-wrap" style={{ gap: 10 }}>
            <span className="muted small">
              {st.percent === 100
                ? "Fully completed — well prepared for this lecture."
                : "Mark each part complete as you finish reading and running the examples."}
            </span>
            <button
              className="btn btn-soft btn-sm"
              onClick={() => markAllParts(lecture.num, allParts.map((p) => p.id), st.percent !== 100)}
            >
              <Icon name={st.percent === 100 ? "refresh" : "checkCircle"} size={14} />
              {st.percent === 100 ? "Unmark all parts" : "Mark all complete"}
            </button>
          </div>
        </div>

        <div className="lecture-layout">
          {/* parts rail */}
          <aside className="parts-rail">
            <div className="rail-card mb-2">
              <div className="rail-title">Parts of lecture {lecture.num}</div>
              {allParts.map((p, i) => {
                const done = !!partsState[`${lecture.num}:${p.id}`];
                return (
                  <button
                    key={p.id}
                    className={`rail-item${i === partIndex ? " active" : ""}${done ? " done" : ""}`}
                    onClick={() => goTo(i)}
                  >
                    <span className="rail-check"><Icon name="check" size={12} strokeWidth={3} /></span>
                    <span className="rail-label">{p.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="rail-card">
              <div className="rail-title">All lectures</div>
              {lectures.map((l) => (
                <Link
                  key={l.num}
                  to={`/lectures/${l.slug}`}
                  className={`rail-item${l.num === lecture.num ? " active" : ""}`}
                  style={{ display: "flex", textDecoration: "none", color: "inherit" }}
                >
                  <span className="lecture-num" style={{ background: l.accent, width: 24, height: 24, fontSize: 12, borderRadius: 8 }}>
                    {l.num}
                  </span>
                  <span className="rail-label">{l.title}</span>
                </Link>
              ))}
            </div>
          </aside>

          {/* main content */}
          <main>
            <div className="part-banner">
              <div>
                <div className="part-kicker">
                  Part {partIndex + 1} of {allParts.length} {part.isWrapUp ? "· wrap-up" : ""}
                </div>
                <h2>{part.title}</h2>
                <div className="blurb">{part.blurb}</div>
              </div>
              <div className="part-count">{partIndex + 1}</div>
            </div>

            {part.isWrapUp ? (
              <>
                <div className="summary-card">
                  <h3><Icon name="sparkles" size={19} /> Lecture {lecture.num} in five lines</h3>
                  <ul>
                    {lecture.summary.map((s, i) => (
                      <li key={i}><span className="li-icon"><Icon name="check" size={14} strokeWidth={2.6} /></span>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="note-card">
                  <h3><Icon name="target" size={19} /> Exam tips from the slides</h3>
                  {lecture.examTips.map((t, i) => (
                    <Callout key={i} tone="exam" title={`Tip ${i + 1}`}>{t}</Callout>
                  ))}
                </div>
                <div className="note-card">
                  <h3><Icon name="flask" size={19} /> Lecture quiz — {lecture.quiz.length} questions</h3>
                  <p className="muted small mb-2">
                    Your answers are scored and saved to the dashboard. You can retake it any time.
                  </p>
                  {lecture.quiz.map((q, qi) => (
                    <ScoredQuiz
                      key={qi}
                      idx={qi}
                      q={q}
                      picked={quizAnswers[qi]}
                      onPick={(oi) => answerQuiz(qi, oi, oi === q.answer)}
                    />
                  ))}
                  {quizDone && (
                    <div className="quiz-why" style={{ marginTop: 14 }}>
                      <b>Quiz submitted. </b>
                      Best score saved: {quizzes[lecture.num] ?? 0}%.
                      <button className="btn btn-soft btn-sm" style={{ marginLeft: 12 }} onClick={retakeQuiz}>
                        <Icon name="refresh" size={13} /> Retake
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              part.sections.map((s, i) => (
                // Key includes the part so runners and quizzes remount (fresh code
                // and fresh quiz state) when the reader moves between parts.
                <SectionRenderer key={`${lecture.slug}-${part.id}-${i}`} section={s} />
              ))
            )}

            {/* part completion + navigation */}
            <div className="card mt-3">
              <div className="flex justify-between flex-wrap" style={{ gap: 12 }}>
                <label className="flex" style={{ cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={partDone}
                    onChange={(e) => togglePart(lecture.num, part.id, e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "var(--good)" }}
                  />
                  <span style={{ fontWeight: 600 }}>
                    {partDone ? "Part completed" : "Mark this part as complete"}
                  </span>
                </label>
                <span className="muted small">
                  {partDone ? "Added to your progress bar" : `${st.done}/${st.total} parts done so far`}
                </span>
              </div>
            </div>

            <div className="part-nav">
              <button className="btn btn-ghost" onClick={() => goTo(partIndex - 1)}>
                <Icon name="arrowLeft" size={16} />
                {partIndex === 0 && !prevLecture ? "All lectures" : "Previous"}
              </button>
              {isLast ? (
                <button className="btn btn-primary" onClick={() => goTo(partIndex + 1)}>
                  {nextLecture ? `Next: Lecture ${nextLecture.num}` : "Finish: take the practice exam"}
                  <Icon name="arrowRight" size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => goTo(partIndex + 1)}>
                  Next: {allParts[partIndex + 1].title.split(":")[0].slice(0, 28)}
                  <Icon name="arrowRight" size={16} />
                </button>
              )}
            </div>

            {isLast && (
              <div className="finish-panel">
                <h3>Lecture {lecture.num} complete — keep the streak going</h3>
                <p>
                  {nextLecture
                    ? `Next up: ${nextLecture.title}. Or test everything so far with the practice exam.`
                    : "That was the final lecture. Midterm I covers exactly these 8 lectures — take the practice exam now."}
                </p>
                <div className="row">
                  {nextLecture && (
                    <Link to={`/lectures/${nextLecture.slug}`} className="btn btn-primary">
                      <Icon name="arrowRight" size={15} /> Start Lecture {nextLecture.num}
                    </Link>
                  )}
                  <Link to="/exam" className="btn btn-ghost"><Icon name="trophy" size={15} /> Practice exam</Link>
                  <Link to="/dashboard" className="btn btn-ghost"><Icon name="dashboard" size={15} /> Dashboard</Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ScoredQuiz({ idx, q, picked, onPick }) {
  const answered = picked !== undefined;
  return (
    <div className="quiz-card">
      <div className="q-head">
        <span className="q-tag">Q{idx + 1}</span>
        <span className="q-text">{q.q}</span>
      </div>
      <div className="quiz-opts">
        {q.options.map((opt, oi) => {
          let cls = "quiz-opt";
          if (answered) {
            if (oi === q.answer) cls += " correct";
            else if (oi === picked) cls += " wrong";
          }
          return (
            <button key={oi} className={cls} onClick={() => onPick(oi)} disabled={answered}>
              <span className="opt-letter">{"ABCD"[oi]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-why">
          <b>{picked === q.answer ? "Correct. " : `Answer: ${"ABCD"[q.answer]}. `}</b>
          {q.why}
        </div>
      )}
    </div>
  );
}
