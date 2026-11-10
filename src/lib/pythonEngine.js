// Live Python engine backed by Pyodide, loaded from CDN on first use.
// The university database is preloaded into a sqlite3 connection so the
// Lecture 3, 4, 7 and 8 Python examples run exactly like the course notebooks.

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let loadPromise = null;

const PRELUDE = `
import sqlite3, sys

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
SEED = open("/seed.sql").read()
LAB_RESET = open("/lab_reset.sql").read()
conn.executescript(SEED)

def run(sql, show=True):
    """Run a SQL string on the university database and print results
    in the same style as the course notebooks."""
    cur = conn.execute(sql)
    rows = cur.fetchall()
    if cur.description is None:
        conn.commit()
        if show:
            print("Statement executed. Rows changed:", conn.total_changes % 100000 or "n/a")
        return rows
    if show:
        print(" | ".join(d[0] for d in cur.description))
        for row in rows:
            print(" | ".join("" if v is None else str(v) for v in row))
    return rows

def reset_lab():
    """Restore the practice (lab_*) tables to their original lecture state."""
    conn.executescript(LAB_RESET)
    print("lab tables reset")

`;

async function injectScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not download the Python engine. Check your internet connection and try again."));
    document.head.appendChild(s);
  });
}

async function load() {
  if (pyodide) return pyodide;
  if (!loadPromise) {
    loadPromise = (async () => {
      await injectScript(PYODIDE_URL + "pyodide.js");
      if (typeof loadPyodide !== "function") {
        throw new Error("Python engine did not initialise.");
      }
      const py = await loadPyodide({ indexURL: PYODIDE_URL });
      // sqlite3 (and pandas) are "unvendored" in modern Pyodide — load explicitly.
      await py.loadPackage("sqlite3");
      const seedMod = await import("../data/seed.js");
      py.FS.writeFile("/seed.sql", seedMod.SEED_SQL, { encoding: "utf8" });
      py.FS.writeFile("/lab_reset.sql", seedMod.LAB_RESET_SQL, { encoding: "utf8" });
      py.runPython(PRELUDE);
      pyodide = py;
      return py;
    })().catch((e) => {
      loadPromise = null;
      throw e;
    });
  }
  return loadPromise;
}

// Runs Python source, capturing stdout. Returns { output } or throws.
export async function runPython(code) {
  const py = await load();
  // Pandas examples (Lecture 8): load pandas on demand only.
  if (/\bimport\s+pandas|from\s+pandas\b/.test(code) && !py.runPython("import sys; 'pandas' in sys.modules")) {
    await py.loadPackage("pandas");
  }
  let out = "";
  py.setStdout({ batched: (s) => (out += s + "\n") });
  py.setStderr({ batched: (s) => (out += s + "\n") });
  try {
    await py.runPythonAsync(code);
    return { output: out.trimEnd() || "(no output — remember to print your results)" };
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    // Show only the tail of long Python tracebacks
    const lines = msg.trim().split("\n");
    const tail = lines.slice(-6).join("\n");
    const err = new Error(tail);
    err.displayMessage = tail;
    throw err;
  }
}

export async function pythonReady() {
  await load();
  return true;
}
