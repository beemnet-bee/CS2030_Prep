import Icon from "./Icons.jsx";
import { highlightCode } from "../lib/highlight.js";

// Pretty, readable table used across notes and query results.
export function DataTable({ caption, head, rows, compact, highlight, nullText = "NULL" }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap compact">
        {caption && (
          <div className="table-caption">
            <Icon name="table" size={14} /> {caption}
          </div>
        )}
        <div className="small muted" style={{ padding: "14px 16px" }}>
          No rows — an empty result is still a correct answer.
        </div>
      </div>
    );
  }
  const cols = head || Object.keys(rows[0]);
  return (
    <div className={`table-wrap${compact ? " compact" : ""}`}>
      {caption && (
        <div className="table-caption">
          <Icon name="table" size={14} /> {caption}
        </div>
      )}
      <table className="data">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} className={isMonoCol(c) ? "mono" : ""}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const cells = Array.isArray(r) ? r : cols.map((c) => r[c]);
            return (
              <tr key={ri}>
                {cells.map((v, ci) => (
                  <td
                    key={ci}
                    className={`${isMonoCol(cols[ci]) ? "mono" : ""} ${
                      highlight && highlight(ri, ci, v) ? "hl" : ""
                    }`}
                  >
                    {v === null || v === undefined ? (
                      <span className="null-chip">{nullText}</span>
                    ) : (
                      String(v)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function isMonoCol(name) {
  if (typeof name !== "string") return false;
  return /^(ID|id|salary|budget|year|balance|credits|sec_id|course_id|semester|prereq_id|parent_id|old_salary|new_salary|total|type|pk|cid)$/.test(name);
}

export function Callout({ tone = "tip", title, children }) {
  const icon = tone === "warn" ? "alert" : tone === "exam" ? "target" : "lightbulb";
  const label =
    tone === "warn" ? "Watch out" : tone === "exam" ? "Exam pointer" : "Good to know";
  return (
    <div className={`callout ${tone}`}>
      <span className="c-icon">
        <Icon name={icon} size={17} />
      </span>
      <div>
        <b>{title || label}</b>
        {children}
      </div>
    </div>
  );
}

// Static code block for code that is read, not run (e.g. PostgreSQL-only syntax).
// Color-coded with the same lime-family theme as the live editors.
export function CodeBlock({ lang, code }) {
  return (
    <div className="codeblock">
      <div className="code-lang">
        <Icon name="code" size={12} /> {lang}
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }} />
      </pre>
    </div>
  );
}

export function ProgressBar({ percent, thin, label, right, ticks, pctClass }) {
  return (
    <div>
      <div className={`bar${thin ? " thin" : ""}${ticks ? " ticks" : ""}`}>
        <div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
      {(label || right) && (
        <div className="bar-label">
          <span>{label}</span>
          {right && <span className={pctClass}>{right}</span>}
        </div>
      )}
    </div>
  );
}
