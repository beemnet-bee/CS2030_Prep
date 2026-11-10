// Lecture 7 — SQL from Python and Database Routines
export const lecture07 = {
  num: 7,
  slug: "python-routines",
  title: "SQL from Python and Database Routines",
  tagline: "Connections, cursors, safe parameters, metadata, functions, procedures and triggers.",
  minutes: 30,
  accent: "#22c55e",
  icon: "code",
  objectives: [
    "Execute SQL and fetch results from Python",
    "Bind values safely with parameters",
    "Read result and schema metadata",
    "Distinguish functions from procedures",
    "Trace a trigger and its transaction",
  ],
  parts: [
    {
      id: "access",
      title: "Python database access",
      blurb: "Send a statement, then consume its result.",
      sections: [
        {
          kind: "note",
          title: "The database API: connection and cursor",
          icon: "grid",
          paragraphs: [
            "A Connection owns database access and transaction control. A Cursor does statement execution and result retrieval. execute sends SQL with separate parameter values; fetch (or iterate) reads the returned records.",
            "Every example below uses the notebook-style conn already prepared for you: a sqlite3 connection to the university database.",
          ],
          table: {
            caption: "The database API",
            head: ["Object or action", "Role"],
            rows: [
              ["Connection", "database access and transaction control"],
              ["Cursor", "statement execution and result retrieval"],
              ["execute", "send SQL with separate parameter values"],
              ["fetch or iterate", "read the returned records"],
            ],
          },
        },
        {
          kind: "note",
          title: "The connection lifecycle",
          icon: "branch",
          paragraphs: [
            "import sqlite3; sqlite3.connect(':memory:') creates a temporary in-memory database; 'course.db' opens or creates a file. Commit changes before closing, and keep the notebook connection open for later exercises.",
          ],
        },
        {
          kind: "example",
          title: "A query from Python (run it!)",
          lang: "python",
          expected: "Biniam 95000 · Fikru 87000",
          code: `cur = conn.cursor()
cur.execute("""SELECT name, salary
               FROM instructor
               WHERE dept_name = 'Physics'
               ORDER BY name""")
for name, salary in cur.fetchall():
    print(name, salary)`,
        },
        {
          kind: "note",
          title: "Choosing a fetch method",
          icon: "list",
          paragraphs: [
            "fetchone() returns one tuple or None — for a single match or the next row. fetchmany(n) returns up to n remaining rows — for batch processing. fetchall() returns all remaining rows — for small results. Iterating the cursor processes rows in sequence.",
          ],
          table: {
            caption: "Fetch methods",
            head: ["Method", "Returned data", "Useful choice"],
            rows: [
              ["fetchone()", "one tuple, or None", "single match or next row"],
              ["fetchmany(n)", "up to n remaining rows", "batch processing"],
              ["fetchall()", "all remaining rows", "small result"],
              ["for row in cur", "successive records", "process rows in sequence"],
            ],
          },
        },
        {
          kind: "note",
          title: "SQL values become Python values",
          icon: "branch",
          paragraphs: [
            "NULL → None. INTEGER → int. REAL → float. TEXT and BLOB → str and bytes. Knowing the mapping lets you write Python that tests `if value is None` instead of comparing to 0 or ''.",
          ],
          table: {
            caption: "Value mapping",
            head: ["SQLite value", "Python value"],
            rows: [
              ["NULL", "None"],
              ["INTEGER", "int"],
              ["REAL", "float"],
              ["TEXT / BLOB", "str / bytes"],
            ],
          },
        },
        {
          kind: "example",
          title: "Transactions from Python: with conn",
          lang: "python",
          expected: "1 — the with-block commits on success, rolls back on an escaping error",
          code: `reset_lab()
with conn:
    conn.execute("BEGIN")
    cur = conn.execute("""
        UPDATE lab_faculty SET salary = ?
        WHERE ID = ?""", (96000, "22222"))
    if cur.rowcount != 1:
        raise ValueError("Missing ID")
print(cur.rowcount)  # rows changed by the last execute`,
        },
        {
          kind: "note",
          title: "Many rows, one statement template",
          icon: "layers",
          paragraphs: [
            "executemany(sql, changes) runs one statement template against many value pairs: changes = [(96000, '22222'), (88000, '33456')]. One template, two updates, inside one with-block transaction.",
          ],
        },
        {
          kind: "quiz",
          question: "Which fetch method should you use when a query may match at most one row?",
          options: ["fetchall()", "fetchmany(n)", "fetchone()", "executemany()"],
          answer: 2,
          why: "fetchone() returns one tuple or None — the natural shape for a single-match lookup. executemany is for many value sets, not fetching.",
        },
      ],
    },
    {
      id: "params",
      title: "Safe parameters",
      blurb: "Keep SQL instructions separate from input values.",
      sections: [
        {
          kind: "example",
          title: "A parameterized query",
          lang: "python",
          expected: "Biniam 95000 — the ? placeholders receive the tuple ('Physics', 90000)",
          code: `sql = """SELECT name, salary
FROM instructor
WHERE dept_name = ? AND salary > ?
ORDER BY name"""
values = ("Physics", 90000)
for row in conn.execute(sql, values):
    print(*row)`,
        },
        {
          kind: "note",
          title: "Unsafe construction: the injection",
          icon: "alert",
          paragraphs: [
            'User input name = "Biniam\' OR 1=1 --" glued into SQL: WHERE name = \'Biniam\' OR 1=1 --\'. The OR 1=1 makes the condition TRUE for every row, and -- comments out the rest. COUNT(*) returns 12 — every instructor.',
            "The rule: do not build SQL from user input, ever.",
          ],
        },
        {
          kind: "example",
          title: "The same input, bound safely",
          lang: "python",
          expected: "[] — the whole string is matched as a NAME value, so nothing matches",
          code: `sql = "SELECT name FROM instructor WHERE name = ?"
name = "Biniam' OR 1=1 --"
rows = conn.execute(sql, (name,)).fetchall()
print(rows)`,
        },
        {
          kind: "note",
          title: "What binding actually does",
          icon: "shield",
          paragraphs: [
            "The SQL template stays fixed: SELECT name FROM instructor WHERE name = ?. The input travels as one bound value: Biniam' OR 1=1 --. The meaning becomes 'match this complete text as a name' — no instructor has that name, so the result is empty.",
            "Parameter boundaries: a department or salary typed in a form → bind it. One positional value → use the tuple (value,). A selectable sort column is part of the SQL structure, NOT a value → map it to trusted, allowed identifiers. Another driver → check its parameter-marker style.",
          ],
          table: {
            caption: "Value or structure?",
            head: ["Input or choice", "Approach"],
            rows: [
              ["Department or salary input", "bind a parameter value"],
              ["One positional value", "use (value,)"],
              ["Selectable sort column", "map to trusted, allowed identifiers"],
              ["Another database driver", "check its parameter-marker style"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "A department name comes directly from a form. How should Python supply it?",
          options: [
            "Concatenate it into the SQL text",
            "Bind it through a parameter placeholder",
            "Put it in a trigger name",
            "Use it as a column identifier",
          ],
          answer: 1,
          why: "A form value is data, not structure — it must be bound separately from the SQL text. Concatenation is the injection shown above.",
        },
        {
          kind: "quiz",
          question: "The user picks which column to sort by. What is the safe approach?",
          options: [
            "Bind the column name like a value",
            "Concatenate it — columns are safe",
            "Map the choice to trusted, allowed identifiers first",
            "Sort in the trigger",
          ],
          answer: 2,
          why: "A sort column is part of the SQL structure, so a parameter marker cannot replace it. Whitelist: map the user's choice to a fixed set of trusted identifiers before building the SQL.",
        },
      ],
    },
    {
      id: "metadata",
      title: "Metadata",
      blurb: "Inspect the structure around the data.",
      sections: [
        {
          kind: "example",
          title: "Result column names from cursor.description",
          lang: "python",
          expected: "name | pay — the alias pay comes from the query, not the table",
          code: `cur = conn.execute("""SELECT name, salary AS pay
FROM instructor WHERE ID = '22222'""")
labels = [col[0] for col in cur.description]
print(" | ".join(labels))
print(*cur.fetchone())`,
        },
        {
          kind: "note",
          title: "Result metadata vs schema metadata",
          icon: "info",
          paragraphs: [
            "The cursor's description gives the executed result's column labels (including aliases like pay). Schema metadata describes declared structure: which columns a table has, which form its primary key.",
            "What values the query returned is result rows, not metadata at all.",
          ],
          table: {
            caption: "Which source answers which question",
            head: ["Question", "Metadata source"],
            rows: [
              ["What are this result's column labels?", "cursor description"],
              ["What columns were declared in a table?", "schema metadata"],
              ["Which columns form a primary key?", "schema metadata"],
              ["What values did this query return?", "result rows, not metadata"],
            ],
          },
        },
        {
          kind: "example",
          title: "Schema metadata with pragma_table_info",
          lang: "python",
          expected: "ID (TEXT, pk=1), name (TEXT), dept_name (TEXT), salary (NUMERIC)",
          code: `for name, coltype, pk in conn.execute("""
SELECT name, type, pk
FROM pragma_table_info('instructor')
ORDER BY cid"""):
    print(name, coltype, "PK" if pk else "")`,
        },
        {
          kind: "quiz",
          question: "A query selects salary AS pay. Where should Python read the label pay?",
          options: ["The first result row", "conn.commit", "cursor.description", "The table CHECK constraint"],
          answer: 2,
          why: "cursor.description reports the labels of the executed query result — that is where the alias pay lives.",
        },
      ],
    },
    {
      id: "routines",
      title: "Functions and procedures",
      blurb: "Give reusable operations a clear interface.",
      sections: [
        {
          kind: "note",
          title: "Three ways to run logic near the data",
          icon: "layers",
          paragraphs: [
            "A function is used like an SQL expression (compute a value or a result table). A procedure is invoked explicitly with CALL (perform a named operation). A trigger reacts automatically to a specified data event (insert, update, delete).",
          ],
          table: {
            caption: "Mechanisms",
            head: ["Mechanism", "Invocation", "Typical purpose"],
            rows: [
              ["Function", "SQL expression or FROM", "compute a value or result table"],
              ["Procedure", "CALL", "perform a named operation"],
              ["Trigger", "specified data event", "react to an insert, update, or delete"],
            ],
          },
        },
        {
          kind: "note",
          title: "A stored SQL function",
          icon: "fileText",
          paragraphs: [
            "Input: department name. Result: the number of instructors in it — dept_count('Physics') gives 2. This is PostgreSQL syntax; SQLite has no CREATE FUNCTION of this kind (but it does host Python callbacks — next card).",
          ],
          code: {
            lang: "postgresql",
            code: `CREATE FUNCTION dept_count(p_dept TEXT) RETURNS BIGINT LANGUAGE SQL AS $$
  SELECT COUNT(*) FROM instructor WHERE dept_name = p_dept;
$$;
SELECT dept_count('Physics');  -- 2`,
          },
        },
        {
          kind: "note",
          title: "A table-returning function",
          icon: "table",
          paragraphs: [
            "RETURNS SETOF instructor makes the function usable in FROM: SELECT name FROM faculty_in('Physics') ORDER BY name gives Biniam, Fikru. A function can return a whole relation.",
          ],
          code: {
            lang: "postgresql",
            code: `CREATE FUNCTION faculty_in(p_dept TEXT) RETURNS SETOF instructor LANGUAGE SQL AS $$
  SELECT * FROM instructor WHERE dept_name = p_dept;
$$;
SELECT name FROM faculty_in('Physics') ORDER BY name;`,
          },
        },
        {
          kind: "example",
          title: "A Python function registered into SQLite",
          lang: "python",
          expected: "95.0 — the Python function became the SQL function thousands()",
          code: `def thousands(value):
    if value is None:
        return None
    return value / 1000

conn.create_function("thousands", 1, thousands)  # registration belongs to this connection
for row in conn.execute("SELECT thousands(95000) AS amount"):
    print(row[0])`,
        },
        {
          kind: "note",
          title: "Procedures, control, and where logic should live",
          icon: "branch",
          paragraphs: [
            "A stored procedure performs an operation when called: CALL add_salary('22222', 1000) adds 1000 to Biniam's salary. Routines can take IN / OUT / INOUT parameters, use variables and IF, loops (when set-based SQL is insufficient), and error handling that preserves transaction rules.",
            "Choosing the location of logic: application code is flexible but rules may be duplicated; database routines give a shared interface near the data but cost portability and permissions; SQLite Python callbacks reuse a Python calculation but pay per-row callback work; built-in SQL expressions are simple and visible — use them when they already fit.",
          ],
          code: {
            lang: "postgresql",
            code: `CREATE PROCEDURE add_salary(p_id TEXT, p_amount NUMERIC) LANGUAGE SQL AS $$
  UPDATE lab_faculty SET salary = salary + p_amount WHERE ID = p_id;
$$;
CALL add_salary('22222', 1000);`,
          },
        },
        {
          kind: "quiz",
          question: "Which construct performs an operation when explicitly invoked with CALL?",
          options: ["Function", "Procedure", "Trigger", "View"],
          answer: 1,
          why: "A procedure is a named operation invoked explicitly with CALL. Functions appear in expressions; triggers fire on data events, never on demand.",
        },
      ],
    },
    {
      id: "triggers",
      title: "Triggers",
      blurb: "React automatically to a defined data event.",
      sections: [
        {
          kind: "note",
          title: "Event, condition, action",
          icon: "zap",
          paragraphs: [
            "A trigger names three things: the Event (UPDATE OF salary on lab_faculty), an optional Condition (OLD.salary IS NOT NEW.salary), and the Action (insert identifier, old salary, new salary into a log).",
            "Timing: AFTER the row update — AFTER does not mean after COMMIT. OLD is the previous row; NEW is the updated row.",
          ],
          table: {
            caption: "The salary-change trigger",
            head: ["Element", "Value"],
            rows: [
              ["Event", "UPDATE OF salary on lab_faculty"],
              ["Condition", "OLD.salary IS NOT NEW.salary"],
              ["Action", "insert identifier, old salary, and new salary"],
              ["Timing", "AFTER the row update, not after COMMIT"],
            ],
          },
        },
        {
          kind: "example",
          title: "The salary-change trigger (already installed)",
          lang: "python",
          expected: "22222 | 95000 | 96000 — the trigger fired during the UPDATE",
          code: `reset_lab()
conn.execute("UPDATE lab_faculty SET salary = 96000 WHERE ID = '22222'")
conn.commit()
for row in conn.execute("SELECT * FROM lab_salary_log"):
    print(row)

# update again with the same value — WHEN blocks it:
conn.execute("UPDATE lab_faculty SET salary = 96000 WHERE ID = '22222'")
conn.commit()
print("after no-change update:", conn.execute("SELECT COUNT(*) FROM lab_salary_log").fetchone()[0], "rows")`,
        },
        {
          kind: "note",
          title: "Trace it: commit keeps, rollback erases both",
          icon: "history",
          paragraphs: [
            "BEGIN, then UPDATE: both changes are pending — lab_faculty shows Biniam 96000 AND lab_salary_log has one row (22222, 95000, 96000).",
            "ROLLBACK instead: the update AND the trigger's log row are undone together — lab_faculty back to 95000, the log has no rows. The trigger action belongs to the triggering transaction.",
          ],
          table: {
            caption: "Trigger trace",
            head: ["Stage", "lab_faculty (Biniam)", "lab_salary_log"],
            rows: [
              ["After UPDATE (pending)", "96000", "1 row: 22222 · 95000 → 96000"],
              ["After ROLLBACK", "95000", "no rows"],
            ],
          },
        },
        {
          kind: "note",
          title: "Timing and granularity choices",
          icon: "clock",
          paragraphs: [
            "BEFORE or AFTER: relative to the data operation. INSTEAD OF (on views): perform a defined action for the requested change. FOR EACH ROW: one action per qualifying row (SQLite supports this). FOR EACH STATEMENT: one action per statement — not supported by SQLite.",
            "One UPDATE changing two rows fires a FOR EACH ROW trigger twice — two log rows for two changed rows.",
          ],
          table: {
            caption: "Trigger choices",
            head: ["Choice", "Meaning"],
            rows: [
              ["BEFORE / AFTER", "timing relative to the data operation"],
              ["INSTEAD OF on a view", "perform a defined action for the requested change"],
              ["FOR EACH ROW", "one action per qualifying row"],
              ["FOR EACH STATEMENT", "one action per statement; not supported by SQLite"],
            ],
          },
        },
        {
          kind: "note",
          title: "Trigger risks and responses",
          icon: "alert",
          paragraphs: [
            "If the rule already fits a constraint, use the declarative constraint instead. Hidden or cascading effects: keep actions small and trace dependencies. One statement changing many rows: test the full affected set. Failures and rollback: verify all related changes together.",
          ],
        },
        {
          kind: "quiz",
          question: "One UPDATE changes two rows; a FOR EACH ROW trigger records every actual salary change. How many log rows?",
          options: ["Zero", "Two", "One", "One per transaction"],
          answer: 1,
          why: "A row trigger runs once per qualifying row — two changed rows, two log rows. FOR EACH STATEMENT (unsupported in SQLite) would run once per statement.",
        },
        {
          kind: "quiz",
          question: "What happens to the trigger's log rows when the transaction rolls back?",
          options: [
            "They survive — triggers commit separately",
            "They are rolled back with the update",
            "They move to another table",
            "The rollback fails",
          ],
          answer: 1,
          why: "The trigger action is part of the triggering transaction. ROLLBACK undoes the update and its trigger effects together — the log has no rows.",
        },
      ],
    },
  ],
  summary: [
    "Connections and cursors carry queries and results; fetchone/fetchmany/fetchall read them; NULL becomes None.",
    "Parameters keep input values separate from instructions — binding defeats injection; structure (like sort columns) needs a trusted mapping.",
    "Metadata describes result and schema structure: cursor.description for labels, pragma_table_info for columns and keys.",
    "Functions compute in expressions, procedures are invoked with CALL, and logic placement is a design decision.",
    "Triggers run within the triggering operation's transaction — rollback undoes them too; FOR EACH ROW fires per row.",
  ],
  examTips: [
    "Injection question: bound value → 'match this complete text as a name' → no rows. Concatenation → OR 1=1 → all rows.",
    "cursor.description is where aliases like AS pay appear; schema questions use pragma_table_info.",
    "Trigger + rollback: both the row change and the log rows vanish. Trigger + two rows: two log rows.",
    "CALL for procedures — the exam answer is always CALL, never SELECT or TRIGGER.",
  ],
  quiz: [
    {
      q: "In sqlite3, NULL in a column is returned to Python as…",
      options: ["0", "''", "None", "It raises an error"],
      answer: 2,
      why: "NULL maps to None, INTEGER to int, REAL to float, TEXT/BLOB to str/bytes.",
    },
    {
      q: "executemany(sql, [(96000,'22222'), (88000,'33456')]) does what?",
      options: [
        "Fetches two rows",
        "Runs the one statement template once per value pair",
        "Creates two cursors",
        "Commits twice",
      ],
      answer: 1,
      why: "One statement template, many value pairs — each pair is bound and executed in turn.",
    },
    {
      q: "The trigger condition WHEN OLD.salary IS NOT NEW.salary ensures…",
      options: [
        "The trigger fires only when the salary actually changed",
        "The trigger fires on inserts too",
        "The log stores NULLs",
        "The update fails on equal salaries",
      ],
      answer: 0,
      why: "The WHEN clause is the condition: a no-change update (old = new) does not qualify, so no log row is written.",
    },
    {
      q: "A PostgreSQL function declared RETURNS SETOF instructor is used…",
      options: [
        "with CALL",
        "in FROM, like a table",
        "only in triggers",
        "as a DEFAULT",
      ],
      answer: 1,
      why: "A set-returning function produces a relation, used in FROM: SELECT name FROM faculty_in('Physics').",
    },
    {
      q: "Which is the safest way to send one user-supplied value to SQL?",
      options: [
        "String concatenation",
        "conn.execute(sql) with the value already inside",
        "conn.execute(sql, (value,))",
        "A Python f-string",
      ],
      answer: 2,
      why: "Bind it as a parameter: the template stays fixed and the value travels as data — (value,) is the one-element tuple form.",
    },
  ],
};
