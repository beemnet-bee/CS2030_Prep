import { useState } from "react";
import Icon from "../components/Icons.jsx";
import CodeRunner from "../components/CodeRunner.jsx";
import { resetDatabase } from "../lib/sqlEngine.js";

const SQL_START = `-- Free SQL practice on the university database.
-- Tables: department, instructor, course, prereq, section, teaches
--         + lab_account, lab_parent, lab_child, lab_faculty, lab_offer...
-- Try the lectures' questions, or invent your own:

SELECT i.name, d.building, i.salary
FROM instructor AS i
JOIN department AS d ON i.dept_name = d.dept_name
WHERE i.salary >= 85000
ORDER BY i.salary DESC;`;

const PY_START = `# Free Python practice with the university database preloaded.
# Use conn (sqlite3 connection), run(sql), and reset_lab().
# pandas also works: pd.read_sql_query(sql, conn)

cur = conn.execute("""
    SELECT dept_name, ROUND(AVG(salary), 2) AS avg_salary
    FROM instructor GROUP BY dept_name
""")
for name, avg in cur.fetchall():
    print(f"{name:12} {avg}")`;

export default function Playground() {
  const [lang, setLang] = useState("sql");
  const [resetNote, setResetNote] = useState("");

  async function resetDb() {
    setResetNote("resetting…");
    await resetDatabase();
    setResetNote("database restored");
    setTimeout(() => setResetNote(""), 2500);
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="flex justify-between flex-wrap" style={{ gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>Compiler</h1>
            <p className="muted">
              A free playground: write and run real SQL and Python against the lecture's
              university database. Nothing here affects your progress.
            </p>
          </div>
          <div className="lang-tabs" role="tablist" aria-label="Choose language">
            <button
              role="tab"
              aria-selected={lang === "sql"}
              className={`lang-tab${lang === "sql" ? " active" : ""}`}
              onClick={() => setLang("sql")}
            >
              SQL
            </button>
            <button
              role="tab"
              aria-selected={lang === "python"}
              className={`lang-tab${lang === "python" ? " active" : ""}`}
              onClick={() => setLang("python")}
            >
              Python
            </button>
          </div>
        </div>

        <div className="playground-note mt-2 mb-2">
          <span className="p-icon">
            <Icon name={lang === "sql" ? "database" : "code"} size={18} />
          </span>
          <div>
            {lang === "sql" ? (
              <>
                <b>SQLite engine, pre-seeded.</b> Read freely from the university tables;
                write only to the <code>lab_*</code> tables. Multiple statements run in order —
                press Run (or Ctrl + Enter). Use <b>Reset DB</b> in the editor toolbar to restore
                the original data.
              </>
            ) : (
              <>
                <b>Python 3 with sqlite3 preloaded.</b> The university database is in{" "}
                <code>conn</code>; helpers: <code>run(sql)</code> prints a result table,{" "}
                <code>reset_lab()</code> restores practice tables, and pandas works too
                (first run downloads the engine — needs internet once).
              </>
            )}
          </div>
        </div>

        {lang === "sql" ? (
          <CodeRunner
            key="play-sql"
            title="SQL playground"
            lang="sql"
            initialCode={SQL_START}
            minHeight={320}
          />
        ) : (
          <CodeRunner
            key="play-py"
            title="Python playground"
            lang="python"
            initialCode={PY_START}
            minHeight={320}
          />
        )}

        <div className="flex flex-wrap justify-between" style={{ gap: 10 }}>
          <div className="snippet-row">
            {lang === "sql" ? (
              <>
                <span className="chip accent">Idea: LEFT JOIN + IS NULL → who never teaches?</span>
                <span className="chip">Idea: GROUP BY dept_name with HAVING</span>
                <span className="chip">Idea: WITH RECURSIVE on lab_prereq</span>
              </>
            ) : (
              <>
                <span className="chip accent">Idea: fetchall() vs fetchone()</span>
                <span className="chip">Idea: bind a ? parameter from a variable</span>
                <span className="chip">Idea: pd.read_sql_query with params</span>
              </>
            )}
          </div>
          {lang === "sql" && (
            <div className="flex">
              {resetNote && <span className="muted small">{resetNote}</span>}
              <button className="btn btn-ghost btn-sm" onClick={resetDb}>
                <Icon name="refresh" size={14} /> Reset the whole database
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
