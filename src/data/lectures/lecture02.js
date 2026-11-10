// Lecture 2 — The Relational Model and Relational Algebra
export const lecture02 = {
  num: 2,
  slug: "relational-model-algebra",
  title: "The Relational Model and Relational Algebra",
  tagline: "Tuples, keys, and the algebra σ, Π, ⋈, ∪, − that powers every query.",
  minutes: 30,
  icon: "layers",
  objectives: [
    "Explain relation structure using schemas, attributes, domains, tuples, and nulls",
    "Identify superkeys, candidate keys, primary keys, and foreign keys",
    "Interpret schema diagrams and trace relationships among relations",
    "Apply relational algebra operators to evaluate expressions",
    "Compare equivalent query plans by their intermediate work",
  ],
  parts: [
    {
      id: "structure",
      title: "Relational structure",
      blurb: "Schemas, attributes, domains, tuples, nulls, and why order never matters.",
      sections: [
        {
          kind: "note",
          title: "Relation schema and instance",
          icon: "key",
          paragraphs: [
            "A relation schema names its attributes: R = (A1, A2, …, An), for example instructor = (ID, name, dept_name, salary). Attributes are the columns; each tuple t is one row; the instance r(R) is the set of tuples at one moment.",
            "The database schema is all the relation schemas together (instructor, department, …). Quiz yourself: Hawi is hired — does the schema change or the instance? Only the instance: one new tuple, same columns.",
          ],
        },
        {
          kind: "note",
          title: "Domains and atomic values",
          icon: "table",
          paragraphs: [
            "A domain is the set of allowed values for an attribute. Values are normally atomic — not split into parts. A cell holding '0911 22 33 44, 0912 55 66 77' is not atomic.",
            "The fix: store a list as several tuples in its own relation — one row per phone number, each with the instructor ID. Atomic, one phone per tuple.",
          ],
          table: {
            caption: "Not atomic vs atomic design",
            head: ["Bad: phones in one cell", "Good: phone relation"],
            rows: [
              ["ID 12121, phones: '0911 22 33 44, 0912 55 66 77'", "(ID 12121, 0911 22 33 44)"],
              ["", "(ID 12121, 0912 55 66 77)"],
            ],
          },
        },
        {
          kind: "note",
          title: "Null belongs to every domain",
          icon: "alert",
          paragraphs: [
            "null means unknown — not zero and not an empty string. Hawi is hired with salary null because the amount is not decided yet.",
            "Ask: is Hawi's salary greater than 70000? Nobody knows, so a condition on null evaluates to unknown. Lecture 3 shows how SQL handles this with three-valued logic.",
          ],
        },
        {
          kind: "example",
          title: "Unordered by definition — a relation is a set",
          lang: "sql",
          expected: "The same 4 rows, twice, in whatever order the engine likes — both are the same relation",
          code: `-- These two queries return the SAME relation (a set of tuples):
SELECT ID, name, dept_name, salary FROM instructor ORDER BY name LIMIT 4;
SELECT ID, name, dept_name, salary FROM instructor ORDER BY salary DESC LIMIT 4;`,
        },
        {
          kind: "note",
          title: "Never rely on row order",
          icon: "info",
          paragraphs: [
            "One order (10101, 12121, 15151…) and another order (22222, 33456, 10101…) are the same relation, because a relation is a set of tuples. Two listings that differ only in row order are equal.",
            "If you need an order, ask for it — as in SQL's order by. Every result you see in this app is a set; the engine's display order is not part of the answer.",
          ],
        },
        {
          kind: "quiz",
          question: "An instructor row is added. What changes?",
          options: ["The schema", "The instance", "The domain of name", "The relation becomes ordered"],
          answer: 1,
          why: "A new tuple changes the instance r(R). The schema (attribute list) is unchanged, domains are unchanged, and relations remain unordered sets.",
        },
      ],
    },
    {
      id: "keys",
      title: "Keys and schema diagrams",
      blurb: "Superkeys, candidate keys, primary keys, foreign keys.",
      sections: [
        {
          kind: "note",
          title: "Superkey: values that identify a unique tuple",
          icon: "key",
          paragraphs: [
            "K is a superkey of R if the values of K identify a unique tuple in every possible instance r(R) — note: every possible instance, not just the rows you happen to see today.",
            "{ID} is a superkey (no two instructors share an ID). {ID, name} is also a superkey, because adding attributes to a superkey keeps it a superkey.",
          ],
        },
        {
          kind: "note",
          title: "Keys come from meaning, not from the rows you see",
          icon: "target",
          paragraphs: [
            "Today all names differ, so {name} looks unique — but next year a second Wu is hired and {name} fails. A key must hold in every possible instance.",
            "This is why the exam always asks about 'every possible instance' and shows you a table where the accidental answer works 'today'.",
          ],
          table: {
            caption: "Why {name} is not a key",
            head: ["ID", "name", "dept_name", "salary"],
            rows: [
              ["10101", "Srinivasan", "Comp. Sci.", "65000"],
              ["12121", "Wu", "Finance", "90000"],
              ["54322", "Wu", "Physics", "70000"],
            ],
          },
        },
        {
          kind: "note",
          title: "Candidate key and primary key",
          icon: "key",
          paragraphs: [
            "A candidate key is a minimal superkey — no attribute can be removed without losing uniqueness. {ID} is a candidate key of instructor; {ID, name} is not, because {ID} already works alone.",
            "The primary key is the candidate key the designer chooses. Choose values that never change and are never null: a student ID beats an email or a phone number. A relation can have several candidate keys, but one primary key. In a recommendation system, logs use user_id, not the user's name.",
          ],
        },
        {
          kind: "note",
          title: "Foreign key: a reference that must resolve",
          icon: "branch",
          paragraphs: [
            "dept_name in instructor is a foreign key referencing department: values must match some dept_name in the referenced relation.",
            "Insert instructor ('54321', 'Hawi', 'Robotics', 70000)? Rejected — Robotics is not in department. The referencing relation (instructor) points at the referenced relation (department).",
          ],
          callout: {
            tone: "exam",
            title: "Schema diagram notation",
            text: "Underlined attributes form the primary key; arrows go from a foreign key to the relation it references. Given rules 'ID unique' and '(name, dept_name) unique', both {ID} and {name, dept_name} are candidate keys — ID alone is minimal, and {ID, name} is only a superkey.",
          },
        },
        {
          kind: "quiz",
          question: "ID is unique, and (name, dept_name) is unique. Neither name nor dept_name alone is unique. Which statement is valid?",
          options: [
            "Only {ID} is a candidate key",
            "{ID} and {name, dept_name} are both candidate keys",
            "{ID, name} is a candidate key",
            "name is a candidate key because it has a value",
          ],
          answer: 1,
          why: "Both stated minimal sets are candidate keys. {ID, name} is unique but not minimal ({ID} already works), and having a value does not make a value unique.",
        },
      ],
    },
    {
      id: "algebra",
      title: "Relational algebra: select and project",
      blurb: "σ picks tuples, Π picks attributes — the two workhorses.",
      sections: [
        {
          kind: "note",
          title: "The six basic operators",
          icon: "list",
          paragraphs: [
            "Relational algebra, tuple relational calculus, and domain relational calculus have the same expressive power. Join, intersection, assignment and aggregation are built from the six basics or added on top.",
          ],
          table: {
            caption: "Basic relational algebra operators",
            head: ["Symbol", "Name", "Inputs", "What it gives back"],
            rows: [
              ["σ", "select (sigma)", "one relation", "the tuples that satisfy a condition"],
              ["Π", "project (pi)", "one relation", "only the listed attributes"],
              ["∪", "union", "two relations", "tuples in either"],
              ["−", "set difference", "two relations", "tuples in the first but not the second"],
              ["×", "Cartesian product", "two relations", "every pair of tuples"],
              ["ρ", "rename (rho)", "one relation", "the same relation under a new name"],
            ],
          },
        },
        {
          kind: "note",
          title: "Selection σ — keep rows",
          icon: "target",
          paragraphs: [
            "σp(r) keeps the tuples where predicate p is true. Example: σ dept_name = 'Physics' (instructor) → Biniam and Fikru. Comparisons: =, ≠, <, ≤, >, ≥; connectives: ∧ and, ∨ or, ¬ not.",
            "The result has the same attributes as r and at most as many tuples. A predicate can also compare two attributes: σ dept_name = building (department) is empty — a perfectly correct answer.",
          ],
        },
        {
          kind: "example",
          title: "σ in SQL: the WHERE clause",
          lang: "sql",
          expected: "Biniam (95000) — Fikru is Physics but 87000 is not above 90000",
          code: `-- σ dept_name = 'Physics' ∧ salary > 90000 (instructor)
SELECT * FROM instructor
WHERE dept_name = 'Physics' AND salary > 90000;`,
        },
        {
          kind: "note",
          title: "Projection Π — keep columns, remove duplicates",
          icon: "layers",
          paragraphs: [
            "Π A1..Ak (r) keeps only the listed attributes and removes duplicate tuples, because relations are sets. Π ID, name, salary (instructor) loses dept_name but no duplicates appear (ID is a key).",
            "Π dept_name (instructor) shrinks 12 tuples to 7 — one per department. SQL keeps duplicates unless you write select distinct; the algebra's Π uses set semantics.",
          ],
        },
        {
          kind: "example",
          title: "Project with and without DISTINCT",
          lang: "sql",
          expected: "12 rows, then 7 rows — algebra's Π matches SELECT DISTINCT",
          code: `SELECT dept_name FROM instructor;               -- 12 rows, SQL keeps duplicates
SELECT DISTINCT dept_name FROM instructor;      -- 7 rows, set semantics`,
        },
        {
          kind: "note",
          title: "Compose from the inside out",
          icon: "branch",
          paragraphs: [
            "Π name (σ dept_name = 'Physics' (instructor)) works like nested functions in Python: evaluate the inner σ first (keep Physics rows), then the outer Π (keep the name column). Result: Biniam, Fikru.",
            "SQL's select does the job of Π, and where does the job of σ: select name from instructor where dept_name = 'Physics'.",
          ],
        },
        {
          kind: "quiz",
          question: "What does Π dept_name (instructor) return, compared to SQL's SELECT dept_name FROM instructor?",
          options: [
            "12 tuples — the same as SQL",
            "7 tuples — duplicates removed, like SELECT DISTINCT",
            "7 tuples — but SQL also gives 7",
            "1 tuple — one per department",
          ],
          answer: 1,
          why: "Algebra's projection uses set semantics: 12 tuples in, 7 out. Ordinary SQL projection uses multiset semantics and keeps all 12 unless you write DISTINCT.",
        },
      ],
    },
    {
      id: "joins",
      title: "Joins and set operations",
      blurb: "From Cartesian product to join; union, intersection, difference.",
      sections: [
        {
          kind: "note",
          title: "Cartesian product: every pair",
          icon: "grid",
          paragraphs: [
            "instructor × teaches pairs every instructor tuple with every teaches tuple: |r| · |s| tuples. On the small classroom example, 3 instructors × 4 teaches tuples = 12 tuples; on the full tables, 12 × 15 = 180.",
            "Almost all of those pairs are nonsense — Mozart paired with Einstein's course. The join keeps only the real ones.",
          ],
        },
        {
          kind: "note",
          title: "Join = product + select that matches keys",
          icon: "branch",
          paragraphs: [
            "Step 1: build instructor × teaches (12 or 180 pairs). Step 2: σ instructor.ID = teaches.ID keeps the matching pairs (3 of 12; 15 of 180). Step 3: project the requested attributes.",
            "Formally: r ⋈θ s = σθ(r × s), where θ is any condition on the attributes of r and s. Tuples with no partner vanish: Mozart and ID 22222 teach nothing on the small tables; Gold, Califieri and Singh teach nothing on the full ones.",
          ],
          table: {
            caption: "Full-table join trace",
            head: ["Stage", "Size", "Reason"],
            rows: [
              ["instructor × teaches", "180 tuples", "12 × 15 candidate pairs"],
              ["σ instructor.ID = teaches.ID", "15 tuples", "one match per recorded assignment"],
              ["Π name, course_id", "15 tuples", "9 distinct instructors teach"],
            ],
          },
        },
        {
          kind: "example",
          title: "Count the product, count the join",
          lang: "sql",
          expected: "pairs = 180, matches = 15 — exactly the slide numbers",
          code: `SELECT COUNT(*) AS pairs FROM instructor, teaches;
SELECT COUNT(*) AS matches
FROM instructor JOIN teaches ON instructor.ID = teaches.ID;`,
        },
        {
          kind: "note",
          title: "Union, intersection, difference",
          icon: "layers",
          paragraphs: [
            "Fall 2017 courses = {CS-101, CS-347, PHY-101}; Spring 2018 courses = {CS-101, CS-315, CS-319, FIN-201, HIS-351, MU-199}.",
            "Union gives courses in either (7 courses — CS-101 appears once). Intersection gives courses in both (only CS-101). Difference r − s gives courses in the first but not the second (CS-347, PHY-101) — and order matters: Spring − Fall gives 5 different courses.",
          ],
          callout: {
            tone: "warn",
            title: "Union compatibility",
            text: "Set operations need the same arity (same number of attributes) and compatible domains, column by column. Also: r ∩ s = r − (r − s), so ∩ is not a basic operator.",
          },
        },
        {
          kind: "quiz",
          question: "A third Spring 2017 section of CS-190 is added. What happens to 'Π course_id (σ Spring 2017 (section))' compared to SQL without DISTINCT?",
          options: [
            "Both change the same way",
            "Algebra still gives {CS-190, EE-181}; SQL without DISTINCT gains another CS-190 row",
            "Both return three CS-190 rows",
            "Nothing changes anywhere",
          ],
          answer: 1,
          why: "Projection uses set semantics (duplicates removed), ordinary SQL projection uses multiset semantics (duplicates kept). Same question, different duplicate behaviour.",
        },
      ],
    },
    {
      id: "plans",
      title: "Rename, aggregation, and equivalent plans",
      blurb: "ρ and ←, aggregates γ, and why equivalent queries differ in cost.",
      sections: [
        {
          kind: "note",
          title: "Assignment and rename",
          icon: "fileText",
          paragraphs: [
            "Assignment ← names a temporary relation variable: Physics ← σ dept_name='Physics' (instructor); Music ← σ dept_name='Music' (instructor); then Physics ∪ Music gives Einstein, Gold, Mozart.",
            "Rename ρ gives a result or its attributes a new name: ρx(E) renames the expression E to x. Needed when one relation is used twice: 'who earns more than Wu?' uses instructor twice, so one copy is renamed w: Π instructor.name (σ instructor.salary > w.salary (instructor × σ w.name='Wu' (ρw(instructor)))).",
          ],
        },
        {
          kind: "note",
          title: "Aggregation γ — with and without grouping",
          icon: "chart",
          paragraphs: [
            "avg, min, max, sum, count work on a multiset of values. γ avg(salary) (instructor) gives 74833.33. Grouped form: dept_name γ avg(salary) (instructor) gives one average per department — Comp. Sci. is (65000+75000+92000)/3 = 77333.",
            "count counts values with duplicates: γ count(course_id) (σ year=2018 (section)) gives 8, but only 7 different courses ran in 2018 — CS-319 ran in two sections. A distinct count counts each value once.",
          ],
        },
        {
          kind: "note",
          title: "Equivalent query plans: filter early",
          icon: "zap",
          paragraphs: [
            "Two expressions are equivalent if they give the same result on any database. σ dept_name='Physics' ∧ salary>90000 (instructor) equals σ dept_name='Physics' (σ salary>90000 (instructor)) — but their work differs.",
            "Query 1 joins first: 12 × 15 = 180 pairs, then filters. Query 2 filters instructor to Physics first, then joins 2 × 15 = 30 pairs. Same answer, far less work. Filter early — the optimizer does this for you (Module 8).",
          ],
        },
        {
          kind: "example",
          title: "Filter early, join later",
          lang: "sql",
          expected: "Both return Biniam and PHY-101 — but the second touches fewer rows on big data",
          code: `-- Query 1: join everything, then filter (180 pairs before filtering)
SELECT i.name, t.course_id
FROM instructor i JOIN teaches t ON i.ID = t.ID
WHERE i.dept_name = 'Physics';

-- Query 2: filter first, then join (30 pairs)
SELECT i.name, t.course_id
FROM (SELECT * FROM instructor WHERE dept_name = 'Physics') AS i
JOIN teaches t ON i.ID = t.ID;`,
        },
        {
          kind: "note",
          title: "Operator cost summary",
          icon: "chart",
          paragraphs: [
            "Know the shape of each operator's cost: linear scans for σ and Π; hashing for set operations; the product and naive join are quadratic O(n·m). n = |r| and m = |s|; hash costs are averages with good hashing; sorting gives O(n log n) in the worst case.",
          ],
          table: {
            caption: "Operator costs",
            head: ["Operator", "Result size", "Simple cost", "Reason"],
            rows: [
              ["σ select", "at most |r|", "O(n)", "test each tuple once"],
              ["Π project", "at most |r|", "O(n) average", "hash to remove duplicates"],
              ["∪ union", "at most |r|+|s|", "O(n+m) average", "hash both, drop duplicates"],
              ["− difference", "at most |r|", "O(n+m) average", "hash s, scan r"],
              ["∩ intersection", "at most min(|r|,|s|)", "O(n+m) average", "hash s, scan r"],
              ["× product", "exactly |r|·|s|", "O(n·m)", "every pair is built"],
              ["⋈ join", "at most |r|·|s|", "O(n·m) naive", "test every pair; Module 8 is faster"],
              ["γ aggregate", "one tuple per group", "O(n) average", "hash on the group attribute"],
            ],
          },
        },
        {
          kind: "note",
          title: "Relational algebra, SQL, and Pandas",
          icon: "branch",
          paragraphs: [
            "Use SQL when data lives in a database; use Pandas for small data in memory; relational algebra is how you check that both are right.",
          ],
          table: {
            caption: "Same idea, three notations",
            head: ["Relational algebra", "SQL", "Pandas"],
            rows: [
              ["σ select", "where", 'df[df.dept_name == "Physics"]'],
              ["Π project", "select distinct", 'df[["ID", "name"]].drop_duplicates()'],
              ["⋈ join", "join ... on", 'pd.merge(instructor, teaches, on="ID")'],
              ["∪ union", "union", "pd.concat([a, b]).drop_duplicates()"],
              ["γ aggregate", "group by", 'df.groupby("dept_name")["salary"].mean()'],
            ],
          },
        },
        {
          kind: "quiz",
          question: "12 instructors (2 from Physics) and 15 teaching records. We need names of Physics instructors who teach. Which plan reduces the data entering the join while preserving the correct result?",
          options: [
            "Filter teaches by nothing; join; project name",
            "σ dept_name = 'Physics' (instructor) first, then join on ID, then project name",
            "Join without the ID matching condition",
            "Project name before the join",
          ],
          answer: 1,
          why: "Filtering instructor to Physics first preserves the teaching requirement and reduces candidate pairs from 180 to 30. Projecting name first would remove the ID the join needs.",
        },
      ],
    },
  ],
  summary: [
    "A relation is an unordered set of tuples over a schema; null means unknown; keys are defined over every possible instance.",
    "Superkeys identify tuples, candidate keys are minimal, one is chosen as primary; foreign keys must match a key in the referenced relation.",
    "σ picks tuples, Π picks attributes, ⋈ matches tuples across relations; ∪, − and ∩ need compatible inputs.",
    "Aggregates collapse a group to one value; count counts duplicates unless you count distinctly.",
    "Equivalent expressions give the same result at different costs — filter early.",
  ],
  examTips: [
    "When asked to prove a relational algebra answer by hand, write the intermediate tables of each operator, innermost first.",
    "Superkey vs candidate key: candidate = minimal superkey. {ID, name} is never a candidate key while {ID} works.",
    "For the 'reduce work entering the join' question, the answer is always: filter the small side first, then join.",
    "The 180 vs 15 numbers (12 × 15 product, 15 matches) come from the real lecture data — recompute them here in the SQL runner.",
  ],
  quiz: [
    {
      q: "Which set of attributes is a superkey but NOT a candidate key of instructor (ID is unique)?",
      options: ["{ID}", "{ID, name}", "{name}", "{salary}"],
      answer: 1,
      why: "{ID, name} identifies tuples (superkey) but is not minimal — {ID} already works — so it is not a candidate key.",
    },
    {
      q: "σ dept_name = building (department) returns what?",
      options: [
        "All departments",
        "Departments whose name equals their building",
        "The empty relation — a correct answer",
        "An error",
      ],
      answer: 2,
      why: "A predicate can compare two attributes of the same tuple. No department name equals its building, so the result is empty — which is a valid relation.",
    },
    {
      q: "r ⋈θ s is defined as…",
      options: ["r ∪ s", "σθ(r × s)", "Πθ(r − s)", "ρθ(r ∩ s)"],
      answer: 1,
      why: "A theta-join is a Cartesian product followed by a selection with the join condition θ.",
    },
    {
      q: "instructor × teaches has 12 × 15 = 180 tuples. How many survive σ instructor.ID = teaches.ID?",
      options: ["12", "15", "9", "180"],
      answer: 1,
      why: "There are 15 recorded assignments; each matches exactly one instructor, so 15 pairs survive. 9 is the number of distinct instructors who teach.",
    },
    {
      q: "Why does the optimizer prefer σ before ⋈ when possible?",
      options: [
        "Selection removes duplicates",
        "Filtering first shrinks the relations, so the join tests far fewer pairs",
        "Joins are illegal before selection",
        "It changes the query's result",
      ],
      answer: 1,
      why: "Filter early: joining 2 × 15 = 30 pairs instead of 12 × 15 = 180 gives the same answer with much less work. Equivalence means the result is unchanged.",
    },
  ],
};
