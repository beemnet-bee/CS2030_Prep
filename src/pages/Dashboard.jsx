import { Link } from "react-router-dom";
import Icon from "../components/Icons.jsx";
import { ProgressBar } from "../components/ui.jsx";
import { lectures, course } from "../data/lectures/index.js";
import { useProgress } from "../lib/progress.jsx";

export default function Dashboard() {
  const { stats, quizzes, examBest, lastVisit, codeRuns, resetAll } = useProgress();
  const last = lastVisit ? lectures.find((l) => l.num === lastVisit.lecture) : null;

  // days until the exam (course.examDate = 2026-11-11)
  const exam = new Date(course.examDate + "T00:00:00");
  const today = new Date();
  const days = Math.max(0, Math.ceil((exam - today) / 86400000));
  const R = 74;
  const C = 2 * Math.PI * R;
  const dash = C - (stats.overall / 100) * C;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p className="muted mb-3">
          Your study progress at a glance — stored in this browser, no account needed.
        </p>

        <div className="grid grid-2 mb-3">
          <div className="card">
            <div className="donut-wrap">
              <div className="donut">
                <svg width="168" height="168" viewBox="0 0 168 168">
                  <defs>
                    <linearGradient id="donutGrad" x1="0" y1="0" x2="168" y2="168" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="var(--brand)" />
                      <stop offset="1" stopColor="var(--brand-2)" />
                    </linearGradient>
                  </defs>
                  <circle className="donut-track" cx="84" cy="84" r={R} />
                  <circle
                    className="donut-fill"
                    cx="84" cy="84" r={R}
                    strokeDasharray={C}
                    strokeDashoffset={dash}
                  />
                </svg>
                <div className="donut-center">
                  <div>
                    <b>{stats.overall}%</b>
                    <br />
                    <span>{stats.doneParts} / {stats.totalParts} parts</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="stat-tile mb-1">
                  <span className="num">{stats.lecturesComplete}/8</span>
                  <span className="lbl"><Icon name="checkCircle" size={15} /> lectures fully completed</span>
                </div>
                <div className="stat-tile mb-1">
                  <span className="num">{stats.quizAvg === null ? "—" : `${stats.quizAvg}%`}</span>
                  <span className="lbl"><Icon name="target" size={15} /> average lecture quiz score</span>
                </div>
                <div className="stat-tile mb-1">
                  <span className="num">{examBest === null ? "—" : `${examBest}%`}</span>
                  <span className="lbl"><Icon name="trophy" size={15} /> best practice exam</span>
                </div>
                <div className="stat-tile">
                  <span className="num">{codeRuns || 0}</span>
                  <span className="lbl"><Icon name="play" size={15} /> code runs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="exam-countdown">
              <div>
                <div className="big">{days === 0 ? "TODAY" : `${days}`}</div>
                <div className="small" style={{ opacity: 0.85 }}>{days === 0 ? "Exam day — good luck!" : days === 1 ? "day until the exam" : "days until the exam"}</div>
              </div>
              <div className="side">
                <b>{course.examName}</b> · {course.name}
                <div className="small" style={{ opacity: 0.85 }}>
                  {course.examDate} · covers {course.examScope}
                </div>
              </div>
            </div>
            {last ? (
              <Link
                to={`/lectures/${last.slug}?part=${lastVisit.partIndex}`}
                className="btn btn-primary btn-pulse"
                style={{ justifyContent: "center" }}
              >
                <Icon name="play" size={15} /> Continue: Lecture {last.num}, part {lastVisit.partIndex + 1} — {last.parts[Math.min(lastVisit.partIndex, last.parts.length - 1)]?.title}
              </Link>
            ) : (
              <Link to="/lectures" className="btn btn-primary" style={{ justifyContent: "center" }}>
                <Icon name="play" size={15} /> Pick a lecture to begin
              </Link>
            )}
            <div className="flex flex-wrap gap-0" style={{ gap: 10 }}>
              <Link to="/exam" className="btn btn-ghost btn-sm"><Icon name="trophy" size={14} /> Practice exam</Link>
              <Link to="/cheatsheet" className="btn btn-ghost btn-sm"><Icon name="zap" size={14} /> Cheat sheet</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetAll(); }}>
                <Icon name="refresh" size={14} /> Reset progress
              </button>
            </div>
          </div>
        </div>

        <h2 className="section-title">Lecture progress</h2>
        <p className="section-sub">Complete the parts inside each lecture to fill its bar.</p>
        <div className="card">
          {lectures.map((l) => {
            const st = stats.perLecture.find((p) => p.num === l.num);
            const quiz = quizzes[l.num];
            return (
              <div className="lecture-row" key={l.num}>
                <div className="lecture-num" style={{ background: l.accent }}>{l.num}</div>
                <div>
                  <div className="name">
                    <Link to={`/lectures/${l.slug}`} style={{ color: "inherit" }}>{l.title}</Link>
                  </div>
                  <div className="sub">
                    {st.done}/{st.total} parts complete
                    {quiz !== undefined ? ` · quiz best ${quiz}%` : " · quiz not taken"}
                  </div>
                </div>
                <div style={{ width: 180, minWidth: 120 }}>
                  <ProgressBar percent={st.percent} thin />
                  <div className="bar-label"><span>{st.percent}%</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
