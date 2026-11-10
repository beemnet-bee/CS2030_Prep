// Lecture 6 — Transactions, Constraints, and Access
export const lecture06 = {
  num: 6,
  slug: "transactions-constraints-access",
  title: "Transactions, Constraints, and Access",
  tagline: "Keep changes reliable with ACID, encode relationship policies, and grant only what is needed.",
  minutes: 30,
  icon: "shield",
  objectives: [
    "Group changes with COMMIT and ROLLBACK",
    "Choose referential actions and checking times",
    "Use suitable types and defaults",
    "Explain index benefits and costs",
    "Grant only the required privileges",
  ],
  parts: [
    {
      id: "transactions",
      title: "Transactions",
      blurb: "Treat related statements as one unit of work.",
      sections: [
        {
          kind: "note",
          title: "A transfer with two changes",
          icon: "box",
          paragraphs: [
            "Biniam has 600 and Fikru has 400. A transfer of 100 birr debits Biniam and credits Fikru: both changes succeed, or neither change remains — the total stays 1000 either way.",
            "Two separate UPDATE statements are two separate opportunities to fail. A transaction makes them one unit of work.",
          ],
          table: {
            caption: "The intended transfer",
            head: ["Account", "Before", "After transfer"],
            rows: [
              ["Biniam", "600", "500"],
              ["Fikru", "400", "500"],
              ["Total", "1000", "1000"],
            ],
          },
        },
        {
          kind: "example",
          title: "COMMIT makes the transfer permanent",
          lang: "sql",
          expected: "Biniam 500, Fikru 500 — both changes applied together",
          code: `BEGIN;
UPDATE lab_account SET balance = balance - 100 WHERE name = 'Biniam';
UPDATE lab_account SET balance = balance + 100 WHERE name = 'Fikru';
COMMIT;`,
        },
        {
          kind: "note",
          title: "COMMIT keeps, ROLLBACK undoes",
          icon: "history",
          paragraphs: [
            "Successful completion: after BEGIN the debit shows 500/400 (total 900, pending), the credit shows 500/500 (total 1000, pending), and COMMIT makes them permanent. Other sessions never see the pending states.",
            "Cancellation: debit applied, then ROLLBACK instead of COMMIT → Biniam back to 600, Fikru back to 400. Every change since BEGIN is undone, including rows written by triggers.",
          ],
          table: {
            caption: "Two traces from the lecture",
            head: ["Step", "Commit path (Biniam, Fikru)", "Rollback path (Biniam, Fikru)"],
            rows: [
              ["Before BEGIN", "600, 400", "600, 400"],
              ["After debit", "500, 400 (pending)", "500, 400 (pending)"],
              ["After credit / ROLLBACK", "500, 500 (pending)", "600, 400 (restored)"],
              ["After COMMIT", "500, 500 — kept", "—"],
            ],
          },
        },
        {
          kind: "example",
          title: "ROLLBACK undoes everything since BEGIN",
          lang: "sql",
          expected: "Biniam 600, Fikru 400 — as if nothing happened",
          code: `BEGIN;
UPDATE lab_account SET balance = balance - 100 WHERE name = 'Biniam';
ROLLBACK;
SELECT * FROM lab_account ORDER BY name;`,
        },
        {
          kind: "note",
          title: "The ACID properties",
          icon: "shield",
          paragraphs: [
            "Atomicity: all intended changes commit, or none remain. Consistency: declared invariants are preserved. Isolation: concurrent transactions are controlled. Durability: committed data survives failures.",
            "These four words connect straight back to Lecture 1's problems: half-finished updates (atomicity), lost updates (isolation), rules (consistency), power failures (durability).",
          ],
          table: {
            caption: "ACID",
            head: ["Property", "Practical meaning"],
            rows: [
              ["Atomicity", "all intended changes commit, or none remain"],
              ["Consistency", "declared invariants are preserved"],
              ["Isolation", "concurrent transactions are controlled"],
              ["Durability", "committed data survives failures"],
            ],
          },
          callout: {
            tone: "warn",
            title: "Habits at boundaries",
            text: "Several related changes → use an explicit boundary. Statement failure → handle the error and rollback as appropriate. COMMIT failure → do not report success. Application validation → check affected rows and business rules yourself.",
          },
        },
        {
          kind: "quiz",
          question: "Biniam has 600, Fikru has 400. Only Biniam is debited 100, then ROLLBACK runs. Final balances?",
          options: ["500 and 500", "600 and 400", "500 and 400", "600 and 500"],
          answer: 1,
          why: "ROLLBACK restores everything since BEGIN: Biniam back to 600, Fikru never touched at 400. That is atomicity — all or nothing.",
        },
      ],
    },
    {
      id: "refactions",
      title: "Advanced constraints",
      blurb: "Preserve relationships as related rows change.",
      sections: [
        {
          kind: "note",
          title: "A parent and its members",
          icon: "branch",
          paragraphs: [
            "lab_parent holds projects (1 Vision, 2 Language); lab_child holds members (11 Biniam, 12 Fikru in project 1; 13 Tinsae in project 2). parent_id in lab_child references lab_parent(ID).",
            "The question: what should happen to members when their project changes or disappears? The referential actions encode that policy.",
          ],
          table: {
            caption: "lab_parent / lab_child data",
            head: ["lab_parent", "lab_child"],
            rows: [
              ["1 · Vision", "11 · Biniam · parent 1"],
              ["2 · Language", "12 · Fikru · parent 1"],
              ["", "13 · Tinsae · parent 2"],
            ],
          },
        },
        {
          kind: "note",
          title: "The four referential actions",
          icon: "list",
          paragraphs: [
            "CASCADE: delete children (or update their foreign keys) along with the parent. SET NULL: clear the foreign key — allowed only if the column permits NULL. SET DEFAULT: use a default that still satisfies the constraint. RESTRICT / NO ACTION: reject an unresolved reference; they differ in checking time.",
            "Choose deliberately: membership that depends on its project → CASCADE; an optional supervisor removed → SET NULL.",
          ],
          table: {
            caption: "Referential actions",
            head: ["Action", "Effect on a parent change"],
            rows: [
              ["CASCADE", "delete children or update their foreign keys"],
              ["SET NULL", "clear the foreign key; NULL must be allowed"],
              ["SET DEFAULT", "use a default that still satisfies the constraint"],
              ["RESTRICT / NO ACTION", "reject an unresolved reference; timing differs"],
            ],
          },
        },
        {
          kind: "example",
          title: "CASCADE in action: delete project 1",
          lang: "sql",
          expected: "Only Tinsae (project 2) remains — Biniam and Fikru cascade away with Vision",
          code: `-- lab_child was created with:
--   parent_id INTEGER NOT NULL REFERENCES lab_parent(ID)
--   ON DELETE CASCADE ON UPDATE CASCADE
DELETE FROM lab_parent WHERE ID = 1;
SELECT ID, name, parent_id FROM lab_child ORDER BY ID;`,
        },
        {
          kind: "note",
          title: "Immediate vs deferred constraint checking",
          icon: "clock",
          paragraphs: [
            "Immediate foreign key (the default): each statement is checked as it runs — inserting a child before its parent fails on the spot; repair the ordering first.",
            "Deferred foreign key (DEFERRABLE INITIALLY DEFERRED): temporary mismatches are allowed inside the transaction; the parent must exist by COMMIT. Deferral changes when a rule is checked, not the rule itself.",
          ],
          code: {
            lang: "sql",
            code: `CREATE TABLE lab_deferred (
  ID INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES lab_parent(ID)
    DEFERRABLE INITIALLY DEFERRED
);
BEGIN;
INSERT INTO lab_deferred VALUES (1, 3);      -- parent 3 does not exist yet
INSERT INTO lab_parent VALUES (3, 'Mapping'); -- arrives before COMMIT
COMMIT;                                       -- reference is valid at COMMIT`,
          },
          callout: {
            tone: "warn",
            title: "But COMMIT still checks",
            text: "If parent 3 is still missing when COMMIT runs, COMMIT fails because the reference is unresolved. The database never invents a parent and never deletes the child to fix it.",
          },
        },
        {
          kind: "note",
          title: "Row rules vs database-wide rules",
          icon: "layers",
          paragraphs: [
            "Balance is nonnegative → CHECK on the row. Member refers to a project → FOREIGN KEY. 'Total recorded credits matches completed courses' spans many rows → a database-wide rule; CREATE ASSERTION is the SQL concept, but neither SQLite nor PostgreSQL implements it — real systems enforce it with triggers or application logic.",
          ],
        },
        {
          kind: "quiz",
          question: "A child must be inserted before its required parent, in one transaction. Which mechanism allows this?",
          options: ["ON DELETE CASCADE", "SET NULL", "A deferred foreign key", "A CHECK constraint"],
          answer: 2,
          why: "A DEFERRABLE INITIALLY DEFERRED foreign key tolerates the temporary mismatch inside the transaction, provided the parent exists at COMMIT.",
        },
      ],
    },
    {
      id: "types",
      title: "Types and defaults",
      blurb: "Store values with the meaning the application needs.",
      sections: [
        {
          kind: "note",
          title: "Dates, times, and durations",
          icon: "calendar",
          paragraphs: [
            "DATE is a calendar day: DATE '2020-02-28'. TIME is a time of day: TIME '09:30:00'. TIMESTAMP is date and time together. INTERVAL is a duration: INTERVAL '1 day'.",
            "SQLite stores dates as TEXT and offers functions: date('2020-02-28', '+1 day') gives 2020-02-29 (a leap year!), and strftime('%Y', '2020-02-28') gives 2020.",
          ],
          table: {
            caption: "Temporal types",
            head: ["Type", "Meaning", "Example literal"],
            rows: [
              ["DATE", "calendar day", "DATE '2020-02-28'"],
              ["TIME", "time of day", "TIME '09:30:00'"],
              ["TIMESTAMP", "date and time", "TIMESTAMP '2020-02-28 09:30:00'"],
              ["INTERVAL", "duration", "INTERVAL '1 day'"],
            ],
          },
        },
        {
          kind: "example",
          title: "Date arithmetic in SQLite",
          lang: "sql",
          expected: "2020-02-29 (2020 is a leap year) and 2020",
          code: `SELECT date('2020-02-28', '+1 day') AS next_date,
       strftime('%Y', '2020-02-28') AS year;`,
        },
        {
          kind: "note",
          title: "DEFAULT fires on omission; NULL stays NULL",
          icon: "alert",
          paragraphs: [
            "Row 1 omits status → the DEFAULT 'draft' fills it. Row 2 explicitly supplies NULL → NULL is stored. Omitted is not the same as NULL.",
            "status TEXT DEFAULT 'draft' with no NOT NULL permits both outcomes — that is exactly what the exam question tests.",
          ],
        },
        {
          kind: "example",
          title: "Omitted vs explicit NULL",
          lang: "sql",
          expected: "Row 1: draft. Row 2: NULL.",
          code: `CREATE TABLE lab_event (
  ID INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'draft'
);
INSERT INTO lab_event (ID) VALUES (1);
INSERT INTO lab_event (ID, status) VALUES (2, NULL);
SELECT ID, status FROM lab_event ORDER BY ID;`,
        },
        {
          kind: "note",
          title: "Large objects, domains, and enum types",
          icon: "box",
          paragraphs: [
            "Images and audio bytes are binary large objects (SQLite BLOB, PostgreSQL BYTEA); long document text is a character large object (TEXT); externally stored files are handled by a controlled URI plus checks. Choose database or external storage deliberately and protect access to both.",
            "A domain names a reusable base type and rule: CREATE DOMAIN nonnegative_amount AS NUMERIC(12,2) CHECK (VALUE >= 0) — a PostgreSQL example; SQLite has no CREATE DOMAIN. An enum type restricts values to an explicit set of labels: CREATE TYPE project_state AS ENUM ('draft', 'active', 'closed'); allowed states differ from allowed transitions.",
          ],
        },
        {
          kind: "quiz",
          question: "status allows NULL and has DEFAULT 'draft'. Row 1 omits status; row 2 supplies NULL. Stored values?",
          options: ["draft and NULL", "draft and draft", "NULL and NULL", "The second insert is rejected"],
          answer: 0,
          why: "Omission applies the default; an explicit NULL is stored as NULL. They are different operations with different results.",
        },
      ],
    },
    {
      id: "indexes",
      title: "Indexes",
      blurb: "Support common access patterns without changing query meaning.",
      sections: [
        {
          kind: "note",
          title: "Table scan vs index lookup",
          icon: "search",
          paragraphs: [
            "A table scan inspects rows one by one and tests the condition. An index lookup locates matching keys first, then fetches only the needed rows — like using a textbook's back-of-book index instead of reading every page.",
            "The optimizer chooses the approach based on size, selectivity and cost. An ordinary index changes access, never the logical result.",
          ],
        },
        {
          kind: "example",
          title: "An index for a frequent pattern",
          lang: "sql",
          expected: "Biniam — same result as before, potentially found faster",
          code: `CREATE INDEX idx_dept_salary ON instructor (dept_name, salary);
SELECT name FROM instructor
WHERE dept_name = 'Physics' AND salary > 90000
ORDER BY name;
DROP INDEX idx_dept_salary;`,
        },
        {
          kind: "note",
          title: "Column order in a composite index matters",
          icon: "list",
          paragraphs: [
            "Index columns follow the query pattern: equality columns first, then range columns. (dept_name) serves department equality; (dept_name, salary) serves department equality + salary range; (salary) alone serves salary ranges across all departments.",
            "An index does not guarantee output order — a final ORDER BY is still the only promised order.",
          ],
          table: {
            caption: "Query pattern → candidate index",
            head: ["Query pattern", "Candidate index"],
            rows: [
              ["Department equality", "(dept_name)"],
              ["Department equality and salary range", "(dept_name, salary)"],
              ["Salary range across all departments", "(salary)"],
              ["No final ORDER BY", "no guaranteed output order"],
            ],
          },
        },
        {
          kind: "note",
          title: "Indexes cost storage and write work",
          icon: "alert",
          paragraphs: [
            "Benefits: faster selective reads for the queries the index was designed for. Costs: additional storage, and every INSERT/UPDATE/DELETE must also maintain the index.",
            "Design questions: which frequent queries benefit? Is the benefit worth the space? How often do indexed values change? DROP INDEX removes the access structure, not the data.",
          ],
          callout: {
            tone: "exam",
            title: "The exact exam statement",
            text: "“An ordinary, non-unique index is added on (dept_name, salary) to a table with frequent INSERTs.” Correct answer: logical results stay the same, but inserts must also maintain the index. Not: every query becomes faster; not: output is sorted; not: CHECK constraints become unnecessary.",
          },
        },
        {
          kind: "quiz",
          question: "A frequent-INSERT table gains an index on (dept_name, salary). Which statement is correct?",
          options: [
            "Every query is guaranteed to become faster",
            "Query output is now sorted without ORDER BY",
            "CHECK constraints are no longer necessary",
            "Logical results stay the same, but inserts must also maintain the index",
          ],
          answer: 3,
          why: "An index changes access, not meaning. Reads on suitable patterns may speed up, but every write now pays index maintenance, and results/order guarantees are unchanged.",
        },
      ],
    },
    {
      id: "authorization",
      title: "Authorization",
      blurb: "Give each role only the access it needs.",
      sections: [
        {
          kind: "note",
          title: "The four core privileges",
          icon: "key",
          paragraphs: [
            "SELECT: read permitted rows and columns. INSERT: add rows. UPDATE: change permitted values. DELETE: remove rows. Each is granted per table (or view), and can be column-specific.",
          ],
          table: {
            caption: "Privileges",
            head: ["Privilege", "Typical action"],
            rows: [
              ["SELECT", "read permitted rows and columns"],
              ["INSERT", "add rows"],
              ["UPDATE", "change permitted values"],
              ["DELETE", "remove rows"],
            ],
          },
        },
        {
          kind: "note",
          title: "Roles group privileges",
          icon: "users",
          paragraphs: [
            "Create a role, grant the role privileges, then grant the role to accounts: CREATE ROLE biniam LOGIN; GRANT course_reader TO biniam; REVOKE course_reader FROM biniam. Authentication (the login itself) is configured separately from authorization.",
            "PostgreSQL example for a directory reader: GRANT USAGE ON SCHEMA public TO course_reader; GRANT SELECT ON faculty_directory TO course_reader.",
          ],
        },
        {
          kind: "note",
          title: "A view grant does not revoke table rights",
          icon: "alert",
          paragraphs: [
            "Biniam can already SELECT all columns of instructor, including salary. Granting him SELECT on faculty_directory (which omits salary) hides nothing — his existing table privilege still permits reading salary.",
            "Access must be checked through every path: direct grants, other role memberships, and PUBLIC grants. REVOKE is not DROP — it removes privileges, not objects.",
          ],
          callout: {
            tone: "exam",
            title: "The exact exam statement",
            text: "“Biniam has SELECT on instructor including salary; he is also granted SELECT on faculty_directory.” Correct answer: No — his existing table privilege still permits reading salary. A view grant never removes a base-table privilege.",
          },
        },
        {
          kind: "note",
          title: "Delegation and dependent grants",
          icon: "branch",
          paragraphs: [
            "WITH GRANT OPTION lets the recipient grant that privilege onward. Taking it back: REVOKE … RESTRICT refuses when dependent grants block removal; REVOKE … CASCADE removes grants that depend on this grant. An independent access path may still preserve the privilege.",
          ],
          table: {
            caption: "Delegation clauses",
            head: ["Clause", "Meaning"],
            rows: [
              ["WITH GRANT OPTION", "recipient may grant that privilege onward"],
              ["REVOKE ... RESTRICT", "refuse when dependent grants block removal"],
              ["REVOKE ... CASCADE", "remove grants depending on this grant"],
              ["Independent access path", "may still preserve the privilege"],
            ],
          },
        },
        {
          kind: "note",
          title: "SQLite notebook vs PostgreSQL server",
          icon: "info",
          paragraphs: [
            "Transactions and constraints and CREATE INDEX work in both. GRANT, REVOKE and roles are not implemented in SQLite — its access boundary is the application and file access; a server database uses accounts and privileges.",
          ],
          table: {
            caption: "Feature comparison",
            head: ["Feature", "SQLite notebook", "PostgreSQL server"],
            rows: [
              ["Transactions and constraints", "available", "available"],
              ["CREATE INDEX", "available", "available"],
              ["GRANT, REVOKE, roles", "not implemented", "available"],
              ["Access boundary", "application and file access", "database accounts and privileges"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Does granting a user SELECT on a view that omits salary hide salary from them?",
          options: [
            "Yes — the view grant removes their table privilege",
            "Yes — the view replaces stored salaries with NULL",
            "No — their existing table privilege still permits reading salary",
            "No — every view must include every column",
          ],
          answer: 2,
          why: "Grants are cumulative. The view omits salary, but the user can still query the base table directly through the existing grant. Revoke the base-table privilege and check every other access path.",
        },
      ],
    },
  ],
  summary: [
    "Transactions group related changes: COMMIT keeps them, ROLLBACK undoes them, and ACID names the guarantees.",
    "Referential actions encode relationship policies: CASCADE, SET NULL, SET DEFAULT, RESTRICT/NO ACTION; deferred checks move the check to COMMIT, not away.",
    "Types and defaults have distinct responsibilities: omission applies DEFAULT, explicit NULL stays NULL.",
    "Indexes trade read benefits for maintenance costs and never change logical results.",
    "Roles receive only required privileges; a view grant never removes a base-table privilege; REVOKE has RESTRICT and CASCADE forms.",
  ],
  examTips: [
    "Rollback question: ROLLBACK restores the pre-BEGIN state — balances 600/400, trigger log rows gone.",
    "Deferred FK question: 'COMMIT fails because the reference is unresolved' — the database never deletes or creates rows to fix it.",
    "Defaults question: omitted → draft, explicit NULL → NULL. Two rows, two answers.",
    "Index question: results identical, writes pay maintenance. Authorization question: grants are cumulative — check all access paths.",
  ],
  quiz: [
    {
      q: "Which SQL keyword makes the effects of BEGIN … statements permanent?",
      options: ["SAVE", "COMMIT", "GRANT", "CHECK"],
      answer: 1,
      why: "COMMIT ends the transaction successfully and makes the changes durable; ROLLBACK would undo them.",
    },
    {
      q: "Membership rows become meaningless when their project is deleted. Which declaration expresses this?",
      options: ["ON DELETE SET NULL", "ON DELETE CASCADE", "DEFERRABLE INITIALLY DEFERRED", "WITH GRANT OPTION"],
      answer: 1,
      why: "CASCADE deletes the dependent children along with the parent — the right policy when membership has no meaning without its project.",
    },
    {
      q: "Which constraint type is the right tool for 'balance is nonnegative'?",
      options: ["FOREIGN KEY", "CHECK", "UNIQUE", "GRANT"],
      answer: 1,
      why: "A CHECK constrains each row's value. 'Total credits match courses' spans rows — that would be a database-wide rule (assertion concept).",
    },
    {
      q: "ROLLBACK undoes an UPDATE that fired a trigger inserting a log row. What happens to the log row?",
      options: [
        "It is rolled back with the update",
        "It remains permanently",
        "It moves to another table",
        "It commits before the update",
      ],
      answer: 0,
      why: "The trigger action belongs to the same transaction as the update — ROLLBACK undoes both together.",
    },
    {
      q: "How is a PostgreSQL procedure invoked?",
      options: ["SELECT add_salary", "TRIGGER add_salary", "GRANT add_salary", "CALL add_salary"],
      answer: 3,
      why: "Procedures are invoked explicitly with CALL. Functions are used inside expressions or FROM; triggers fire on data events.",
    },
  ],
};
