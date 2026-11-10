import { Link } from "react-router-dom";
import Icon from "../components/Icons.jsx";
import { ProgressBar } from "../components/ui.jsx";
import { lectures } from "../data/lectures/index.js";
import { useProgress } from "../lib/progress.jsx";

export default function Lectures() {
  const { stats, quizzes } = useProgress();
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Lectures</h1>
        <p className="muted mb-3">
          Eight lectures in course order. Each one is split into parts with notes, live code,
          quick checks, a summary and a scored quiz.
        </p>
        <div className="grid grid-2">
          {lectures.map((l) => {
            const st = stats.perLecture.find((p) => p.num === l.num);
            const quiz = quizzes[l.num];
            const complete = st.percent === 100;
            return (
              <Link key={l.num} to={`/lectures/${l.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card card-hover lecture-card" style={{ height: "100%" }}>
                  <div className="lecture-num" style={{ background: l.accent }}>{l.num}</div>
                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between">
                      <h3>{l.title}</h3>
                      {complete && (
                        <span className="chip" style={{ color: "var(--good)", borderColor: "var(--good)" }}>
                          <Icon name="checkCircle" size={13} /> done
                        </span>
                      )}
                    </div>
                    <div className="tagline">{l.tagline}</div>
                    <div className="lecture-meta">
                      <span className="meta-item"><Icon name="clock" size={13} /> ~{l.minutes} min</span>
                      <span className="meta-item"><Icon name="layers" size={13} /> {l.parts.length} parts</span>
                      <span className="meta-item"><Icon name="terminal" size={13} /> SQL + Python</span>
                      {quiz !== undefined && (
                        <span className="meta-item"><Icon name="target" size={13} /> quiz {quiz}%</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <ProgressBar percent={st.percent} thin />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
