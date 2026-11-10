import Icon from "../components/Icons.jsx";
import { DataTable } from "../components/ui.jsx";
import { cheatSections } from "../data/cheatsheet.js";

export default function CheatSheet() {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 940 }}>
        <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Cheat Sheet</h1>
        <p className="muted mb-3">
          Every must-remember table from Lectures 1–8, in exam order. Skim top to bottom the night
          before — Midterm I covers Lectures 1–8.
        </p>
        <div className="grid grid-2">
          {cheatSections.map((s) => (
            <div className="card" key={s.id} style={s.id === "checklist" ? { gridColumn: "1 / -1" } : undefined}>
              <h3 className="flex mb-2" style={{ fontSize: 17 }}>
                <span style={{ color: "var(--brand)" }}><Icon name={s.icon} size={19} /></span>
                {s.title}
              </h3>
              {s.table && <DataTable head={s.table.head} rows={s.table.rows} compact />}
              {s.bullets && (
                <ul style={{ margin: s.table ? "8px 0 0" : 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 7 }}>
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex small" style={{ alignItems: "flex-start", gap: 8, color: "var(--ink-2)" }}>
                      <span style={{ color: "var(--brand)", marginTop: 2 }}><Icon name="check" size={13} strokeWidth={2.6} /></span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
