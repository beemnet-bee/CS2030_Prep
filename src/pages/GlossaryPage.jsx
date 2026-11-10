import { useMemo, useState } from "react";
import Icon from "../components/Icons.jsx";
import { glossary } from "../data/glossary.js";

export default function GlossaryPage() {
  const [q, setQ] = useState("");
  const [lectureFilter, setLectureFilter] = useState(0);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return glossary.filter((g) => {
      const matchQ = !needle || g.term.toLowerCase().includes(needle) || g.def.toLowerCase().includes(needle);
      const matchL = !lectureFilter || g.lecture === lectureFilter;
      return matchQ && matchL;
    });
  }, [q, lectureFilter]);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Glossary</h1>
        <p className="muted mb-3">
          {glossary.length} terms from all lectures, in course order. Search or filter by lecture.
        </p>
        <div className="card mb-3">
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            <div className="flex" style={{ flex: 1, minWidth: 220, border: "1px solid var(--line)", borderRadius: 12, padding: "8px 12px", background: "var(--surface-2)" }}>
              <span className="muted"><Icon name="search" size={16} /></span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a term or definition…"
                style={{ border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontFamily: "inherit", fontSize: 15, width: "100%", paddingLeft: 8 }}
              />
            </div>
            <button
              className={`btn btn-sm ${lectureFilter === 0 ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setLectureFilter(0)}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                className={`btn btn-sm ${lectureFilter === n ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setLectureFilter(n)}
              >
                L{n}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-2">
          {filtered.map((g, i) => (
            <div className="card card-hover gloss-term" key={i}>
              <b>{g.term} <span className="chip accent" style={{ marginLeft: 6 }}>Lecture {g.lecture}</span></b>
              <span>{g.def}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card center muted">No terms match — try a shorter search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
