import { Link } from "react-router-dom";
import Icon from "../components/Icons.jsx";
import { lectures, course } from "../data/lectures/index.js";
import { useProgress } from "../lib/progress.jsx";

export default function Home() {
  const { stats, lastVisit } = useProgress();
  const lastLecture = lastVisit ? lectures.find((l) => l.num === lastVisit.lecture) : null;

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <span className="hero-kicker">
            <Icon name="sparkles" size={15} /> {course.code} · {course.name}
          </span>
          <h1>Master every lecture.<br />Walk into the exam <span className="hl">ready</span>.</h1>
          <p className="lead">
            All 8 lectures of the course turned into an interactive study path — plain-language notes,
            live SQL and Python you can run in the browser, a free compiler playground, quick-check
            questions after every idea, summaries, a cheat sheet, and a practice exam built from the
            lecture questions.
          </p>
          <div className="hero-actions">
            {lastLecture ? (
              <Link
                className="btn btn-light btn-pulse"
                to={`/lectures/${lastLecture.slug}?part=${lastVisit.partIndex}`}
              >
                <Icon name="play" size={15} /> Continue: Lecture {lastLecture.num}
              </Link>
            ) : (
              <Link className="btn btn-light btn-pulse" to="/lectures/intro-to-databases">
                <Icon name="play" size={15} /> Start with Lecture 1
              </Link>
            )}
            <Link className="btn btn-outline" to="/dashboard">
              <Icon name="dashboard" size={15} /> My dashboard
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>8</b><span>full lectures</span></div>
            <div className="hero-stat"><b>{stats.totalParts}</b><span>guided parts</span></div>
            <div className="hero-stat"><b>40+</b><span>live examples &amp; quizzes</span></div>
            <div className="hero-stat"><b>2</b><span>engines: SQL + Python</span></div>
          </div>
        </section>

        <h2 className="section-title">How it works</h2>
        <p className="section-sub">No account, no setup — open a lecture and start learning.</p>
        <div className="grid grid-4 mb-3">
          {[
            { icon: "book", title: "Read simple notes", text: "Every slide turned into short, plain-language explanations with better tables and concrete examples." },
            { icon: "terminal", title: "Run the code live", text: "Every SQL example runs against the lecture's university database. Python examples run in a real Python engine." },
            { icon: "target", title: "Check yourself", text: "Quick checks after each idea and a 5-question quiz per lecture, with the reason behind every answer." },
            { icon: "trophy", title: "Track & cram", text: "Completion bars per part and lecture, a dashboard with your stats, and a cheat sheet for the night before." },
          ].map((f) => (
            <div className="card card-hover" key={f.title}>
              <span style={{ color: "var(--brand)" }}><Icon name={f.icon} size={26} /></span>
              <h3 style={{ margin: "10px 0 6px", fontSize: 16.5 }}>{f.title}</h3>
              <p className="muted small">{f.text}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title">The lectures</h2>
        <p className="section-sub">
          {course.examName} covers {course.examScope} — the exam is on {course.examDate}.
        </p>
        <div className="grid grid-2 mb-3">
          {lectures.map((l) => (
            <Link key={l.num} to={`/lectures/${l.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card card-hover lecture-card">
                <div className="lecture-num" style={{ background: l.accent }}>
                  {l.num}
                </div>
                <div>
                  <h3>{l.title}</h3>
                  <div className="tagline">{l.tagline}</div>
                  <div className="lecture-meta">
                    <span className="meta-item"><Icon name="clock" size={13} /> ~{l.minutes} min</span>
                    <span className="meta-item"><Icon name="layers" size={13} /> {l.parts.length} parts</span>
                    <span className="meta-item"><Icon name="flask" size={13} /> live examples</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-2">
          <Link to="/exam" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
            <span style={{ color: "var(--brand)" }}><Icon name="trophy" size={26} /></span>
            <h3 style={{ margin: "10px 0 6px", fontSize: 17 }}>Practice exam</h3>
            <p className="muted small">
              40 questions drawn from every lecture — including the exact multiple-choice reviews the
              slides used. Instant scoring with explanations.
            </p>
          </Link>
          <Link to="/cheatsheet" className="card card-hover" style={{ textDecoration: "none", color: "inherit" }}>
            <span style={{ color: "var(--brand)" }}><Icon name="zap" size={26} /></span>
            <h3 style={{ margin: "10px 0 6px", fontSize: 17 }}>One-page cheat sheet</h3>
            <p className="muted small">
              Every must-remember table: three-valued logic, constraints, join counts, ACID,
              ranking rules, OLAP costs — plus the exam-day checklist.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
