// Lecture 3 — SQL Basics and Table Definitions
export const lecture03 = {
  num: 3,
  slug: "sql-basics-tables",
  title: "SQL Basics and Table Definitions",
  tagline: "Read data, shape results, reason about NULL, and define reliable tables.",
  minutes: 35,
  icon: "terminal",
  objectives: [
    "Translate requests into simple SQL queries",
    "Predict query results and ordering",
    "Explain missing values in conditions",
    "Define tables with keys and constraints",
    "Insert, update, and delete practice rows safely",
  ],
  parts: [
    {
      id: "queries",
      title: "Table queries",
      blurb: "Translate a request into a source, a condition, and a result.",
      sections: [
        {
          kind: "note",
          title: "SQL commands and their effects",
          icon: "list",
          paragraphs: [
            "Every SQL statement belongs to one of four jobs. Read statements leave stored rows unchanged; structural statements change the schema; data statements change table contents; DROP removes the definition and the rows together.",
            "Course rule: read from the university tables, write only to lab tables (the lab_* tables in this app's SQL runner).",
          ],
          table: {
            caption: "Commands at a glance",
            head: ["Job", "Commands", "Effect"],
            rows: [
              ["Read a result", "SELECT", "Stored rows stay unchanged"],
              ["Define or change structure", "CREATE TABLE / ALTER TABLE", "Schema changes"],
              ["Change stored rows", "INSERT / UPDATE / DELETE", "Table contents change"],
              ["Remove a table", "DROP TABLE", "Definition and rows disappear"],
            ],
          },
        },
        {
          kind: "note",
          title: "The basic query structure",
          icon: "terminal",
          paragraphs: [
            "Read the request in three parts: FROM chooses the source, WHERE keeps qualifying rows, SELECT chooses the output columns. Text literals use single quotes.",
            "Prediction before execution: “names of Physics instructors earning more than 90000” — say it before you run it, then check. That habit is what the exam rewards.",
          ],
        },
        {
          kind: "example",
          title: "The query from the lecture, step by step",
          lang: "sql",
          expected: "Biniam (95000) only — Fikru is Physics but earns 87000",
          code: `SELECT name
FROM instructor
WHERE dept_name = 'Physics'
  AND salary > 90000
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "Trace the query like the lecture does",
          icon: "branch",
          paragraphs: [
            "Source: all 12 instructor rows, 4 columns. Filter: both conditions must hold — dept_name = 'Physics' leaves Biniam and Fikru; salary > 90000 leaves only Biniam. Output: one row, one column. The original table is unchanged.",
            "This is a logical trace, not the physical execution plan. Replacing AND with OR changes the question: it would include every Physics instructor and every instructor earning over 90000.",
          ],
          table: {
            caption: "Row conditions",
            head: ["Candidate", "dept = Physics?", "salary > 90000", "Keep row?"],
            rows: [
              ["Biniam (95000)", "TRUE", "TRUE", "Yes"],
              ["Fikru (87000)", "TRUE", "FALSE", "No"],
              ["Yohannes (90000)", "FALSE", "TRUE", "No"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "SELECT dept_name without DISTINCT from the 12-instructor table returns how many rows?",
          options: ["1", "7", "12", "0"],
          answer: 2,
          why: "Without DISTINCT, SQL keeps duplicates (multiset semantics): one row per instructor, so 12. With DISTINCT you get the 7 departments.",
        },
      ],
    },
    {
      id: "results",
      title: "Shaping a query result",
      blurb: "Compute, name, deduplicate, and order the result.",
      sections: [
        {
          kind: "note",
          title: "Calculated columns and aliases",
          icon: "chart",
          paragraphs: [
            "A SELECT item can be an expression. ROUND(salary / 12.0, 2) AS monthly_salary computes a monthly value and names the output column with AS — the stored annual salaries do not change.",
            "SQLite quirk worth knowing: integer division differs from division with a decimal operand — salary / 12 gives an integer, salary / 12.0 keeps the decimals.",
          ],
        },
        {
          kind: "example",
          title: "Monthly salary with an alias",
          lang: "sql",
          expected: "Biniam | 7916.67 and Fikru | 7250.0",
          code: `SELECT name,
       ROUND(salary / 12.0, 2) AS monthly_salary
FROM instructor
WHERE dept_name = 'Physics'
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "DISTINCT compares the complete selected row",
          icon: "layers",
          paragraphs: [
            "SELECT dept_name returns one row per instructor (Finance twice, Physics twice…). SELECT DISTINCT dept_name returns 7 rows — one per department.",
            "DISTINCT looks at the whole selected row, not one column. SELECT ALL is the explicit form of the default behaviour.",
          ],
        },
        {
          kind: "example",
          title: "Duplicates vs DISTINCT",
          lang: "sql",
          expected: "4 rows (Finance, Finance, Physics, Physics) vs 2 rows",
          code: `SELECT dept_name FROM instructor WHERE dept_name IN ('Finance', 'Physics') ORDER BY dept_name;
SELECT DISTINCT dept_name FROM instructor WHERE dept_name IN ('Finance', 'Physics') ORDER BY dept_name;`,
        },
        {
          kind: "note",
          title: "ORDER BY: no order is promised without it",
          icon: "list",
          paragraphs: [
            "No ORDER BY means no promised order. ORDER BY salary DESC, ID ASC sorts by salary descending, and the second key resolves equal salaries (Mintesinot before Hirut at 80000).",
            "ASC is the default direction; DESC is explicit for descending.",
          ],
        },
        {
          kind: "quiz",
          question: "In `ORDER BY salary DESC, ID ASC`, what is ID ASC for?",
          options: [
            "To make the query faster",
            "To break ties between equal salaries",
            "To remove duplicate rows",
            "It has no effect",
          ],
          answer: 1,
          why: "The second sort key resolves equal salaries deterministically — at 80000, Mintesinot (76543) comes before Hirut (98345).",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions and missing values",
      blurb: "Boundaries, combinations, patterns, and the three-valued logic of NULL.",
      sections: [
        {
          kind: "note",
          title: "AND binds more tightly than OR",
          icon: "alert",
          paragraphs: [
            "WHERE dept_name = 'Physics' OR dept_name = 'Finance' AND salary >= 90000 — without parentheses, AND binds first, so Fikru (Physics, 87000) qualifies wrongly.",
            "Write WHERE (dept_name = 'Physics' OR dept_name = 'Finance') AND salary >= 90000. Choose a test row that exposes the difference — that is how professionals debug conditions.",
          ],
        },
        {
          kind: "example",
          title: "Parentheses change the meaning",
          lang: "sql",
          expected: "Biniam and Yohannes — without parentheses Fikru would sneak in",
          code: `SELECT name, salary
FROM instructor
WHERE (dept_name = 'Physics' OR dept_name = 'Finance')
  AND salary >= 90000
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "BETWEEN is inclusive; IN is membership",
          icon: "list",
          paragraphs: [
            "salary BETWEEN 90000 AND 95000 includes both endpoints (Almaz, Biniam, Yohannes). dept_name IN ('Physics', 'Finance') tests membership in the listed alternatives.",
            "Both can always be rewritten with comparisons and OR — they are readability features.",
          ],
          table: {
            caption: "Condition practice from the lecture",
            head: ["Condition", "Meaning", "Matching names"],
            rows: [
              ["salary BETWEEN 90000 AND 95000", "both endpoints included", "Almaz, Biniam, Yohannes"],
              ["dept_name IN ('Physics', 'Finance')", "either listed department", "Biniam, Fikru, Mintesinot, Yohannes"],
              ["dept_name = 'Comp. Sci.' AND salary >= 70000", "both requirements", "Almaz, Getachew"],
            ],
          },
        },
        {
          kind: "example",
          title: "LIKE patterns: % is any sequence, _ is one character",
          lang: "sql",
          expected: "Biniam, Mintesinot, Tinsae — every name containing 'in'",
          code: `SELECT name FROM instructor
WHERE name LIKE '%in%'
ORDER BY name;`,
        },
        {
          kind: "note",
          title: "Text functions and case rules",
          icon: "code",
          paragraphs: [
            "UPPER(name), LENGTH(name), SUBSTR(name, 1, 3), and name || '!' (concatenation) all compute output — expressions never modify stored names.",
            "SQLite's LIKE normally ignores ASCII letter case; case rules are dialect dependent. Use an ESCAPE clause when a pattern must match a literal % or _.",
          ],
        },
        {
          kind: "note",
          title: "NULL is unknown, not zero",
          icon: "alert",
          paragraphs: [
            "Hawi's salary NULL means unknown; Meron's 0 means a known zero; Mesfin's 60000 is a known amount. The application must define what missing means.",
            "salary > 50000 is UNKNOWN for Hawi, FALSE for Meron, TRUE for Mesfin. WHERE keeps TRUE rows only — so Meron and Mesfin-style rows are excluded, and UNKNOWN rows are excluded too, but for a different reason.",
          ],
          table: {
            caption: "NULL vs zero vs known value",
            head: ["Person", "salary", "Meaning", "salary > 50000"],
            rows: [
              ["Hawi", "NULL", "Unknown", "UNKNOWN"],
              ["Meron", "0", "Known zero", "FALSE"],
              ["Mesfin", "60000", "Known amount", "TRUE"],
            ],
          },
        },
        {
          kind: "note",
          title: "Three-valued logic — the full table",
          icon: "layers",
          paragraphs: [
            "WHERE keeps TRUE only. NOT UNKNOWN remains UNKNOWN. UNKNOWN AND UNKNOWN is UNKNOWN; UNKNOWN OR UNKNOWN is UNKNOWN; UNKNOWN AND FALSE is FALSE; UNKNOWN OR TRUE is TRUE.",
            "This table decides half of the tricky exam questions — learn the UNKNOWN row especially.",
          ],
          table: {
            caption: "Three-valued logic",
            head: ["p", "NOT p", "p AND TRUE", "p AND FALSE", "p OR TRUE", "p OR FALSE"],
            rows: [
              ["TRUE", "FALSE", "TRUE", "FALSE", "TRUE", "TRUE"],
              ["FALSE", "TRUE", "FALSE", "FALSE", "TRUE", "FALSE"],
              ["UNKNOWN", "UNKNOWN", "UNKNOWN", "FALSE", "TRUE", "UNKNOWN"],
            ],
            highlight: (r) => r === 2,
          },
        },
        {
          kind: "example",
          title: "IS NULL is the missing-value test",
          lang: "sql",
          expected: "NULL = NULL is NULL (0/unknown), but IS NULL correctly detects missing values",
          code: `SELECT NULL = NULL AS equality,
       NULL IS NULL AS missing,
       NULL IS NOT NULL AS known;

-- Which instructors have an undecided salary?
SELECT name FROM instructor WHERE salary IS NULL;`,
        },
        {
          kind: "quiz",
          question: "Does salary = NULL identify missing salaries?",
          options: [
            "Yes — it compares to NULL",
            "No — it is UNKNOWN for every row; use IS NULL",
            "Yes, but only in SQLite",
            "No — use salary != 0",
          ],
          answer: 1,
          why: "Any comparison with NULL yields UNKNOWN, and WHERE keeps only TRUE. The correct test is salary IS NULL (or IS NOT NULL).",
        },
        {
          kind: "quiz",
          question: "Hawi has salary NULL. What does NOT (salary > 50000) give for Hawi?",
          options: ["TRUE", "FALSE", "UNKNOWN", "An error"],
          answer: 2,
          why: "salary > 50000 is UNKNOWN for Hawi, and NOT UNKNOWN is still UNKNOWN. That is why the row is excluded from WHERE results even though its negation is also not TRUE.",
        },
      ],
    },
    {
      id: "constraints",
      title: "Table definitions and constraints",
      blurb: "Turn domain knowledge into explicit database rules.",
      sections: [
        {
          kind: "note",
          title: "Column types",
          icon: "fileText",
          paragraphs: [
            "Identifiers and names: CHAR / VARCHAR / TEXT. Whole-number counts: INTEGER / SMALLINT. Exact decimal amounts: NUMERIC(p, d). Approximate measurements: REAL / DOUBLE PRECISION.",
            "SQLite practice: TEXT for IDs, INTEGER affinity for counts, REAL for measurements; ordinary SQLite tables use flexible typing (precision is not enforced; strict tables are a separate option).",
          ],
          table: {
            caption: "Types",
            head: ["Intention", "Common SQL declarations", "SQLite practice choice"],
            rows: [
              ["Identifier or name", "CHAR / VARCHAR / TEXT", "TEXT"],
              ["Whole number count", "INTEGER / SMALLINT", "INTEGER affinity"],
              ["Exact decimal amount", "NUMERIC(p, d)", "Precision is not enforced"],
              ["Approximate measurement", "REAL / DOUBLE PRECISION", "REAL"],
            ],
          },
        },
        {
          kind: "note",
          title: "CREATE TABLE with five explicit rules",
          icon: "fileText",
          paragraphs: [
            "The lab_instructor table declares five rules: required identity (PRIMARY KEY), required name (NOT NULL), known department (FOREIGN KEY), nonnegative known salary (CHECK), and a unique supplied email (UNIQUE).",
            "This exact table already exists in the SQL runner's database — the notebook's reset_lab() recreates it.",
          ],
          code: {
            lang: "sql",
            code: `CREATE TABLE lab_instructor (
    ID TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    dept_name TEXT NOT NULL,
    salary INTEGER CHECK (salary >= 0),
    email TEXT UNIQUE,
    FOREIGN KEY (dept_name) REFERENCES department(dept_name)
);`,
          },
        },
        {
          kind: "note",
          title: "Composite keys",
          icon: "key",
          paragraphs: [
            "A section is identified by five fields together: (ID, course_id, sec_id, semester, year) in the assignment table — the whole key identifies one instructor teaching one section.",
            "A composite foreign key must match one complete referenced key — here the four section key fields (course_id, sec_id, semester, year).",
          ],
          code: {
            lang: "sql",
            code: `CREATE TABLE lab_assignment (
    ID TEXT NOT NULL REFERENCES instructor(ID),
    course_id TEXT NOT NULL, sec_id TEXT NOT NULL,
    semester TEXT NOT NULL, year INTEGER NOT NULL,
    PRIMARY KEY (ID, course_id, sec_id, semester, year),
    FOREIGN KEY (course_id, sec_id, semester, year)
        REFERENCES section(course_id, sec_id, semester, year)
);`,
          },
        },
        {
          kind: "note",
          title: "Each constraint answers a different question",
          icon: "shield",
          paragraphs: [
            "PRIMARY KEY: can this identity repeat? NOT NULL: must a value be supplied? UNIQUE: can a supplied value repeat? CHECK: does the stated rule fail? FOREIGN KEY: does the referenced row exist?",
            "Constraints protect different parts of the meaning — a rule exists only when it is declared and enforced.",
          ],
          table: {
            caption: "Constraint types",
            head: ["Constraint", "Question", "Example rejected"],
            rows: [
              ["PRIMARY KEY", "Can this identity repeat?", "A second instructor with ID 54321"],
              ["NOT NULL", "Must a value be supplied?", "A missing instructor name"],
              ["UNIQUE", "Can a supplied value repeat?", "The same nonmissing email twice"],
              ["CHECK", "Does the stated rule fail?", "A known negative salary"],
              ["FOREIGN KEY", "Does the referenced row exist?", "A department not in department"],
            ],
          },
        },
        {
          kind: "note",
          title: "CHECK rejects FALSE; NULL passes CHECK",
          icon: "alert",
          paragraphs: [
            "For salary >= 0: −100 is FALSE → rejected; 0 and 66000 are TRUE → allowed; NULL is UNKNOWN → allowed by CHECK alone. Add NOT NULL and the NULL case is rejected too.",
            "Our practice schema intentionally permits an undecided salary — CHECK alone does not reject missing values.",
          ],
          table: {
            caption: "CHECK and NOT NULL together",
            head: ["Proposed salary", "salary >= 0", "CHECK outcome", "With NOT NULL too"],
            rows: [
              ["-100", "FALSE", "Rejected", "Rejected"],
              ["0", "TRUE", "Allowed", "Allowed"],
              ["66000", "TRUE", "Allowed", "Allowed"],
              ["NULL", "UNKNOWN", "Allowed", "Rejected"],
            ],
            highlight: (r) => r === 3,
          },
        },
        {
          kind: "note",
          title: "Foreign keys need enforcement on",
          icon: "shield",
          paragraphs: [
            "SQLite enforces foreign keys only when the connection sets PRAGMA foreign_keys = ON — enable it for each connection, before a transaction starts. The notebook setup enables and checks it (the result reads 1).",
            "A referenced department must exist before the instructor row that points at it.",
          ],
        },
        {
          kind: "quiz",
          question: "New instructor row: valid ID, valid name, department 'Robotics' which is absent. What happens?",
          options: ["Allowed", "Rejected by PRIMARY KEY", "Rejected by NOT NULL", "Rejected by FOREIGN KEY"],
          answer: 3,
          why: "The foreign key requires dept_name to exist in department. Robotics is not there, so the insert is rejected by the FOREIGN KEY constraint.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changing data safely",
      blurb: "INSERT, UPDATE, DELETE — explicit values, precise targets, verification.",
      sections: [
        {
          kind: "note",
          title: "INSERT with named columns",
          icon: "fileText",
          paragraphs: [
            "INSERT INTO lab_instructor (ID, name, dept_name, salary, email) VALUES ('54321', 'Hawi', 'Comp. Sci.', NULL, 'hawi@example.org') — the named columns and supplied values must correspond one to one.",
            "Salary is NULL because it is not known yet. Listing the columns explicitly also protects the statement when the table gains new columns.",
          ],
        },
        {
          kind: "example",
          title: "The safe UPDATE sequence: preview → change → verify",
          lang: "sql",
          expected: "Hawi's salary moves from NULL to 66000 — only where ID = '54321'",
          code: `-- 1. Preview the target
SELECT ID, name, salary FROM lab_instructor WHERE ID = '54321';

-- 2. Insert her first (if you have not already)
INSERT INTO lab_instructor (ID, name, dept_name, salary)
VALUES ('54321', 'Hawi', 'Comp. Sci.', NULL);

-- 3. Change with the same precise condition
UPDATE lab_instructor SET salary = 66000 WHERE ID = '54321';

-- 4. Verify the result
SELECT ID, name, salary FROM lab_instructor WHERE ID = '54321';`,
        },
        {
          kind: "note",
          title: "UPDATE without WHERE touches every row",
          icon: "alert",
          paragraphs: [
            "No WHERE means every row in the table is updated. The safe sequence is always: preview the target with SELECT, change with the same precise condition, verify the result.",
            "Only the practice table changes in this app — the original instructor salaries stay the same.",
          ],
          callout: {
            tone: "warn",
            title: "The three destructive statements",
            text: "DELETE FROM lab_instructor WHERE ID = '54321' removes the selected row. DELETE FROM lab_instructor removes all rows but keeps the schema. DROP TABLE lab_instructor removes the rows AND the definition. ALTER TABLE lab_instructor ADD COLUMN office TEXT adds a column. These are alternatives, not a script to run together.",
          },
        },
        {
          kind: "note",
          title: "Reading constraint errors",
          icon: "shield",
          paragraphs: [
            "The symptom points to the rule: duplicate identifier → PRIMARY KEY; missing name → NOT NULL; unknown department → FOREIGN KEY; negative salary → CHECK. Inspect the statement and values before changing a constraint.",
          ],
          table: {
            caption: "Constraint errors",
            head: ["Symptom", "Likely rule", "First check"],
            rows: [
              ["Duplicate identifier rejected", "PRIMARY KEY", "Was the row already inserted?"],
              ["Missing name rejected", "NOT NULL", "Was a name supplied?"],
              ["Unknown department rejected", "FOREIGN KEY", "Does the referenced department exist?"],
              ["Negative salary rejected", "CHECK", "Does the value satisfy the policy?"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "New row: fresh ID, name NULL, valid department. Which rule rejects it?",
          options: ["PRIMARY KEY", "NOT NULL", "UNIQUE", "CHECK"],
          answer: 1,
          why: "name TEXT NOT NULL requires a value. PRIMARY KEY is fine (fresh ID), UNIQUE is not violated (no email), CHECK is about salary. It is the NOT NULL on name.",
        },
      ],
    },
  ],
  summary: [
    "Queries describe the required result: FROM the source, WHERE the conditions, SELECT the output columns, ORDER BY the display order.",
    "Expressions, aliases, DISTINCT and ordering shape the output; DISTINCT compares the complete selected row.",
    "Missing values need explicit reasoning: comparisons with NULL are UNKNOWN, WHERE keeps TRUE only, and IS NULL is the missing-value test.",
    "Constraints express different rules: PRIMARY KEY, NOT NULL, UNIQUE, CHECK, FOREIGN KEY — and CHECK alone lets NULL pass.",
    "Precise conditions protect data changes: preview, change, verify — and UPDATE without WHERE hits every row.",
  ],
  examTips: [
    "Three-valued logic table: memorise the UNKNOWN row. Almost every 'what does this query return' question with NULL comes from it.",
    "ORDER BY ID is not ORDER BY name — read the sort keys in the question before predicting output order.",
    "For constraint questions, name the exact rule (PRIMARY KEY / NOT NULL / UNIQUE / CHECK / FOREIGN KEY), not just 'rejected'.",
    "Always predict before you run: state the expected rows and order, then check in the SQL runner below.",
  ],
  quiz: [
    {
      q: "Which WHERE clause correctly finds instructors in Physics or Finance earning at least 90000?",
      options: [
        "WHERE dept_name = 'Physics' OR dept_name = 'Finance' AND salary >= 90000",
        "WHERE (dept_name = 'Physics' OR dept_name = 'Finance') AND salary >= 90000",
        "WHERE dept_name IN ('Physics') AND salary >= 90000 OR 'Finance'",
        "WHERE dept_name = 'Physics' OR dept_name = 'Finance', salary >= 90000",
      ],
      answer: 1,
      why: "AND binds more tightly than OR, so option A wrongly includes Physics instructors earning less. Parentheses group the department alternatives first.",
    },
    {
      q: "Hawi (salary NULL): what does WHERE salary > 50000 OR salary IS NULL do with her row?",
      options: ["Excluded", "Kept", "An error", "Kept only in SQLite"],
      answer: 1,
      why: "salary > 50000 is UNKNOWN, but UNKNOWN OR TRUE is TRUE, and salary IS NULL is TRUE — the row is kept.",
    },
    {
      q: "BETWEEN 90000 AND 95000 includes…",
      options: ["90000 only", "95000 only", "Both endpoints", "Neither endpoint"],
      answer: 2,
      why: "BETWEEN is inclusive on both ends: Yohannes (90000), Biniam (95000) and Almaz (92000) all qualify.",
    },
    {
      q: "Which is a valid reason UNIQUE differs from PRIMARY KEY?",
      options: [
        "UNIQUE allows a column to have repeated NULLs while still enforcing uniqueness of supplied values",
        "UNIQUE creates an index; PRIMARY KEY does not",
        "PRIMARY KEY allows NULLs",
        "There is no difference",
      ],
      answer: 0,
      why: "email TEXT UNIQUE rejects a repeated non-missing email but does not require a value — several NULLs can coexist. PRIMARY KEY identifies rows and must be non-null.",
    },
    {
      q: "UPDATE lab_instructor SET salary = 0; (no WHERE) does what?",
      options: [
        "Fails with a syntax error",
        "Updates one row",
        "Updates every row in lab_instructor",
        "Deletes the table",
      ],
      answer: 2,
      why: "No WHERE means every row is targeted. Preview with SELECT first, always use a precise condition, then verify.",
    },
  ],
};
