# CS2030 Exam Prep — Database Systems

An interactive study app built from the 8 lectures of **CS2030: Database Systems**
(Shaggar Institute of Technology). It turns every slide deck into a guided learning
path with live code, progress tracking, and exam practice — no account needed.

**Midterm I · November 11, 2026 · covers Lectures 1–8.**

## What's inside

| Page | What it does |
| --- | --- |
| **Home** (`#/`) | Landing page with the study path, lecture cards, and quick links |
| **Dashboard** (`#/dashboard`) | Overall progress ring, exam countdown, per-lecture completion bars, quiz scores, code-run counter |
| **Lectures** (`#/lectures`) | All 8 lectures with progress at a glance |
| **Lecture page** (`#/lectures/<slug>`) | Each lecture split into **parts** with a sticky parts rail, **Previous / Next** buttons, per-part completion checkboxes, notes with tables & callouts, **live SQL and Python examples**, a summary, exam tips, and a **scored 5-question quiz** |
| **Practice Exam** (`#/exam`) | 40 questions drawn from all lectures in random order, with instant scoring and full explanations |
| **Cheat Sheet** (`#/cheatsheet`) | Every must-remember table (three-valued logic, constraints, join counts, ACID, ranking rules, OLAP costs…) plus the exam-day checklist |
| **Glossary** (`#/glossary`) | 70+ searchable, lecture-filterable definitions |

### Live code engines

- **SQL** — a real SQLite engine (sql.js, WebAssembly) **bundled with the app**, pre-seeded
  with the lecture's full university database (department, instructor, course, prereq,
  section, teaches + the `lab_*` practice tables). Works offline.
- **Python** — a real CPython engine (Pyodide) loaded on first use, with the same
  university database preloaded into `conn`, plus `run(sql)` and `reset_lab()` helpers
  so the Lecture 3/4/7/8 notebook examples run exactly as taught. `pandas` loads on
  demand for the Lecture 8 examples (needs internet the first time).

Every code block is editable — change the query, press **Run** (or **Ctrl + Enter**),
and the result renders as a table. **Reset** restores the original code; **Reset DB**
restores the whole practice database.

### Progress (no account)

Progress is stored in the browser's `localStorage` (`cs2030-progress-v1`): completed
parts, quiz best scores, practice-exam best, last visited part, and theme. The
Dashboard has a **Reset progress** button.

### Design

- **Space Grotesk** for UI text, **Cascadia Mono / Cascadia Code** for code
  (bundled locally via Fontsource — no CDN needed for fonts).
- Light mode by default with a dark-mode toggle (moon/sun in the navbar).
- All icons are hand-drawn inline SVGs — no emoji, no keyboard glyphs.
- Animations: page fades, rising cards, animated progress bars and donut, floating
  hero blobs, pop-in checkmarks.

## Run it

```bash
npm install
npm run dev        # dev server → http://localhost:5173
```

## Build & deploy

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve dist/ locally to check
```

Deploy the `dist/` folder to any static host:

- **GitHub Pages** — push `dist/` to a `gh-pages` branch (or use a Pages action).
  Routing uses `HashRouter` and relative asset paths (`base: "./"`), so it works
  from any subpath without server rewrites.
- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`,
  publish directory `dist`. No special settings needed (hash routing means no
  SPA rewrites required).

Notes:

- The SQL engine is bundled and works fully offline.
- The Python engine downloads from the jsDelivr CDN on first use (~10 MB, cached by
  the browser afterwards); `pandas` (~12 MB) downloads only when a pandas example
  first runs. Everything else works offline.

## Project structure

```
src/
  data/
    seed.js                  # the university database (SQL seed + lab reset)
    glossary.js  cheatsheet.js
    lectures/
      index.js               # lecture list + course facts
      lecture01.js … lecture08.js   # all content: parts, notes, examples, quizzes
  lib/
    progress.jsx             # localStorage progress store (React context)
    sqlEngine.js             # sql.js (bundled SQLite) runner
    pythonEngine.js          # Pyodide loader + runner
  components/
    Icons.jsx                # hand-drawn SVG icon set
    ui.jsx                   # DataTable, Callout, CodeBlock, ProgressBar
    CodeRunner.jsx           # editable, runnable code editor
    QuizCard.jsx  SectionRenderer.jsx  Navbar.jsx
  pages/
    Home.jsx  Dashboard.jsx  Lectures.jsx  LecturePage.jsx
    Exam.jsx  CheatSheet.jsx GlossaryPage.jsx
  styles/global.css          # design system (light + dark themes)
```

## Editing content

All teaching content lives in `src/data/lectures/lecture0X.js`. Each lecture is a
plain object: `parts → sections` where a section is a `note` (paragraphs, table,
callout, static code), an `example` (runnable `sql` or `python` code + expected
result), or an inline `quiz`. Each lecture also has `objectives`, `summary`,
`examTips`, and five scored `quiz` questions that also feed the Practice Exam page.
Edit any file and the app updates — no other wiring needed.

---

Built from the lecture slides of Hana L. Goshu, CS2030 · Shaggar Institute of Technology.
