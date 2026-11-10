// Lecture 5 — Subqueries, Set Operations, and Views
export const lecture05 = {
  num: 5,
  slug: "subqueries-setops-views",
  title: "Subqueries, Set Operations, and Views",
  tagline: "Combine results, test membership safely, and reuse queries as views.",
  minutes: 30,
  icon: "layers",
  objectives: [
    "Combine results with set operations",
    "Use membership tests safely",
    "Explain correlated existence tests",
    "Build queries from smaller results",
    "Choose and interpret views",
  ],
  parts: [
    {
      id: "setops",
      title: "Set operations",
      blurb: "Combine compatible query results.",
      sections: [
        {
          kind: "note",
          title: "Two teaching lists to combine",
          icon: "layers",
          paragraphs: [
            "Fall 2017 has 3 teaching records: Tinsae (twice), Biniam. Spring 2018 has 7: Tinsae, Yohannes, Kidist, Eden, Getachew (twice), Almaz. The set operations combine these two lists — each list is itself a query result.",
          ],
          table: {
            caption: "The inputs",
            head: ["Fall 2017 (ID)", "Spring 2018 (ID)"],
            rows: [
              ["10101 Tinsae", "10101 Tinsae"],
              ["10101 Tinsae", "12121 Yohannes"],
              ["22222 Biniam", "15151 Kidist"],
              ["", "32343 Eden"],
              ["", "45565 Getachew"],
              ["", "45565 Getachew"],
              ["", "83821 Almaz"],
            ],
          },
        },
        {
          kind: "example",
          title: "UNION, INTERSECT, EXCEPT on IDs",
          lang: "sql",
          expected: "UNION: 7 IDs · INTERSECT: only 10101 · EXCEPT: only 22222",
          code: `SELECT ID FROM teaches WHERE semester = 'Fall' AND year = 2017
UNION
SELECT ID FROM teaches WHERE semester = 'Spring' AND year = 2018
ORDER BY ID;`,
        },
        {
          kind: "note",
          title: "What each operation gives",
          icon: "list",
          paragraphs: [
            "UNION gives IDs in either list (10101, 12121, 15151, 22222, 32343, 45565, 83821). INTERSECT gives IDs in both (10101 only — Tinsae teaches in both terms). EXCEPT gives IDs in the first but not the second (22222 Biniam).",
            "Duplicates are removed unless ALL is used. Result order is only guaranteed by a final ORDER BY.",
          ],
        },
        {
          kind: "note",
          title: "ALL preserves duplicate counts",
          icon: "info",
          paragraphs: [
            "Counts are per identical output row, not per entire table. Tinsae: 2 in Fall, 1 in Spring → UNION ALL 3, INTERSECT ALL 1, EXCEPT ALL 1. Biniam: 1, 0 → 1, 0, 1. Getachew: 0, 2 → 2, 0, 0.",
            "SQLite supports UNION ALL only among the ALL forms; PostgreSQL supports all three. (In this app's SQLite runner, UNION, UNION ALL and EXCEPT work; INTERSECT needs two queries and your own comparison.)",
          ],
          table: {
            caption: "Duplicate arithmetic",
            head: ["ID", "Fall", "Spring", "UNION ALL", "INTERSECT ALL", "EXCEPT ALL"],
            rows: [
              ["10101", "2", "1", "3", "1", "1"],
              ["22222", "1", "0", "1", "0", "1"],
              ["45565", "0", "2", "2", "0", "0"],
            ],
          },
        },
        {
          kind: "note",
          title: "Compatible results",
          icon: "shield",
          paragraphs: [
            "Set operations need: the same number of columns in both inputs, matching column meanings, duplicates removed unless ALL, and a final ORDER BY for a promised order.",
          ],
        },
        {
          kind: "quiz",
          question: "UNION vs UNION ALL on the two teaching lists gives which counts?",
          options: ["7 and 7", "7 and 10", "6 and 10", "5 and 10"],
          answer: 1,
          why: "UNION removes duplicates: 7 distinct IDs. UNION ALL keeps every occurrence: 3 + 7 = 10 rows.",
        },
      ],
    },
    {
      id: "membership",
      title: "Membership and missing values",
      blurb: "Test whether a value belongs to a query result — carefully.",
      sections: [
        {
          kind: "example",
          title: "IN a subquery: who taught in Fall 2017?",
          lang: "sql",
          expected: "Tinsae and Biniam — the instructors behind the Fall 2017 records",
          code: `SELECT name FROM instructor
WHERE ID IN (
    SELECT ID FROM teaches
    WHERE semester = 'Fall' AND year = 2017
)
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "IN and NOT IN",
          icon: "target",
          paragraphs: [
            "ID IN (subquery) tests membership in the returned set. ID NOT IN (SELECT ID FROM teaches) finds instructors with no teaching record: Amare, Fikru, Mintesinot.",
            "NOT IN is safe only when the subquery can never return NULL. That is the trap below.",
          ],
        },
        {
          kind: "note",
          title: "The NOT IN NULL trap",
          icon: "alert",
          paragraphs: [
            "lab_offer contains 10101 and NULL. For '22222': x IN (list) → is 22222 equal to 10101? No. Equal to NULL? Unknown → the whole IN is UNKNOWN, so NOT IN is also UNKNOWN → no rows survive.",
            "One NULL in the list poisons the whole NOT IN test. Use NOT EXISTS, or filter the subquery with WHERE ID IS NOT NULL.",
          ],
        },
        {
          kind: "example",
          title: "See the trap in the runner",
          lang: "sql",
          expected: "in_list = NULL and not_in_list = NULL — neither test can say TRUE",
          code: `SELECT
  '22222' IN (SELECT ID FROM lab_offer) AS in_list,
  '22222' NOT IN (SELECT ID FROM lab_offer) AS not_in_list;

-- lab_offer holds 10101 and NULL. What does this return?
SELECT name FROM instructor
WHERE ID NOT IN (SELECT ID FROM lab_offer);`,
        },
        {
          kind: "quiz",
          question: "'22222' NOT IN ('10101', NULL) evaluates to…",
          options: ["TRUE", "FALSE", "UNKNOWN", "An error"],
          answer: 2,
          why: "22222 ≠ 10101 is fine, but 22222 compared to NULL is UNKNOWN, so the NOT IN cannot be TRUE — it stays UNKNOWN and the row is dropped by WHERE.",
        },
        {
          kind: "quiz",
          question: "lab_offer holds 10101 and NULL. SELECT name FROM instructor WHERE ID NOT IN (SELECT ID FROM lab_offer) returns…",
          options: ["Every instructor except Tinsae", "Every instructor", "No rows", "An error"],
          answer: 2,
          why: "For Tinsae the test is FALSE (10101 matches). For everyone else it is UNKNOWN (the NULL entry might match). WHERE keeps only TRUE — so no rows survive.",
        },
        {
          kind: "quiz",
          question: "'10101' IN ('10101', NULL) evaluates to…",
          options: ["TRUE", "FALSE", "UNKNOWN", "An error"],
          answer: 0,
          why: "A known match decides it: 10101 equals the first entry, so the whole IN test is TRUE regardless of the NULL.",
        },
      ],
    },
    {
      id: "exists",
      title: "Correlated subqueries",
      blurb: "Ask whether a matching row exists for each candidate.",
      sections: [
        {
          kind: "example",
          title: "EXISTS: Physics instructors who teach",
          lang: "sql",
          expected: "Biniam — Fikru has no teaches row",
          code: `SELECT i.name FROM instructor AS i
WHERE i.dept_name = 'Physics'
  AND EXISTS (
      SELECT 1 FROM teaches AS t
      WHERE t.ID = i.ID
  )
ORDER BY i.name;`,
        },
        {
          kind: "note",
          title: "The correlation condition is the whole point",
          icon: "branch",
          paragraphs: [
            "The inner WHERE t.ID = i.ID links the subquery to the current outer row — it asks 'does THIS instructor teach?' and runs once per candidate. Biniam → PHY-101 exists → TRUE. Fikru → nothing → FALSE.",
            "Without the correlation condition the subquery asks 'does anyone teach?' — always TRUE, so all 12 instructors pass.",
          ],
          table: {
            caption: "Existence trace",
            head: ["Outer name", "Outer ID", "Matching course", "EXISTS"],
            rows: [
              ["Biniam", "22222", "PHY-101", "TRUE"],
              ["Fikru", "33456", "none", "FALSE"],
            ],
          },
        },
        {
          kind: "note",
          title: "NOT EXISTS finds the missing matches",
          icon: "search",
          paragraphs: [
            "Flip the test: WHERE NOT EXISTS (SELECT 1 FROM teaches WHERE t.ID = i.ID) returns Amare, Fikru, Mintesinot — instructors with no teaching record.",
            "NOT EXISTS is the NULL-safe way to express exclusion: an empty subquery result simply means TRUE, whatever NULLs exist in the data.",
          ],
        },
        {
          kind: "example",
          title: "Relational division: who taught ALL Fall-2017 courses?",
          lang: "sql",
          expected: "No rows — nobody taught all three required courses (CS-101, CS-347, PHY-101)",
          code: `SELECT i.name FROM instructor AS i
WHERE NOT EXISTS (
  SELECT course_id FROM section
  WHERE semester = 'Fall' AND year = 2017
  EXCEPT
  SELECT t.course_id FROM teaches AS t
  WHERE t.ID = i.ID
    AND t.semester = 'Fall' AND t.year = 2017
)
ORDER BY i.name;`,
        },
        {
          kind: "note",
          title: "Read the division pattern",
          icon: "target",
          paragraphs: [
            "The inner EXCEPT lists required courses that the instructor did NOT teach. If that set is empty, the instructor taught everything — so the outer NOT EXISTS keeps them. This 'NOT EXISTS (required EXCEPT provided)' shape is the standard answer to every 'find X that has all Y' question.",
            "In our data, no instructor taught all three Fall-2017 courses, so the honest answer is no rows.",
          ],
        },
        {
          kind: "quiz",
          question: "A correlated subquery with no correlation condition does what?",
          options: [
            "Tests each instructor individually",
            "Returns the same answer for every outer row",
            "Is illegal in SQL",
            "Runs faster",
          ],
          answer: 1,
          why: "Without the link (t.ID = i.ID), the inner query is the same for all rows — 'does anyone teach?' — so every instructor passes. The correlation condition is what makes the test per-row.",
        },
      ],
    },
    {
      id: "building",
      title: "Query building blocks",
      blurb: "A comparison, a single value, or a named result.",
      sections: [
        {
          kind: "note",
          title: "SOME and ALL",
          icon: "target",
          paragraphs: [
            "salary > ALL (Finance salaries) means greater than every one of them; salary > SOME means greater than at least one. SOME and ANY are synonyms. Against the Finance salaries {80000, 90000}: Almaz 92000 passes both, Fikru 87000 passes SOME but not ALL, Mintesinot 80000 passes neither.",
            "Empty subquery: > SOME is FALSE (no value to beat) but > ALL is TRUE (vacuously). NULL in the list: comparisons become UNKNOWN as usual. This form is standard SQL; PostgreSQL supports it (SQLite does not).",
          ],
          table: {
            caption: "Comparing 87000 with the > operator",
            head: ["Comparison of 87000 against", "SOME", "ALL"],
            rows: [
              ["80000 and 90000", "TRUE", "FALSE"],
              ["an empty result", "FALSE", "TRUE"],
              ["80000 and NULL", "TRUE", "UNKNOWN"],
              ["90000 and NULL", "UNKNOWN", "FALSE"],
            ],
          },
        },
        {
          kind: "note",
          title: "Scalar subquery: one value",
          icon: "chart",
          paragraphs: [
            "A scalar subquery returns one column, one row, and can be used anywhere a value is allowed: WHERE salary > (SELECT AVG(salary) FROM instructor WHERE dept_name = 'Physics') — the Physics average is 91000, so Biniam 95000 qualifies.",
            "One column, no rows → NULL. Several rows → an error in PostgreSQL, first row in SQLite (do not rely on it). Safe design: aggregate or a unique-key condition.",
          ],
        },
        {
          kind: "example",
          title: "Earn more than your department's average",
          lang: "sql",
          expected: "Almaz, Amare, Biniam, Yohannes — each above their own department's average",
          code: `SELECT i.name FROM instructor AS i
WHERE i.salary > (
  SELECT AVG(j.salary) FROM instructor AS j
  WHERE j.dept_name = i.dept_name
)
ORDER BY i.name;`,
        },
        {
          kind: "note",
          title: "A subquery in FROM, or a named CTE",
          icon: "layers",
          paragraphs: [
            "A derived table in FROM: SELECT dept_name, avg_salary FROM (SELECT dept_name, AVG(salary) AS avg_salary FROM instructor GROUP BY dept_name) AS dept_avg WHERE avg_salary >= 85000 → Finance 85000.0, Physics 91000.0.",
            "WITH (a common table expression) names the same intermediate result more readably: WITH dept_avg AS (…) SELECT … FROM dept_avg … Both compute once, then the outer query filters.",
          ],
        },
        {
          kind: "example",
          title: "WITH: a named intermediate result",
          lang: "sql",
          expected: "Finance 85000.0 and Physics 91000.0",
          code: `WITH dept_avg AS (
  SELECT dept_name, AVG(salary) AS avg_salary
  FROM instructor GROUP BY dept_name
)
SELECT dept_name, avg_salary FROM dept_avg
WHERE avg_salary >= 85000
ORDER BY dept_name;`,
        },
        {
          kind: "note",
          title: "Choosing a subquery form",
          icon: "list",
          paragraphs: [
            "Membership in a result → IN. At least one matching row → EXISTS. One value for a comparison → scalar subquery. A table for further processing → FROM subquery or WITH.",
          ],
          table: {
            caption: "Subquery forms",
            head: ["Need", "Suitable form"],
            rows: [
              ["Membership in a result", "IN"],
              ["At least one matching row", "EXISTS"],
              ["One value for a comparison", "Scalar subquery"],
              ["A table for further processing", "FROM subquery or WITH"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Salaries greater than the Physics average — which form fits best?",
          options: ["IN", "EXISTS", "Scalar AVG subquery", "NOT EXISTS"],
          answer: 2,
          why: "The comparison needs one value (the average), so a scalar subquery is the right tool: WHERE salary > (SELECT AVG(salary) …).",
        },
      ],
    },
    {
      id: "views",
      title: "Views",
      blurb: "Give a reusable query a database name.",
      sections: [
        {
          kind: "note",
          title: "A view is a saved query definition",
          icon: "fileText",
          paragraphs: [
            "CREATE VIEW faculty_directory AS SELECT ID, name, dept_name FROM instructor — no copied rows, no copied salary column; just a named definition reused in later queries.",
            "A view alone is not an access policy: users still need rights on the view, and base-table rights are separate (Lecture 6 makes this precise).",
          ],
        },
        {
          kind: "example",
          title: "Create and query a view",
          lang: "sql",
          expected: "Biniam, Fikru — through the view, Physics only",
          code: `CREATE VIEW lab_directory AS
SELECT name, dept_name FROM instructor;

SELECT name FROM lab_directory
WHERE dept_name = 'Physics'
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "Views can layer on views",
          icon: "layers",
          paragraphs: [
            "instructor stores the full rows; faculty_directory reads instructor and hides salary; physics_directory could read faculty_directory and keep Physics only. Each layer is just a stored definition.",
          ],
          table: {
            caption: "View dependencies",
            head: ["Layer", "Reads from", "Purpose"],
            rows: [
              ["instructor", "stored rows", "full instructor records"],
              ["faculty_directory", "instructor", "names and departments"],
              ["physics_directory", "faculty_directory", "Physics entries only"],
            ],
          },
        },
        {
          kind: "note",
          title: "Ordinary vs materialized views",
          icon: "box",
          paragraphs: [
            "An ordinary view stores only the query definition and computes results when queried — data seen is always the current transaction's view. A materialized view stores the definition AND the result, refreshed explicitly — faster reads, but storage and refresh work, and data is as fresh as the last refresh.",
            "PostgreSQL example: CREATE MATERIALIZED VIEW salary_totals AS SELECT dept_name, SUM(salary) AS total FROM instructor GROUP BY dept_name; then REFRESH MATERIALIZED VIEW salary_totals. Freshness is a design decision.",
          ],
          table: {
            caption: "View types",
            head: ["Property", "Ordinary view", "Materialized view"],
            rows: [
              ["Stored object", "query definition", "definition and result"],
              ["Data seen", "current transaction's view", "data from last refresh"],
              ["Tradeoff", "compute when queried", "storage and refresh work"],
            ],
          },
        },
        {
          kind: "note",
          title: "Updates through views and WITH CHECK OPTION",
          icon: "shield",
          paragraphs: [
            "One table, ordinary columns: an update may map to one base row. A join of several tables: mapping may be ambiguous. A grouped average: which underlying salaries would change? SQLite views are read-only without INSTEAD OF triggers.",
            "WITH CHECK OPTION keeps rows inside the view's filter: physics_staff is defined WHERE dept_name = 'Physics', so changing a row's dept_name to Music through the view is rejected — new values must satisfy the filter.",
          ],
        },
        {
          kind: "quiz",
          question: "Instructors without teaching records — which form fits best?",
          options: ["IN", "NOT EXISTS", "Scalar subquery", "A view"],
          answer: 1,
          why: "The need is 'no matching row exists'. NOT EXISTS is the NULL-safe form; NOT IN breaks if the subquery returns NULLs.",
        },
      ],
    },
  ],
  summary: [
    "Set operators combine compatible results; ALL preserves repeated rows; SQLite has UNION ALL only among ALL forms.",
    "NULL changes exclusion tests: one NULL in a NOT IN list makes the whole test UNKNOWN — use NOT EXISTS instead.",
    "Correlated subqueries ask a per-row question; the correlation condition is what makes EXISTS meaningful.",
    "Subqueries provide values (scalar), tables (FROM / WITH), or existence tests (EXISTS).",
    "Views save reusable query definitions; materialized views also store results and need refreshes.",
  ],
  examTips: [
    "The NOT IN NULL trap appears almost every year: one NULL in the list → NOT IN is UNKNOWN → no rows. Say it exactly like that.",
    "For 'has all Y' questions, write the NOT EXISTS (required EXCEPT provided) pattern even if the final answer is 'no rows'.",
    "Remember the empty-list quirk: x > ALL (empty) is TRUE; x > SOME (empty) is FALSE.",
    "Views: 'a view alone is not an access policy' — grants on the base table still apply (Lecture 6 links this).",
  ],
  quiz: [
    {
      q: "Which query safely lists instructors with no teaching record, even if teaches had NULL IDs?",
      options: [
        "WHERE ID NOT IN (SELECT ID FROM teaches)",
        "WHERE NOT EXISTS (SELECT 1 FROM teaches t WHERE t.ID = i.ID)",
        "WHERE ID NOT IN (SELECT DISTINCT ID FROM teaches)",
        "WHERE COUNT(teaches) = 0",
      ],
      answer: 1,
      why: "NOT EXISTS is immune to NULLs: an empty inner result simply means TRUE. NOT IN becomes UNKNOWN when the list contains NULL.",
    },
    {
      q: "Fall 2017 courses minus Spring 2018 courses (EXCEPT) gives…",
      options: ["CS-101", "CS-347 and PHY-101", "Five courses", "The empty set"],
      answer: 1,
      why: "Fall 2017 = {CS-101, CS-347, PHY-101}; removing Spring 2018's courses leaves CS-347 and PHY-101. Order matters: Spring − Fall gives 5 courses.",
    },
    {
      q: "A scalar subquery that returns one column and NO rows evaluates to…",
      options: ["0", "NULL", "An error", "The empty string"],
      answer: 1,
      why: "One column, no rows → NULL. One column, several rows → an error in PostgreSQL (SQLite silently takes the first row — never rely on it).",
    },
    {
      q: "What does an ordinary view store?",
      options: [
        "A copy of the result rows",
        "Only the query definition",
        "The definition and a timestamp",
        "An index of the base table",
      ],
      answer: 1,
      why: "An ordinary view stores just the definition; rows are computed at query time. A materialized view additionally stores the result and needs refreshing.",
    },
    {
      q: "WITH dept_avg AS (SELECT dept_name, AVG(salary) AS avg_salary FROM instructor GROUP BY dept_name) — what is dept_avg?",
      options: [
        "A stored table that never changes",
        "A named intermediate result usable in the same statement",
        "A materialized view",
        "A new schema object visible to all users",
      ],
      answer: 1,
      why: "WITH defines a common table expression — a named result for that one statement, computed from the current data each time it runs.",
    },
  ],
};
