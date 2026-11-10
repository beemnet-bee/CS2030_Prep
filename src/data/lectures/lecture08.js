// Lecture 8 — Recursive Queries and Data Analysis
export const lecture08 = {
  num: 8,
  slug: "recursive-queries-analysis",
  title: "Recursive Queries and Data Analysis",
  tagline: "Follow relationships to a fixed point, rank with windows, and summarise like an analyst.",
  minutes: 35,
  icon: "chart",
  objectives: [
    "Trace direct and indirect prerequisites",
    "Choose a ranking rule for ties",
    "Define a window and its frame",
    "Compare pivots, rollups, and cubes",
    "Read a SQL result into Pandas",
  ],
  parts: [
    {
      id: "recursion",
      title: "Recursive queries",
      blurb: "Follow relationships until no new result appears.",
      sections: [
        {
          kind: "note",
          title: "The prerequisite relation",
          icon: "branch",
          paragraphs: [
            "prereq lists direct prerequisites: BIO-301 needs BIO-101, CS-190 needs CS-101, EE-181 needs PHY-101, and so on. But a course's full requirement chain is indirect too: CS-315 needs CS-101, and CS-347 needs CS-315 — so CS-347 ultimately needs CS-101 as well.",
            "Plain joins find one level. A recursive query follows the links until no new result appears — a fixed point.",
          ],
          table: {
            caption: "prereq (direct links)",
            head: ["course_id", "prereq_id"],
            rows: [
              ["BIO-301", "BIO-101"],
              ["BIO-399", "BIO-101"],
              ["CS-190", "CS-101"],
              ["CS-315", "CS-101"],
              ["CS-319", "CS-101"],
              ["CS-347", "CS-101"],
              ["EE-181", "PHY-101"],
            ],
          },
        },
        {
          kind: "note",
          title: "Anatomy of WITH RECURSIVE",
          icon: "layers",
          paragraphs: [
            "Two parts: the anchor (a plain SELECT giving starting rows) and the recursive step (a SELECT that joins the working table r back to the base relation). The engine repeats the step, feeding each round's output back in, until it produces nothing new.",
            "UNION (not UNION ALL) removes duplicates, which is what makes termination possible on cyclic graphs.",
          ],
          code: {
            lang: "sql",
            code: `WITH RECURSIVE r(course, needed) AS (
  SELECT course_id, prereq_id        -- anchor: direct prereqs
  FROM prereq
  UNION
  SELECT r.course, p.prereq_id       -- step: follow one more link
  FROM r JOIN prereq AS p ON r.needed = p.course_id
)
SELECT needed FROM r WHERE course = 'CS-347' ORDER BY needed;`,
          },
        },
        {
          kind: "example",
          title: "Follow the practice graph from CS-347",
          lang: "sql",
          expected: "CS-101, CS-315, CS-319 — direct and indirect prerequisites",
          code: `WITH RECURSIVE needed(id) AS (
  SELECT prereq_id FROM lab_prereq
  WHERE course_id = 'CS-347'
  UNION
  SELECT p.prereq_id
  FROM lab_prereq AS p
  JOIN needed AS n ON p.course_id = n.id
)
SELECT id FROM needed ORDER BY id;`,
        },
        {
          kind: "note",
          title: "Trace it like the lecture",
          icon: "history",
          paragraphs: [
            "Anchor: the direct prereqs of CS-347 → CS-315, CS-319. First expansion: CS-315 needs CS-101 (new); CS-319 needs CS-101 (already discovered). Second expansion: CS-101 needs nothing → no new identifiers. Fixed point: stop with three distinct courses.",
          ],
          table: {
            caption: "Recursion trace",
            head: ["Stage", "New identifiers", "Accumulated identifiers"],
            rows: [
              ["Anchor", "CS-315, CS-319", "CS-315, CS-319"],
              ["Expand CS-315", "CS-101", "CS-101, CS-315, CS-319"],
              ["Expand CS-319", "none (CS-101 already known)", "CS-101, CS-315, CS-319"],
              ["Expand CS-101", "none — fixed point, stop", "CS-101, CS-315, CS-319"],
            ],
          },
        },
        {
          kind: "note",
          title: "Termination, cycles, and cost",
          icon: "target",
          paragraphs: [
            "UNION on identifiers only: remembers discovered nodes and removes repeated visits — that is why a finite graph WITH a cycle still terminates. UNION ALL keeps repeated visits; justify termination separately (a cycle could run forever). Depth or path in the result: a cycle can produce endlessly different rows. An index on the join column (course_id) supports each relationship lookup.",
          ],
          table: {
            caption: "Recursion choices",
            head: ["Choice", "Consequence"],
            rows: [
              ["UNION on identifiers only", "remember discovered nodes; remove repeated visits"],
              ["UNION ALL", "keep repeated visits; justify termination separately"],
              ["Depth or path in the result", "a cycle can produce endlessly different rows"],
              ["Index on course_id", "can support each relationship lookup"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Why can a recursive query with UNION reach a fixed point on a finite graph containing a cycle?",
          options: [
            "Cycles are ignored by SQL",
            "The anchor runs only once",
            "UNION removes already-discovered IDs, so no new rows are produced",
            "ORDER BY removes the cycle",
          ],
          answer: 2,
          why: "UNION keeps the accumulated set duplicate-free: once every reachable ID is discovered, each new expansion adds nothing, and the recursion stops. UNION ALL would keep visiting forever on a cycle.",
        },
      ],
    },
    {
      id: "ranking",
      title: "Ranking",
      blurb: "Choose what a tie means before choosing a function.",
      sections: [
        {
          kind: "example",
          title: "RANK() with a tie",
          lang: "sql",
          expected: "Mintesinot and Hirut share rank 5; Getachew follows at rank 7 — the gap is the point",
          code: `SELECT name, salary,
  RANK() OVER (ORDER BY salary DESC) AS rnk
FROM instructor
WHERE salary >= 75000
ORDER BY salary DESC, ID;`,
        },
        {
          kind: "note",
          title: "Three ranking rules, one table",
          icon: "list",
          paragraphs: [
            "RANK: shared ties, then a gap (1, 2, 2, 4). DENSE_RANK: shared ties, no gap (1, 2, 2, 3). ROW_NUMBER: one unique position per row (1, 2, 3, 4) — but the assignment among tied rows is unstable unless you add a tie breaker.",
          ],
          table: {
            caption: "The tie table — memorise it",
            head: ["Name", "Salary", "RANK", "DENSE_RANK", "ROW_NUMBER"],
            rows: [
              ["Biniam", "95000", "1", "1", "1"],
              ["Almaz", "92000", "2", "2", "2"],
              ["Yohannes", "90000", "3", "3", "3"],
              ["Fikru", "87000", "4", "4", "4"],
              ["Mintesinot", "80000", "5", "5", "5"],
              ["Hirut", "80000", "5", "5", "6"],
              ["Getachew", "75000", "7", "6", "7"],
            ],
          },
        },
        {
          kind: "example",
          title: "Two separate decisions: window order vs display order",
          lang: "sql",
          expected: "dense ignores the tie breaker; pos uses ID to split Mintesinot and Hirut",
          code: `SELECT name,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense,
  ROW_NUMBER() OVER (ORDER BY salary DESC, ID) AS pos
FROM instructor
ORDER BY salary DESC, ID;`,
        },
        {
          kind: "note",
          title: "PARTITION BY: rank within groups",
          icon: "layers",
          paragraphs: [
            "RANK() OVER (PARTITION BY dept_name ORDER BY salary DESC) restarts the ranking inside each department: Comp. Sci. → Almaz 1, Getachew 2, Tinsae 3; Physics → Biniam 1, Fikru 2.",
            "The window order (inside OVER) defines the calculation; the final ORDER BY defines the display order. Two separate decisions.",
          ],
        },
        {
          kind: "example",
          title: "Top earner per department",
          lang: "sql",
          expected: "Almaz and Biniam — rank 1 within their departments",
          code: `WITH ranked AS (
  SELECT name, dept_name,
    RANK() OVER (PARTITION BY dept_name ORDER BY salary DESC) AS rnk
  FROM instructor
  WHERE dept_name IN ('Comp. Sci.', 'Physics')
)
SELECT name FROM ranked WHERE rnk = 1 ORDER BY dept_name;`,
        },
        {
          kind: "quiz",
          question: "Ordered values 95, 80, 80, 75: which function gives 1, 2, 2, 3?",
          options: ["RANK", "DENSE_RANK", "ROW_NUMBER", "COUNT"],
          answer: 1,
          why: "DENSE_RANK shares the tie (2, 2) and continues without a gap (3). RANK would give 1, 2, 2, 4; ROW_NUMBER gives 1, 2, 3, 4.",
        },
        {
          kind: "quiz",
          question: "Which function gives both tied instructors the same rank and leaves a gap afterward?",
          options: ["RANK", "ROW_NUMBER", "DENSE_RANK", "COUNT"],
          answer: 0,
          why: "RANK gives peers the same value and skips the following positions (…, 5, 5, 7). That gap is RANK's signature.",
        },
      ],
    },
    {
      id: "windows",
      title: "Window aggregates",
      blurb: "Calculate across related rows without collapsing them.",
      sections: [
        {
          kind: "note",
          title: "GROUP BY collapses; OVER keeps rows",
          icon: "layers",
          paragraphs: [
            "GROUP BY dept_name turns 3 Comp. Sci. rows into 1 summary row. AVG(salary) OVER (PARTITION BY dept_name) keeps all 3 rows and attaches the department average to each — every instructor stands next to their comparison value.",
            "That is the whole idea of windows: compute across related rows without collapsing them.",
          ],
          table: {
            caption: "Grouping vs windowing",
            head: ["Operation", "Rows for Comp. Sci.", "Meaning of one output row"],
            rows: [
              ["GROUP BY dept_name", "1", "a department summary"],
              ["AVG(salary) OVER (...)", "3", "an instructor with a comparison value"],
            ],
          },
        },
        {
          kind: "example",
          title: "A department average on every row",
          lang: "sql",
          expected: "Each Comp. Sci. instructor with 77333.33 beside them",
          code: `SELECT name, salary,
  ROUND(AVG(salary) OVER (PARTITION BY dept_name), 2) AS avg_pay
FROM instructor
WHERE dept_name = 'Comp. Sci.'
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "The parts of a window",
          icon: "grid",
          paragraphs: [
            "PARTITION BY dept_name: which rows belong together. ORDER BY ID: in which sequence. A frame restricts the rows the aggregate sees: ROWS UNBOUNDED PRECEDING = from the start through the current row; ROWS BETWEEN 1 PRECEDING AND CURRENT ROW = the previous row and current row.",
          ],
          table: {
            caption: "Window clauses",
            head: ["Clause", "Question answered"],
            rows: [
              ["PARTITION BY dept_name", "which rows belong together?"],
              ["ORDER BY ID", "in which sequence?"],
              ["ROWS UNBOUNDED PRECEDING", "from the start through the current row"],
              ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "the previous row and current row"],
            ],
          },
        },
        {
          kind: "example",
          title: "Running total and moving average",
          lang: "sql",
          expected: "Total grows 65000 → 140000 → 232000; moving avg 65000 → 70000 → 83500",
          code: `SELECT name,
  SUM(salary) OVER (ORDER BY ID ROWS UNBOUNDED PRECEDING) AS total,
  ROUND(AVG(salary) OVER (ORDER BY ID ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 0) AS moving_avg
FROM instructor
WHERE dept_name = 'Comp. Sci.'
ORDER BY ID;`,
        },
        {
          kind: "note",
          title: "Ties and the default frame",
          icon: "alert",
          paragraphs: [
            "SUM(salary) OVER (ORDER BY salary) with the default frame treats ORDER BY peers as one frame step: Mintesinot and Hirut (both 80000) both show peer_total 160000 — the frame includes all tied rows, not one row at a time.",
            "Mistakes to avoid: filter to one row before comparing with its group (calculate first, filter in an outer query); expect stable ROW_NUMBER for tied values (add a unique tie breaker); assume an omitted frame means ROWS (state the intended frame explicitly).",
          ],
        },
        {
          kind: "example",
          title: "Tied salaries share one frame",
          lang: "sql",
          expected: "Both 80000-salary instructors show peer_total 160000",
          code: `SELECT name, salary, SUM(salary) OVER (ORDER BY salary) AS peer_total
FROM instructor
WHERE salary = 80000
ORDER BY ID;`,
        },
        {
          kind: "quiz",
          question: "A running total must advance one displayed row at a time even when salaries tie. Which frame makes that explicit?",
          options: ["GROUP BY salary", "DISTINCT salary", "HAVING COUNT(*) > 0", "ROWS UNBOUNDED PRECEDING"],
          answer: 3,
          why: "An explicit ROWS frame advances through the ordered rows one at a time, so ties cannot bundle into one frame step.",
        },
      ],
    },
    {
      id: "olap",
      title: "OLAP summaries",
      blurb: "Online analytical processing at different levels of detail.",
      sections: [
        {
          kind: "note",
          title: "Dimensions and measures",
          icon: "chart",
          paragraphs: [
            "Dimensions are the levels you summarise by (year, semester); measures are the numbers summed or counted (sections). The detail table: 2017 → Fall 3, Spring 3, Summer 1; 2018 → Spring 7, Summer 1.",
            "A pivot turns one dimension's values into columns: years stay as rows, semesters become Fall / Spring / Summer columns.",
          ],
          table: {
            caption: "Detail (dimensions × measure)",
            head: ["year", "semester", "sections"],
            rows: [
              ["2017", "Fall", "3"],
              ["2017", "Spring", "3"],
              ["2017", "Summer", "1"],
              ["2018", "Spring", "7"],
              ["2018", "Summer", "1"],
            ],
          },
        },
        {
          kind: "example",
          title: "Pivot with conditional aggregation",
          lang: "sql",
          expected: "2017 → 3/3/1 and 2018 → 0/7/1",
          code: `SELECT year,
  SUM(CASE WHEN semester = 'Fall'   THEN 1 ELSE 0 END) AS Fall,
  SUM(CASE WHEN semester = 'Spring' THEN 1 ELSE 0 END) AS Spring,
  SUM(CASE WHEN semester = 'Summer' THEN 1 ELSE 0 END) AS Summer
FROM section
GROUP BY year
ORDER BY year;`,
        },
        {
          kind: "note",
          title: "ROLLUP: detail, subtotals, grand total",
          icon: "layers",
          paragraphs: [
            "GROUP BY ROLLUP(year, semester) (PostgreSQL example) produces the detail rows, a year subtotal (semester NULL), and the grand total (both NULL): 2017 rows + 2017/NULL/7 + 2018 rows + 2018/NULL/8 + NULL/NULL/15.",
            "ROLLUP gives n+1 grouping sets for n dimensions. SQLite has no ROLLUP — combine grouped queries with UNION ALL instead.",
          ],
          table: {
            caption: "Rollup result shape",
            head: ["year", "semester", "sections", "meaning"],
            rows: [
              ["2017", "Fall", "3", "detail"],
              ["2017", "Spring", "3", "detail"],
              ["2017", "Summer", "1", "detail"],
              ["2017", "NULL", "7", "year subtotal"],
              ["2018", "Spring", "7", "detail"],
              ["2018", "Summer", "1", "detail"],
              ["2018", "NULL", "8", "year subtotal"],
              ["NULL", "NULL", "15", "grand total"],
            ],
          },
        },
        {
          kind: "note",
          title: "CUBE: all dimension combinations",
          icon: "grid",
          paragraphs: [
            "GROUP BY CUBE(year, semester) adds what ROLLUP leaves out: the semester-only subtotals (Fall 3, Spring 10, Summer 2). CUBE gives 2ⁿ grouping sets — for 2 dimensions: detail (5), year-only (2), semester-only (3), grand total (1) = 11 rows.",
            "GROUPING(year) and GROUPING(semester) mark subtotal rows (1 = aggregated across that dimension) so they can be ordered and labelled.",
          ],
          table: {
            caption: "ROLLUP vs CUBE",
            head: ["Grouping level", "ROLLUP", "CUBE", "Output rows"],
            rows: [
              ["Year and semester (detail)", "Yes", "Yes", "5"],
              ["Year only", "Yes", "Yes", "2"],
              ["Semester only", "No", "Yes", "3"],
              ["Grand total", "Yes", "Yes", "1"],
            ],
          },
        },
        {
          kind: "note",
          title: "Analytical operations",
          icon: "target",
          paragraphs: [
            "Slice: keep one dimension value (year 2018 only). Drill down / roll up: move between year totals and semester detail. Pivot: years as rows, semesters as columns. Cost: ROLLUP gives n+1 grouping sets; CUBE gives 2ⁿ.",
          ],
          table: {
            caption: "Operations and costs",
            head: ["Operation", "Example or cost"],
            rows: [
              ["Slice", "keep year 2018"],
              ["Drill down / roll up", "year total ↔ semester detail"],
              ["Pivot", "years as rows; semesters as columns"],
              ["n dimensions", "ROLLUP: n+1 sets; CUBE: 2ⁿ sets"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "A report needs department and semester detail, department subtotals, and one grand total. Which construct describes those levels directly?",
          options: ["ROW_NUMBER", "ROLLUP", "NATURAL JOIN", "EXCEPT"],
          answer: 1,
          why: "ROLLUP produces detail groups followed by hierarchical subtotals and a grand total — exactly the requested levels (semester detail → department subtotal → grand total).",
        },
      ],
    },
    {
      id: "pandas",
    title: "SQL and Pandas",
      blurb: "Move a useful result into Python for further analysis.",
      sections: [
        {
          kind: "note",
          title: "The small analysis workflow",
          icon: "branch",
          paragraphs: [
            "SQL query: filter, join and summarise the relevant records. read_sql_query: load the result into a DataFrame. Pandas: inspect, calculate, reshape or plot. Then check size, data types and missing values — memory and meaning.",
          ],
          table: {
            caption: "Workflow responsibilities",
            head: ["Stage", "Responsibility"],
            rows: [
              ["SQL query", "filter, join, and summarize relevant records"],
              ["read_sql_query", "load the query result into a DataFrame"],
              ["Pandas", "inspect, calculate, reshape, or plot the result"],
              ["Memory and meaning", "check size, data types, and missing values"],
            ],
          },
        },
        {
          kind: "example",
          title: "SQL result into a Pandas DataFrame",
          lang: "python",
          expected: "2017 → 7 sections, 2018 → 8 sections",
          code: `import pandas as pd

sql = """SELECT year, COUNT(*) AS sections
FROM section
GROUP BY year ORDER BY year"""
df = pd.read_sql_query(sql, conn)
print(df.to_string(index=False))`,
        },
        {
          kind: "note",
          title: "Bind parameters here too",
          icon: "shield",
          paragraphs: [
            "read_sql_query accepts params: pd.read_sql_query(sql, conn, params=('Physics',)) — bind values; do not concatenate SQL. The same injection rule from Lecture 7 applies inside Pandas.",
            "And remember: editing a DataFrame does not update the database. The DataFrame is a copy; nothing is issued back to the database automatically.",
          ],
        },
        {
          kind: "example",
          title: "Parameters in a Pandas query",
          lang: "python",
          expected: "Biniam 95000, Fikru 87000 — Physics rows only",
          code: `import pandas as pd

sql = """SELECT name, salary
FROM instructor WHERE dept_name = ?
ORDER BY ID"""
df = pd.read_sql_query(sql, conn, params=("Physics",))
print(df.to_string(index=False))`,
        },
        {
          kind: "quiz",
          question: "A DataFrame from read_sql_query has one salary cell edited locally. What does the database do automatically?",
          options: [
            "The matching row is updated",
            "The whole table is replaced",
            "Nothing is updated",
            "The transaction is committed",
          ],
          answer: 2,
          why: "read_sql_query copies data out. Editing the DataFrame never issues a SQL UPDATE — writes require their own SQL or write APIs.",
        },
      ],
    },
  ],
  summary: [
    "Recursion follows direct and indirect relationships: anchor + step, repeated to a fixed point; UNION makes termination possible on cycles.",
    "Ranking rules determine tie behaviour: RANK ties with a gap, DENSE_RANK ties without a gap, ROW_NUMBER is unique.",
    "Windows keep rows while adding calculations: PARTITION BY, window ORDER BY, and an explicit frame when row-by-row behaviour matters.",
    "OLAP changes the level of a summary: pivot rotates, ROLLUP gives n+1 grouping sets, CUBE gives 2ⁿ.",
    "Pandas receives a SQL result as a DataFrame — parameters still bound, edits never write back automatically.",
  ],
  examTips: [
    "Trace a recursive query in a table: anchor row → expansions → fixed point. Show the accumulated set; that is what earns the marks.",
    "Ranking: identify the tie rule from the numbers (gap = RANK, no gap = DENSE_RANK, unique = ROW_NUMBER) before writing anything.",
    "Window question: name all three parts — partition, order, frame — and say what the default frame does with ties.",
    "Pivot/ROLLUP/CUBE: count the output rows (detail 5, year 2, semester 3, total 1) — the numbers are the answer.",
  ],
  quiz: [
    {
      q: "In WITH RECURSIVE, what is the anchor?",
      options: [
        "The index on the base table",
        "The non-recursive starting SELECT that produces the first rows",
        "The JOIN condition",
        "The final ORDER BY",
      ],
      answer: 1,
      why: "The anchor is the plain starting query (e.g. direct prerequisites); the recursive step then extends it until nothing new appears.",
    },
    {
      q: "Which window clause restricts the aggregate to 'the previous row and current row'?",
      options: [
        "PARTITION BY 1 PRECEDING",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
        "ORDER BY 1 PRECEDING",
        "GROUP BY CURRENT ROW",
      ],
      answer: 1,
      why: "That is a frame clause — it bounds the rows the aggregate sees. UNBOUNDED PRECEDING would start from the first row instead.",
    },
    {
      q: "How many grouping sets does CUBE(year, semester) produce?",
      options: ["2", "3", "4", "11"],
      answer: 2,
      why: "CUBE gives 2ⁿ sets: detail, year-only, semester-only, grand total = 4 sets (11 output rows with this data). ROLLUP gives n+1 = 3 sets.",
    },
    {
      q: " Semester-only subtotals (Fall 3, Spring 10, Summer 2) appear with ROLLUP or CUBE?",
      options: ["ROLLUP only", "CUBE only", "Both", "Neither"],
      answer: 1,
      why: "Semester-only totals are what CUBE adds beyond ROLLUP — ROLLUP follows the hierarchy (detail → year → grand total) and skips cross-dimension totals.",
    },
    {
      q: "RANK() OVER (ORDER BY salary DESC) with values 95, 80, 80, 75 gives…",
      options: ["1, 2, 2, 3", "1, 2, 2, 4", "1, 2, 3, 4", "1, 1, 2, 3"],
      answer: 1,
      why: "RANK shares the tie (2, 2) and leaves a gap afterwards (4). DENSE_RANK gives 1,2,2,3; ROW_NUMBER gives 1,2,3,4.",
    },
  ],
};
