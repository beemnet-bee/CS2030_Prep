// Lecture 1 — Introduction to Database Systems
export const lecture01 = {
  num: 1,
  slug: "intro-to-databases",
  title: "Introduction to Database Systems",
  tagline: "What a DBMS is, why plain files fail, and what is inside the engine.",
  minutes: 25,
  accent: "#6366f1",
  icon: "database",
  objectives: [
    "Explain what a database system is",
    "Name the problems of plain files",
    "Describe the three levels of abstraction",
    "Tell a schema from an instance, DDL from DML",
    "Name the engine's parts and its users",
  ],
  parts: [
    {
      id: "why",
      title: "Why database systems matter",
      blurb: "What a database system is, where it is used, and how this course runs.",
      sections: [
        {
          kind: "note",
          title: "Registration day needs a database system",
          icon: "users",
          paragraphs: [
            "Picture registration day: 5,000 students log in at once. Every seat must be counted exactly once, no registration may be lost if the power fails, and each student may see only their own record. Ordinary programs struggle to guarantee all three at the same time.",
            "A database management system (DBMS) is the software built for exactly this situation. The definition to memorise: a DBMS is interrelated data plus programs that access it, in a convenient and efficient way.",
          ],
          callout: {
            tone: "exam",
            title: "Definition worth one mark",
            text: "Write it as: interrelated data + programs that access it, conveniently and efficiently. The examiners look for both halves — the data and the access programs.",
          },
        },
        {
          kind: "note",
          title: "Databases run everyday services, and AI too",
          icon: "zap",
          paragraphs: [
            "Banks, mobile money, university registration, airlines and shops all rest on database systems — anything where many users read and change shared data at once.",
            "The same tables power modern AI: training data, features and model logs live in tables, and chatbots search vector databases (Module 11 of this course covers that).",
          ],
        },
        {
          kind: "note",
          title: "From Python files to database systems",
          icon: "branch",
          paragraphs: [
            "Last term you kept data in lists, dictionaries and CSV files. This term you learn to store data safely for many users at once, ask questions of data with SQL, design good tables for a real problem, and build the data layer behind AI systems.",
          ],
        },
        {
          kind: "quiz",
          question: "On registration day, which promise is about atomicity?",
          options: [
            "Every seat is counted exactly once",
            "No registration is lost if the power fails",
            "Each student sees only their own record",
            "The list of courses is sorted",
          ],
          answer: 1,
          why: "Atomicity means a transaction is all or nothing: if the power fails mid-registration, the half-finished change is undone, so no registration is lost or half applied. Exact counting is concurrency control, and private records are security.",
        },
      ],
    },
    {
      id: "files",
      title: "Why not just use files?",
      blurb: "The seven problems that database systems were built to solve.",
      sections: [
        {
          kind: "note",
          title: "Our running example: a university database",
          icon: "database",
          paragraphs: [
            "Throughout the course we store data about students, instructors, courses and classes, and programs use it to add records, register students, print rosters, assign grades, compute GPA and print transcripts.",
            "Every example in this app runs against that same university database — the SQL runner has it preloaded, so you can experiment freely.",
          ],
        },
        {
          kind: "note",
          title: "Files repeat data, and the copies disagree",
          icon: "fileText",
          paragraphs: [
            "With files, the registrar's CSV and the finance CSV each keep their own copy of a student's phone number. When Abebe changes his phone and only one file is updated, the copies stop matching.",
            "Redundancy means the same data is stored in many files; inconsistency means the copies drift apart. In a database the phone number is stored once, and every program reads that one shared copy.",
          ],
          table: {
            caption: "Two files, two truths",
            head: ["student_id", "registrar file: phone", "finance file: phone"],
            rows: [
              ["S101 (Abebe)", "0911 22 33 44", "0913 99 88 77"],
              ["S102 (Hawi)", "0912 55 66 77", "0912 55 66 77"],
            ],
          },
          callout: {
            tone: "tip",
            title: "Data isolation makes it worse",
            text: "Many files in many formats is data isolation: every new question needs to learn a new format first.",
          },
        },
        {
          kind: "example",
          title: "Every question needs code — or one query",
          lang: "python",
          expected: "Almaz, Getachew — the Comp. Sci. instructors earning 75000 or more",
          code: `# With files, every question is a new program:
rows = [
    {"id": "10101", "name": "Tinsae",    "dept": "Comp. Sci.", "salary": 65000},
    {"id": "45565", "name": "Getachew",  "dept": "Comp. Sci.", "salary": 75000},
    {"id": "83821", "name": "Almaz",     "dept": "Comp. Sci.", "salary": 92000},
    {"id": "22222", "name": "Biniam",    "dept": "Physics",    "salary": 95000},
]
result = []
for row in rows:
    if row["dept"] == "Comp. Sci." and row["salary"] >= 75000:
        result.append(row["name"])
print(result)

# In a database, ONE query answers the question:
for (name,) in conn.execute(
    "select name from instructor where dept_name = ? and salary >= ?",
    ("Comp. Sci.", 75000),
):
    print(name)`,
        },
        {
          kind: "note",
          title: "A rule hidden in one program protects no one",
          icon: "shield",
          paragraphs: [
            "Integrity rules live in the data, not in one programmer's head. With files, a rule like a balance cannot go below 0 must be remembered and re-coded by every application that touches balances — and one forgotten program breaks it.",
            "In a database the rule is declared once (check (balance >= 0)) and the DBMS checks it on every write, for every program, forever.",
          ],
        },
        {
          kind: "note",
          title: "Atomicity: a transfer must be all or nothing",
          icon: "box",
          paragraphs: [
            "Move 100 birr from Abebe's account A to Sara's account B. Two steps: take 100 from A, add 100 to B. If the system crashes between the steps, A has already lost 100 birr but B never received them — the total drops from 700 to 600.",
            "A database treats the two steps as one transaction, which is all or nothing. After a crash, step 1 is undone and the total is 700 again. Module 9 shows how logs and recovery make this happen.",
          ],
          table: {
            caption: "Transfer trace — crash between the steps",
            head: ["Stage", "Account A (Abebe)", "Account B (Sara)", "Total"],
            rows: [
              ["Before the transfer", "500", "200", "700"],
              ["After step 1, then a crash", "400", "200", "600 — money lost!"],
              ["After recovery, step 1 undone", "500", "200", "700 — atomicity restored"],
            ],
            highlight: (r) => r === 1,
          },
        },
        {
          kind: "note",
          title: "Concurrent access: the lost update",
          icon: "history",
          paragraphs: [
            "A shared account holds 100 birr. At the same moment, Abebe's app T1 and Sara's app T2 each withdraw 50 birr. Both read the balance (100), then both write 100 − 50 = 50. Two withdrawals of 50 birr happened, but the balance is 50, not 0 — T1's update was lost, and nothing even crashed.",
            "The concurrency control manager prevents this by making T2 wait until T1 has finished: T1 reads 100 and writes 50; then T2 reads 50 and writes 0. Final balance 0, which is correct. Module 9 shows how locks do this without making everyone wait too long.",
          ],
          table: {
            caption: "Without concurrency control (wrong) vs with it (right)",
            head: ["Step", "Without control (T1, T2)", "Balance"],
            rows: [
              ["1", "T1 reads 100; T2 reads 100", "100"],
              ["2", "T1 writes 100 − 50 = 50", "50"],
              ["3", "T2 writes 100 − 50 = 50 (T1 lost)", "50 — wrong"],
              ["Correct flow", "T2 waits; then reads 50, writes 0", "0 — correct"],
            ],
          },
        },
        {
          kind: "note",
          title: "Seven problems, seven database solutions",
          icon: "list",
          paragraphs: [
            "This table is the backbone of Lecture 1 — most exam questions about 'why databases' are one of these seven rows in disguise.",
          ],
          table: {
            caption: "Memorise this table",
            head: ["Problem", "With plain files", "With a database system"],
            rows: [
              ["Redundancy, inconsistency", "copies drift apart", "one shared copy"],
              ["Difficult access", "a new program per question", "one declarative query"],
              ["Data isolation", "many files, many formats", "one data model"],
              ["Integrity", "rules buried in code", "rules declared once, always checked"],
              ["Atomicity", "half-finished updates", "transactions, all or nothing"],
              ["Concurrent access", "lost updates", "concurrency control"],
              ["Security", "all or nothing access", "rights per table and column"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Two offices store a student's address, and the two addresses differ. Which problem is this?",
          options: ["Atomicity", "Redundancy and inconsistency", "Concurrent access", "Difficult access"],
          answer: 1,
          why: "Two stored copies of the same fact is redundancy; the copies disagreeing is inconsistency. One shared copy in a database removes both.",
        },
        {
          kind: "quiz",
          question: "Two agents sell the last airline seat to two different people. Which problem is this?",
          options: ["Integrity", "Atomicity", "Concurrent access", "Data isolation"],
          answer: 2,
          why: "Two programs acting on the same seat at the same moment is the lost-update pattern — concurrency control makes the second agent wait for the first.",
        },
      ],
    },
    {
      id: "models",
      title: "Data models, abstraction, and schemas",
      blurb: "How a database describes data and hides the details.",
      sections: [
        {
          kind: "note",
          title: "A data model is a way to describe data",
          icon: "layers",
          paragraphs: [
            "A data model describes data, relationships, meaning and constraints. The ones to know: relational (tables — our main model), entity-relationship (for design, Module 5), object-based (objects and classes), semi-structured (like JSON), and the older network and hierarchical models.",
          ],
        },
        {
          kind: "note",
          title: "Relational tables connect through shared values",
          icon: "table",
          paragraphs: [
            "Columns are attributes, rows are tuples. Two tables connect through shared values: instructor.dept_name links each instructor to their department row in the department table.",
            "The instructor table has 12 rows (Tinsae, Yohannes, Kidist, Biniam, Eden, Fikru, Getachew, Amare, Mintesinot, Betelhem, Almaz, Hirut) — lectures 1-2 call them by international names (Srinivasan, Wu, Mozart, Einstein...) but the IDs and salaries are identical.",
          ],
          table: {
            caption: "instructor (first 4 of 12 rows) linked by dept_name",
            head: ["ID", "name", "dept_name", "salary", "→ department.budget"],
            rows: [
              ["10101", "Tinsae", "Comp. Sci.", "65000", "100000 (Taylor)"],
              ["12121", "Yohannes", "Finance", "90000", "120000 (Painter)"],
              ["15151", "Kidist", "Music", "40000", "80000 (Packard)"],
              ["22222", "Biniam", "Physics", "95000", "70000 (Watson)"],
            ],
          },
        },
        {
          kind: "note",
          title: "Three levels of abstraction hide the details",
          icon: "layers",
          paragraphs: [
            "The physical level describes how records sit on disk. The logical level describes what is stored and how it relates. The view level describes what each user sees — views can hide data, such as hiding the salary column from a student assistant.",
            "Each level hides the details of the level below it, which is why a user can ask for names without knowing anything about disk pages.",
          ],
        },
        {
          kind: "example",
          title: "Schema vs instance — see it live",
          lang: "sql",
          expected: "12 rows now; hire someone with INSERT and it becomes 13 — schema unchanged, instance changed",
          code: `-- The schema is the design: instructor(ID, name, dept_name, salary)
-- The instance is the rows at one moment. Look at the current instance:
SELECT ID, name, dept_name, salary FROM instructor;

-- Now change the instance (hire Hawi). The schema does not change:
INSERT INTO lab_instructor (ID, name, dept_name, salary)
VALUES ('54321', 'Hawi', 'Comp. Sci.', 70000);
SELECT ID, name, dept_name, salary FROM lab_instructor;`,
        },
        {
          kind: "note",
          title: "Schema is the design, instance is the data now",
          icon: "key",
          paragraphs: [
            "The schema changes rarely (a new column is a design decision); the instance changes all the time (every hire, raise and registration). The instance at 9:00 am and the instance at 10:00 am can differ by a new row — the schema stays the same.",
            "Logical schema means the tables and columns; physical schema means how they are stored on disk.",
          ],
          callout: {
            tone: "exam",
            title: "Classic exam question",
            text: "“What is the difference between a schema and an instance? Give an example.” Answer: the schema is the design, e.g. instructor(ID, name, dept_name, salary); the instance is the rows at one moment, e.g. the 12 instructors today, or 13 after hiring Hawi.",
          },
        },
        {
          kind: "note",
          title: "Physical data independence protects programs",
          icon: "shield",
          paragraphs: [
            "Change the physical schema — say, add an index or move data to a different disk layout — and programs keep working, because programs depend only on the logical schema. This property is physical data independence.",
            "It is the reason a DBA can tune storage all night without waking a single application developer.",
          ],
        },
        {
          kind: "quiz",
          question: "A DBA adds an index to instructor. Why do the apps not need to change?",
          options: [
            "Indexes are written in SQL",
            "Physical data independence — apps use the logical schema",
            "The instance did not change",
            "The DBMS recompiles the apps",
          ],
          answer: 1,
          why: "An index changes only the physical schema. Physical data independence means programs depend on the logical schema alone, so they keep working unchanged.",
        },
      ],
    },
    {
      id: "languages",
      title: "Database languages",
      blurb: "Defining data, asking questions, and connecting from Python.",
      sections: [
        {
          kind: "note",
          title: "DDL defines the structure of the data",
          icon: "fileText",
          paragraphs: [
            "Data definition language (DDL) declares the schema: CREATE TABLE names columns and types. The DDL compiler stores those definitions in the data dictionary, which holds metadata — data about data.",
            "The DBMS consults the dictionary before every query, which is how it knows what columns exist and which rules apply.",
          ],
          code: {
            lang: "sql",
            code: `CREATE TABLE instructor (
    ID         char(5),
    name       varchar(20),
    dept_name  varchar(20),
    salary     numeric(8,2),
    primary key (ID)
);`,
          },
          table: {
            caption: "What the data dictionary records",
            head: ["table", "column", "type", "constraint"],
            rows: [
              ["instructor", "ID", "char(5)", "primary key"],
              ["instructor", "name", "varchar(20)", ""],
              ["instructor", "dept_name", "varchar(20)", ""],
              ["instructor", "salary", "numeric(8,2)", ""],
            ],
          },
        },
        {
          kind: "note",
          title: "Procedural says how, declarative says what",
          icon: "code",
          paragraphs: [
            "A procedural language makes you spell out the steps: loop over rows, test each one, append matches. A declarative language states what you want and lets the system find the steps.",
            "DML (data manipulation language) reads and changes data; the part that reads data is the query language. Pure theoretical languages are relational algebra and relational calculus; the commercial language is SQL. You meet relational algebra in Lecture 2.",
          ],
          callout: {
            tone: "tip",
            title: "One sentence to remember",
            text: "SQL is declarative: you describe the result, the DBMS decides the steps. That is why the same query can run well on a laptop and on a server with better plans.",
          },
        },
        {
          kind: "note",
          title: "An SQL query always returns one table",
          icon: "table",
          paragraphs: [
            "Input: one or more tables. Output: always exactly one table — even if it has zero rows, one row, or many. “select name from instructor where dept_name = 'Comp. Sci.'” turns the 12-row instructor table into a 3-row table of names.",
          ],
        },
        {
          kind: "example",
          title: "Your first SQL query (run it!)",
          lang: "sql",
          expected: "Tinsae, Getachew, Almaz — Comp. Sci. instructors earning over 70000",
          code: `SELECT name
FROM instructor
WHERE dept_name = 'Comp. Sci.'
  AND salary > 70000;`,
        },
        {
          kind: "example",
          title: "How a Python app talks to the database",
          lang: "python",
          expected: "Tinsae, Getachew, Almaz — and note the ? placeholder keeps user input safe",
          code: `query = "SELECT name FROM instructor WHERE dept_name = ?"
for (name,) in conn.execute(query, ("Comp. Sci.",)):
    print(name)

# A host language like Python handles screens and user input.
# The ? placeholder keeps user input safe (Lecture 7 explains why).`,
        },
      ],
    },
    {
      id: "engine",
      title: "Inside the database engine",
      blurb: "Design, engine parts, architectures, users, and history.",
      sections: [
        {
          kind: "note",
          title: "Design decides which tables and columns to have",
          icon: "layers",
          paragraphs: [
            "Logical design asks: which tables and columns? One big table with instructor and department facts repeated wastes space and invites inconsistency; two tables connected by dept_name is cleaner.",
            "It is part business decision (what to record) and part computer-science decision (how to split tables). Physical design decides how to lay data on disk. Modules 5 and 6 teach design properly.",
          ],
        },
        {
          kind: "note",
          title: "The engine has three main parts",
          icon: "grid",
          paragraphs: [
            "The query processor turns queries into plans. The storage manager keeps data on disk and in memory. The transaction manager keeps data correct. Each part hides its details from the others.",
          ],
          table: {
            caption: "Query processor",
            head: ["Component", "Job"],
            rows: [
              ["DDL interpreter", "records definitions in the dictionary"],
              ["DML compiler", "translates and optimises a query into a plan"],
              ["Evaluation engine", "runs the plan and outputs the rows"],
            ],
          },
          table2: {
            caption: "Storage manager",
            head: ["Component", "Job"],
            rows: [
              ["File manager", "handles space on disk"],
              ["Buffer manager", "keeps useful data in memory"],
              ["Authorization & integrity manager", "checks rights and rules"],
              ["Indices", "find rows without reading every row"],
            ],
          },
          callout: {
            tone: "tip",
            title: "Why does a textbook have an index at the back?",
            text: "Same reason a database has indices: to find a topic without reading every page. Exam question favourite — it tests whether you know indices change access speed, not the query result.",
          },
        },
        {
          kind: "note",
          title: "One machine or many",
          icon: "grid",
          paragraphs: [
            "Centralised: one machine with a few cores. Client-server: many clients use one server. Parallel: many cores or machines share the work. Distributed: data is spread across distant sites.",
            "Most web apps use a three-tier architecture: the client (browser), an application server, and the database. In two-tier the app calls the database directly. Keeping database access on the server (no direct database calls from the client) is safer.",
          ],
        },
        {
          kind: "note",
          title: "Who uses a database, and who runs it",
          icon: "users",
          paragraphs: [
            "Five kinds of people surround a database. Know the difference between using apps others wrote (naive), writing those apps (programmers), querying directly (sophisticated), building special data applications (specialised), and owning the whole thing (DBA).",
          ],
          table: {
            caption: "Users of a database system",
            head: ["Person", "What they do", "Example"],
            rows: [
              ["Naive users", "use apps others wrote", "a student registering online"],
              ["Application programmers", "write the apps", "the developer of the registration app"],
              ["Sophisticated users", "query without writing programs", "a data analyst writing SQL"],
              ["Specialized users", "build special data applications", "an AI engineer storing images and audio"],
              ["Database administrator (DBA)", "has central control: defines the schema, grants access, backs up", "the person who owns the design and permissions"],
            ],
          },
        },
        {
          kind: "note",
          title: "Seventy years of database systems",
          icon: "history",
          paragraphs: [
            "1970: Codd proposes the relational model. 1980s: SQL becomes the standard language. 2020s: vector databases help AI systems find information (the 2020s entry is not in the textbook's list — it is what Module 12 covers).",
          ],
        },
        {
          kind: "note",
          title: "When should you use a database system?",
          icon: "target",
          paragraphs: [
            "A database is not always the answer. For one person, small data, one analysis, a CSV with Pandas is simpler. A phone app with local data can use SQLite — a full SQL database in one file. Many concurrent users, money and grades, or huge logs point to a real DBMS or big-data systems.",
          ],
          table: {
            caption: "Choosing storage",
            head: ["Situation", "Good choice", "Why"],
            rows: [
              ["One person, small data, one analysis", "a CSV file with Pandas", "simple, no server needed"],
              ["Many users updating at the same time", "a DBMS like PostgreSQL", "transactions, concurrency control"],
              ["Money, grades, medical records", "a DBMS", "atomicity, integrity, security"],
              ["A phone app with local data", "SQLite", "a full SQL database in one file"],
              ["Huge logs across many machines", "big data systems (Module 11)", "they scale across machines"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "In the lost-update trace, which part of the engine prevents the problem?",
          options: [
            "The DDL interpreter",
            "The buffer manager",
            "The concurrency control manager",
            "The query processor",
          ],
          answer: 2,
          why: "The concurrency control manager, inside transaction management, makes the second withdrawal wait for the first to finish — that is what stops the lost update.",
        },
      ],
    },
  ],
  summary: [
    "A DBMS is interrelated data plus programs that access it, in a convenient and efficient way.",
    "Plain files fail on seven fronts: redundancy, access, isolation, integrity, atomicity, concurrency, security — the DBMS has one answer for each.",
    "Three abstraction levels: physical (disk), logical (what is stored), view (what each user sees); physical data independence keeps apps alive when storage changes.",
    "Schema = the design (rarely changes); instance = the rows right now (always changing). DDL defines structure; DML reads and changes data; SQL is declarative.",
    "The engine = query processor + storage manager + transaction manager; users range from naive users to the DBA.",
  ],
  examTips: [
    "Learn the seven-problems table by heart — questions are usually a story that maps to one row.",
    "Atomicity stories involve a crash and money; concurrency stories involve two apps and no crash. That distinction separates the two answers.",
    "For schema vs instance, always give the instructor example: the design vs the rows at one moment.",
    "Index questions: the answer is physical data independence, and an index never changes the query's result.",
  ],
  quiz: [
    {
      q: "Which of the following best matches the course definition of a DBMS?",
      options: [
        "A programming language for data analysis",
        "Interrelated data plus programs that access it, conveniently and efficiently",
        "A spreadsheet with formulas",
        "Any file that stores records",
      ],
      answer: 1,
      why: "The definition has both halves: the interrelated data and the access programs, used conveniently and efficiently.",
    },
    {
      q: "A crash leaves one account debited but the other never credited. Which problem is this?",
      options: ["Redundancy", "Atomicity", "Security", "Data isolation"],
      answer: 1,
      why: "A half-finished money transfer is the atomicity problem: the transaction must be all or nothing, with step 1 undone after a crash.",
    },
    {
      q: "Every program must remember that credits cannot be negative. Which problem is this?",
      options: ["Integrity", "Concurrent access", "Difficult access", "Redundancy"],
      answer: 0,
      why: "Integrity: the rule is buried in code with files. In a database it is declared once (a CHECK) and always enforced.",
    },
    {
      q: "Which level of abstraction describes what each user sees?",
      options: ["Physical level", "Logical level", "View level", "Storage level"],
      answer: 2,
      why: "View level — views can also hide data, such as salaries, per user group.",
    },
    {
      q: "Which architecture puts an application server between the client and the database?",
      options: ["Centralised", "Two-tier", "Three-tier", "Peer-to-peer"],
      answer: 2,
      why: "Three-tier: client → application server → database. The client makes no direct database calls, which keeps database access on the server and is safer.",
    },
  ],
};
