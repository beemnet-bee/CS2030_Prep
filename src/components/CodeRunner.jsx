import { useState } from "react";
import Icon from "./Icons.jsx";
import { DataTable } from "./ui.jsx";
import { runSql, resetDatabase } from "../lib/sqlEngine.js";
import { runPython } from "../lib/pythonEngine.js";
import { useProgress } from "../lib/progress.jsx";

// Editable, runnable code editor with live results.
// lang: "sql" (bundled SQLite engine, university DB preloaded)
// lang: "python" (Pyodide, `conn` + `run()` + `reset_lab()` preloaded)
export default function CodeRunner({ title, lang = "sql", initialCode, expected, minHeight }) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState("idle"); // idle | loading | running | done | error
  const [result, setResult] = useState(null); // {tables, message} | {output} | {error}
  const [statusNote, setStatusNote] = useState("");
  const { bumpCodeRuns } = useProgress();

  async function run() {
    setStatus("running");
    setResult(null);
    setStatusNote("");
    try {
      if (lang === "sql") {
        const r = await runSql(code);
        setResult({ kind: "sql", ...r });
        setStatusNote(r.tables.length ? `${r.tables[0].rows.length} row(s) returned` : "done");
      } else {
        setStatus("loading");
        setStatusNote("first run downloads Python — this takes a moment");
        const r = await runPython(code);
        setResult({ kind: "python", output: r.output });
        setStatusNote("done");
      }
      bumpCodeRuns();
      setStatus("done");
    } catch (e) {
      setResult({ kind: "error", error: e.displayMessage || e.message });
      setStatus("error");
      setStatusNote("");
    }
  }

  function reset() {
    setCode(initialCode);
    setResult(null);
    setStatus("idle");
    setStatusNote("");
  }

  async function resetDb() {
    setStatusNote("resetting database…");
    await resetDatabase();
    setStatusNote("database restored to the lecture's original state");
  }

  function onKeyDown(e) {
    // Tab inserts two spaces; Ctrl/Cmd+Enter runs
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const s = el.selectionStart;
      const t = el.selectionEnd;
      const next = code.slice(0, s) + "  " + code.slice(t);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  }

  const busy = status === "running" || status === "loading";

  return (
    <div className="runner">
      <div className="runner-head">
        <span className="lang-chip">{lang === "sql" ? "SQL" : "Python"}</span>
        <span className="runner-title">{title}</span>
        <div className="runner-actions">
          {statusNote && !busy && <span className="runner-status">{statusNote}</span>}
          {busy && (
            <span className="runner-status">
              <span className="spinner" /> {status === "loading" ? "loading engine…" : "running…"}
            </span>
          )}
          {lang === "sql" && (
            <button className="runner-btn reset" onClick={resetDb} title="Restore the whole practice database to the lecture's original state">
              <Icon name="database" size={13} /> Reset DB
            </button>
          )}
          <button className="runner-btn reset" onClick={reset} title="Restore the original code">
            <Icon name="refresh" size={13} /> Reset
          </button>
          <button className="runner-btn run" onClick={run} disabled={busy}>
            <Icon name="play" size={13} /> Run
          </button>
        </div>
      </div>
      <textarea
        className="code-input"
        style={minHeight ? { minHeight } : undefined}
        value={code}
        spellCheck={false}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={`Editable ${lang} code: ${title}`}
      />
      {result && (
        <div className="runner-output">
          <div className="out-label">
            {result.kind === "error"
              ? "Error — read it carefully, then fix and run again"
              : result.kind === "sql" && result.tables.length
                ? "Result"
                : "Output"}
          </div>
          {result.kind === "sql" && result.tables.map((t, i) => (
            <div key={i} style={{ padding: "0 12px" }}>
              <DataTable head={t.columns} rows={t.rows} compact nullText="NULL" />
            </div>
          ))}
          {result.kind === "sql" && result.tables.length === 0 && (
            <pre>
              {result.message}
              {result.changed ? `  (${result.changed} row(s) affected)` : ""}
            </pre>
          )}
          {result.kind === "python" && <pre>{result.output}</pre>}
          {result.kind === "error" && <pre className="err">{result.error}</pre>}
          <div className="hint-line">
            SQL runs on the lecture's university database · Edit the code, then Run again · Ctrl + Enter also runs
          </div>
        </div>
      )}
    </div>
  );
}

// The "expected output" strip shown under many examples.
export function Expected({ children }) {
  return (
    <div className="expected-note">
      <b>Expected result: </b>
      {children}
    </div>
  );
}
