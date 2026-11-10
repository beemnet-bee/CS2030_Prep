// Lecture 4 — Joins and Aggregation
export const lecture04 = {
  num: 4,
  slug: "joins-aggregation",
  title: "Joins and Aggregation",
  tagline: "Match related rows, follow complete composite keys, and build trustworthy reports.",
  minutes: 35,
  accent: "#14b8a6",
  icon: "branch",
  objectives: [
    "Write explicit joins using keys and aliases",
    "Join sections using the complete composite key",
    "Keep unmatched rows when reports require them",
    "Summarize groups and filter aggregate results",
    "Detect duplicated facts and incorrect counts",
  ],
  parts: [
    {
      id: "joins",
      title: "Related rows and join conditions",
      blurb: "A condition connects facts that belong together.",
      sections: [
        {
          kind: "note",
          title: "State the row grain before writing the query",
          icon: "target",
          paragraphs: [
            "Before any join, ask: what is one output row? “Who works in each department?” → one instructor. “Who teaches each section?” → one teaching assignment. “Where does each assignment meet?” → an assignment with its room.",
            "The grain decides which relations you need and which join type preserves the population your report requires.",
          ],
          table: {
            caption: "Questions and their grain",
            head: ["Question", "One output row", "Relations needed"],
            rows: [
              ["Who works in each department?", "an instructor", "instructor, department"],
              ["Who teaches each section?", "a teaching assignment", "instructor, teaches"],
              ["Where does each assignment meet?", "an assignment with its room", "instructor, teaches, section"],
              ["How large is each department?", "a department summary", "instructor (aggregated)"],
            ],
          },
        },
        {
          kind: "note",
          title: "Names describe people; keys identify records",
          icon: "key",
          paragraphs: [
            "Physics instructors: Biniam (22222) and Fikru (33456). Matching teaches rows carry IDs 22222 and 45565 and 10101. The join condition instructor.ID = teaches.ID is what matches facts that belong together.",
          ],
        },
        {
          kind: "example",
          title: "An explicit inner join",
          lang: "sql",
          expected: "Biniam | PHY-101 — Fikru appears nowhere (no teaching record)",
          code: `SELECT i.name, t.course_id
FROM instructor AS i
JOIN teaches AS t ON i.ID = t.ID
WHERE i.dept_name = 'Physics'
ORDER BY i.name, t.course_id;`,
        },
        {
          kind: "note",
          title: "Read the query: aliases, ON, WHERE",
          icon: "info",
          paragraphs: [
            "i and t are table aliases — short names for the two sources. ON identifies matching pairs; WHERE restricts the question to Physics; JOIN alone means INNER JOIN.",
            "Conceptual trace: candidate pairs (Biniam,22222) vs assignment IDs — only 22222 matches. Fikru has no match, so she is absent from the result — not deleted from instructor. Repeated visible values can still describe different assignments.",
          ],
          table: {
            caption: "Inner join trace (Physics)",
            head: ["Instructor", "Instructor ID", "Assignment ID", "Match?"],
            rows: [
              ["Biniam", "22222", "22222", "Yes"],
              ["Biniam", "22222", "45565", "No"],
              ["Biniam", "22222", "10101", "No"],
              ["Fikru", "33456", "22222", "No"],
              ["Fikru", "33456", "45565", "No"],
              ["Fikru", "33456", "10101", "No"],
            ],
          },
        },
        {
          kind: "note",
          title: "Join on identity, not on descriptive values",
          icon: "key",
          paragraphs: [
            "To show the building of a Physics instructor's department, join instructor to department ON i.dept_name = d.dept_name — join on department identity, not on the building.",
            "Qualified column names (i.name, d.building) prevent ambiguity when both tables have same-named columns.",
          ],
        },
        {
          kind: "note",
          title: "Row counts are testable predictions",
          icon: "chart",
          paragraphs: [
            "On the full sample: CROSS JOIN gives 180 (12 × 15 candidate pairs). JOIN ON ID equality gives 15 — one matching instructor per assignment. Distinct instructor IDs in those matches: 9 (some instructors teach several sections). instructor JOIN department gives 12 — one existing department per instructor.",
            "A row count is a testable prediction, not a guarantee — predict, run, and explain any difference.",
          ],
          table: {
            caption: "Join counts on the full sample",
            head: ["Operation", "Rows", "Reason"],
            rows: [
              ["instructor CROSS JOIN teaches", "180", "twelve times fifteen candidate pairs"],
              ["instructor JOIN teaches ON ID equality", "15", "one matching instructor per assignment"],
              ["Distinct instructor IDs in those matches", "9", "some instructors teach several sections"],
              ["instructor JOIN department ON dept_name", "12", "one existing department per instructor"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Why does instructor ⋈ teaches (inner join on ID) have 15 rows?",
          options: [
            "Because there are 12 instructors",
            "Because there are 15 recorded assignments, each matching exactly one instructor",
            "Because 15 instructors teach",
            "Because the join removes duplicates",
          ],
          answer: 1,
          why: "Each of the 15 teaches rows matches exactly one instructor row by ID. The result grain is one row per recorded assignment.",
        },
      ],
    },
    {
      id: "composite",
      title: "Composite keys and joins",
      blurb: "A section is identified by more than its course.",
      sections: [
        {
          kind: "note",
          title: "The four-field section key",
          icon: "key",
          paragraphs: [
            "CS-101 runs as section 1 in Fall 2017 AND as section 1 in Spring 2018 — same course, same section number, different term. Section identity is (course_id, sec_id, semester, year).",
            "Course identity is not section identity.",
          ],
          table: {
            caption: "One course, two sections",
            head: ["course_id", "sec_id", "semester", "year", "building", "room_number"],
            rows: [
              ["CS-101", "1", "Fall", "2017", "Packard", "101"],
              ["CS-101", "1", "Spring", "2018", "Packard", "101"],
            ],
          },
        },
        {
          kind: "example",
          title: "A three-table join with the complete key",
          lang: "sql",
          expected: "Getachew's two Spring 2018 sections: CS-101 in Packard 101, CS-319 in Watson 100",
          code: `SELECT i.name, t.course_id, s.building, s.room_number
FROM instructor AS i
JOIN teaches AS t ON i.ID = t.ID
JOIN section AS s
  ON t.course_id = s.course_id
 AND t.sec_id = s.sec_id
 AND t.semester = s.semester
 AND t.year = s.year
WHERE i.ID = '45565'
ORDER BY t.course_id, t.sec_id, t.semester, t.year;`,
        },
        {
          kind: "note",
          title: "The incomplete key produces wrong matches",
          icon: "alert",
          paragraphs: [
            "Matching only (course_id, sec_id) pairs a Spring 2018 assignment with the Fall 2017 CS-101 section — a wrong match that still returns Packard 101. All four key fields are needed.",
            "DISTINCT can conceal a faulty join without repairing it. When auditing a join, include the key columns temporarily and look at them.",
          ],
          table: {
            caption: "Incomplete vs complete matching",
            head: ["Assignment term", "Matched section term", "Room", "Assessment"],
            rows: [
              ["Spring 2018", "Fall 2017", "Packard 101", "Wrong match"],
              ["Spring 2018", "Spring 2018", "Packard 101", "Correct match"],
            ],
          },
        },
        {
          kind: "note",
          title: "ON, USING, and NATURAL JOIN",
          icon: "list",
          paragraphs: [
            "JOIN … ON writes the condition you choose (qualify ambiguous names). JOIN … USING (ID) means equality on the named shared column — names must exist in both relations. NATURAL JOIN matches on every shared column name automatically.",
            "NATURAL JOIN does not read declared foreign keys — it only sees column names, so a schema change (a new shared column) can silently change its result. For teaches and section, USING would need all four section key fields.",
          ],
          table: {
            caption: "Join syntax forms",
            head: ["Form", "Matching rule", "What to watch"],
            rows: [
              ["JOIN ... ON condition", "the condition you write", "qualify ambiguous column names"],
              ["JOIN ... USING (ID)", "equality on the named shared ID", "names must exist in both relations"],
              ["NATURAL JOIN", "equality on every shared name", "schema changes can change the result"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Which fields link teaches to one exact section?",
          options: [
            "course_id",
            "course_id and sec_id",
            "course_id, sec_id, semester, year",
            "ID and year",
          ],
          answer: 2,
          why: "The composite section key is (course_id, sec_id, semester, year). Leaving out any field can pair an assignment with the wrong section term.",
        },
      ],
    },
    {
      id: "outer",
      title: "Unmatched rows",
      blurb: "A complete report may need rows without a match.",
      sections: [
        {
          kind: "note",
          title: "LEFT JOIN preserves the left side",
          icon: "branch",
          paragraphs: [
            "INNER JOIN keeps only matches; LEFT JOIN keeps every row of the left relation, filling unmatched right-side columns with NULL. No new row is stored in teaches — the padding happens in the result only.",
            "RIGHT preserves the second input; FULL preserves both. Choose the join type from the report's required population, not from habit.",
          ],
        },
        {
          kind: "example",
          title: "Inner vs left join for Physics",
          lang: "sql",
          expected: "INNER: Biniam | PHY-101 only. LEFT: Biniam | PHY-101 plus Fikru | NULL",
          code: `SELECT i.name, t.course_id
FROM instructor AS i
LEFT JOIN teaches AS t ON i.ID = t.ID
WHERE i.dept_name = 'Physics'
ORDER BY i.name, t.course_id;`,
        },
        {
          kind: "note",
          title: "Finding rows without a match",
          icon: "search",
          paragraphs: [
            "The anti-join pattern: LEFT JOIN teaches, then WHERE t.ID IS NULL keeps only instructors with no teaching record. t.ID is non-null in every actual teaches row, so a padded NULL means 'no match'.",
            "Result: Amare, Fikru, Mintesinot — the three instructors who teach nothing.",
          ],
        },
        {
          kind: "example",
          title: "Instructors without assignments",
          lang: "sql",
          expected: "Amare, Fikru, Mintesinot",
          code: `SELECT i.ID, i.name
FROM instructor AS i
LEFT JOIN teaches AS t ON i.ID = t.ID
WHERE t.ID IS NULL
ORDER BY i.name;`,
        },
        {
          kind: "note",
          title: "ON and WHERE act at different stages of an outer join",
          icon: "alert",
          paragraphs: [
            "Year in ON: controls which assignments may match; unmatched instructors are still preserved with NULLs → 13 rows, 12 instructors represented. Year in WHERE: filters the joined result afterwards, throwing away the padded rows → 8 rows, 7 instructors.",
            "Count rows and represented people separately — they answer different questions.",
          ],
          table: {
            caption: "Same predicate, two placements",
            head: ["Stage", "Year in ON", "Year in WHERE"],
            rows: [
              ["Actual 2018 assignment rows", "8", "8"],
              ["Preserved rows without a 2018 match", "5", "0"],
              ["Total output rows", "13", "8"],
              ["Distinct instructors represented", "12", "7"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "How can Fikru appear in a report with zero assignments?",
          options: [
            "INNER JOIN and COUNT(*)",
            "LEFT JOIN plus COUNT(t.ID)",
            "DELETE her teaches rows first",
            "She cannot appear",
          ],
          answer: 1,
          why: "LEFT JOIN preserves Fikru with a padded NULL; COUNT(t.ID) counts real matches and ignores the padded NULL, so it reports 0 for her.",
        },
      ],
    },
    {
      id: "groups",
      title: "Group summaries",
      blurb: "Many input rows become one summary per group.",
      sections: [
        {
          kind: "note",
          title: "The five aggregate functions",
          icon: "chart",
          paragraphs: [
            "COUNT(*) counts input rows: 12. ROUND(AVG(salary), 2) is the mean of known salaries: 74833.33. SUM(salary): 898000. MIN(salary): 40000. MAX(salary): 95000.",
            "One aggregate query without GROUP BY gives one overall summary row.",
          ],
          table: {
            caption: "Aggregates over all instructor rows",
            head: ["Function", "Meaning", "Value"],
            rows: [
              ["COUNT(*)", "number of input rows", "12"],
              ["ROUND(AVG(salary), 2)", "mean of known salaries", "74833.33"],
              ["SUM(salary)", "total of known salaries", "898000"],
              ["MIN(salary)", "smallest known salary", "40000"],
              ["MAX(salary)", "largest known salary", "95000"],
            ],
          },
        },
        {
          kind: "note",
          title: "COUNT(*) vs COUNT(x) vs COUNT(DISTINCT x)",
          icon: "target",
          paragraphs: [
            "In teaches: COUNT(*) = 15 (all rows), COUNT(ID) = 15 (ID is never null there), COUNT(DISTINCT ID) = 9 (nine distinct instructors).",
            "Choose the count that matches the question: rows, known values, or distinct entities.",
          ],
        },
        {
          kind: "example",
          title: "The three counts side by side",
          lang: "sql",
          expected: "15 assignment rows, 15 known IDs, 9 distinct instructors",
          code: `SELECT COUNT(*) AS assignment_rows,
       COUNT(ID) AS known_IDs,
       COUNT(DISTINCT ID) AS instructors
FROM teaches;`,
        },
        {
          kind: "note",
          title: "Aggregates ignore NULL — and give NULL on empty input",
          icon: "alert",
          paragraphs: [
            "For values (8, 12, NULL): COUNT(*) = 3, COUNT(x) = 2, SUM = 20, AVG = 10.0 — the NULL is ignored everywhere except COUNT(*).",
            "For an all-NULL column or no rows at all: COUNT is 0, but SUM, AVG, MIN and MAX give NULL — 'no known values' rather than zero. No GROUP BY on empty input still gives one overall row; with GROUP BY, empty input simply has no groups.",
          ],
          table: {
            caption: "NULL and empty aggregate inputs",
            head: ["Input values", "COUNT(*)", "COUNT(x)", "SUM(x)", "AVG(x)"],
            rows: [
              ["8, 12, NULL", "3", "2", "20", "10.0"],
              ["NULL", "1", "0", "NULL", "NULL"],
              ["no rows", "0", "0", "NULL", "NULL"],
            ],
          },
        },
        {
          kind: "note",
          title: "GROUP BY forms groups; ORDER BY sorts output",
          icon: "layers",
          paragraphs: [
            "SELECT dept_name, ROUND(AVG(salary), 2) AS avg_salary FROM instructor GROUP BY dept_name — one row per represented department (7 rows). Grouping follows equal department values, not storage order.",
            "Trace for Comp. Sci.: rows (65000, 75000, 92000) → SUM 232000 → AVG 77333.33. Finance: (90000, 80000) → 85000.",
          ],
        },
        {
          kind: "example",
          title: "HAVING filters groups, WHERE filters rows",
          lang: "sql",
          expected: "Elec. Eng. (80000), Finance (85000), Physics (91000) — filter the group average, not each salary",
          code: `SELECT dept_name, ROUND(AVG(salary), 2) AS avg_salary
FROM instructor
GROUP BY dept_name
HAVING AVG(salary) >= 80000
ORDER BY dept_name;`,
        },
        {
          kind: "note",
          title: "The logical order of a query",
          icon: "list",
          paragraphs: [
            "FROM/JOIN builds input rows → WHERE keeps qualifying individual rows → GROUP BY forms groups → HAVING keeps qualifying groups → SELECT/DISTINCT chooses outputs → ORDER BY arranges the result.",
            "That is why WHERE cannot see aggregates: it runs before groups exist. (Logical meaning is not the physical execution plan.)",
          ],
          table: {
            caption: "Logical query order",
            head: ["Stage", "Main job"],
            rows: [
              ["FROM and JOIN", "construct the input rows"],
              ["WHERE", "keep qualifying individual rows"],
              ["GROUP BY and aggregates", "form and summarize groups"],
              ["HAVING", "keep qualifying groups"],
              ["SELECT, then DISTINCT if requested", "choose output expressions, remove duplicate outputs"],
              ["ORDER BY", "arrange the final output"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "WHERE salary >= 80000 is used to filter department averages. What is wrong?",
          options: [
            "Nothing — WHERE works with averages",
            "WHERE runs before groups form; use HAVING AVG(salary) >= 80000",
            "Use ORDER BY instead",
            "Averages must use SUM",
          ],
          answer: 1,
          why: "WHERE filters individual rows before aggregation. Filtering groups by their average requires HAVING, which runs after grouping.",
        },
      ],
    },
    {
      id: "reports",
      title: "Reliable reports",
      blurb: "Check the population, row grain, and meaning of each count.",
      sections: [
        {
          kind: "note",
          title: "Assignment counts including zero",
          icon: "chart",
          paragraphs: [
            "LEFT JOIN teaches, GROUP BY i.ID, i.name, COUNT(t.ID) AS assignments — counting actual matches so an unmatched instructor shows 0, not 1.",
            "COUNT(*) would give 1 for Fikru (the padded row exists!). Grouping by ID and displayed name keeps the grouping stable even if two instructors shared a name.",
          ],
        },
        {
          kind: "example",
          title: "A visible zero",
          lang: "sql",
          expected: "Biniam | 1, Fikru | 0 — with COUNT(*) Fikru would wrongly show 1",
          code: `SELECT i.name, COUNT(t.ID) AS assignments
FROM instructor AS i
LEFT JOIN teaches AS t ON i.ID = t.ID
WHERE i.dept_name = 'Physics'
GROUP BY i.ID, i.name
ORDER BY i.name;`,
        },
        {
          kind: "note",
          title: "A join repeats facts — sums get inflated",
          icon: "alert",
          paragraphs: [
            "Tinsae earns 65000 once, but appears in 3 joined rows → her salary counts 195000. Getachew: 75000 × 2 = 150000. Almaz: 92000 × 3 = 276000. The joined 'salary total' for Comp. Sci. is 621000, but the true total is 232000.",
            "SUM(DISTINCT salary) merges equal salaries, not equal people — it is not a repair either. The fix is to sum from the table whose grain matches the measure: SUM(salary) FROM instructor alone.",
          ],
          table: {
            caption: "Inflation from joining teaches",
            head: ["Instructor", "Salary once", "Assignments", "Joined salary total"],
            rows: [
              ["Tinsae", "65000", "3", "195000"],
              ["Getachew", "75000", "2", "150000"],
              ["Almaz", "92000", "3", "276000"],
              ["Total", "232000 (true)", "8", "621000 (wrong)"],
            ],
            highlight: (r) => r === 3,
          },
        },
        {
          kind: "note",
          title: "The report checklist",
          icon: "target",
          paragraphs: [
            "A query can run successfully and still measure the wrong thing. Check grain (one instructor or one assignment?), complete keys (all four section key fields), preserved population (include instructors without teaching — or scenes without detections), measure meaning (assignments differ from people), and hand-check one small expected result (Fikru has zero).",
          ],
          table: {
            caption: "Report checks — university vs AI data",
            head: ["Check", "University report", "AI data analogy"],
            rows: [
              ["Output grain", "one instructor or one assignment?", "one scene, frame, or detection?"],
              ["Complete keys", "all four section key fields", "complete frame identity"],
              ["Preserved population", "include instructors without teaching", "include scenes without detections"],
              ["Measure meaning", "assignments differ from people", "observations differ from scenes"],
              ["Small expected result", "Fikru has zero assignments", "hand check one known scene"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "COUNT(*) after a LEFT JOIN says Fikru has one assignment. What is the mistaken assumption?",
          options: [
            "That COUNT ignores padded rows",
            "That Fikru teaches a course",
            "That LEFT JOIN is the same as INNER JOIN",
            "That GROUP BY removes duplicates",
          ],
          answer: 0,
          why: "COUNT(*) counts the padded join row too. COUNT(t.ID) counts real matches only, because it ignores the padded NULL.",
        },
      ],
    },
  ],
  summary: [
    "Explicit conditions match related rows; aliases keep queries readable; the inner join keeps only matches.",
    "Composite relationships need every key component: (course_id, sec_id, semester, year).",
    "Outer joins preserve required unmatched records; ON and WHERE act at different stages of an outer join.",
    "Groups summarize rows (GROUP BY) and HAVING filters groups; WHERE filters rows before grouping.",
    "Correct reports respect population, grain, and measure — COUNT(t.ID) for real matches, never a joined-up salary sum.",
  ],
  examTips: [
    "Memorise the four counts: CROSS JOIN 180, inner join 15, distinct teachers 9, instructor⋈department 12.",
    "Any 'instructors with no assignments' question is the LEFT JOIN + IS NULL pattern.",
    "ON vs WHERE in outer joins: ON shapes the match, WHERE filters the final result — the 13 vs 8 rows table is the exam favourite.",
    "Aggregates: COUNT(*) counts rows; COUNT(x) ignores NULL; aggregates over empty input give NULL, not 0 (except COUNT).",
  ],
  quiz: [
    {
      q: "Which fields must match when joining teaches to section correctly?",
      options: [
        "course_id only",
        "course_id, sec_id",
        "course_id, sec_id, semester, year",
        "building, room_number",
      ],
      answer: 2,
      why: "The complete composite section key (course_id, sec_id, semester, year) links one assignment to one exact section. Fewer fields can match the wrong term.",
    },
    {
      q: "NATURAL JOIN matches columns by…",
      options: [
        "declared foreign keys",
        "every shared column name",
        "primary keys only",
        "column order",
      ],
      answer: 1,
      why: "NATURAL JOIN uses equality on every shared name and ignores declared keys — which is why schema changes can silently change its result.",
    },
    {
      q: "With year in the WHERE clause of an instructor LEFT JOIN teaches, how many rows and how many distinct instructors appear?",
      options: ["13 rows, 12 instructors", "8 rows, 7 instructors", "8 rows, 12 instructors", "15 rows, 9 instructors"],
      answer: 1,
      why: "WHERE filters the joined result: the 8 real 2018 rows survive, padded rows are removed, so 7 instructors are represented.",
    },
    {
      q: "For values (8, 12, NULL), what do COUNT(x) and AVG(x) give?",
      options: ["3 and 10.0", "2 and 10.0", "2 and NULL", "3 and NULL"],
      answer: 1,
      why: "COUNT(x) ignores the NULL → 2. AVG ignores the NULL too → (8+12)/2 = 10.0.",
    },
    {
      q: "Why does joining teaches before summing salaries inflate Comp. Sci.'s total to 621000?",
      options: [
        "Because salaries are stored twice",
        "Because each instructor's salary repeats once per teaching assignment",
        "Because SUM adds DISTINCT values",
        "Because 621000 is the correct total",
      ],
      answer: 1,
      why: "The join repeats each instructor's salary per assignment (65000×3 + 75000×2 + 92000×3). Sum from the table whose grain matches the measure.",
    },
  ],
};
