// Live SQL engine backed by sql.js (SQLite compiled to WebAssembly).
// The wasm binary is bundled with the app, so the SQL runner works offline.
import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { SEED_SQL, LAB_RESET_SQL } from "../data/seed.js";

let db = null;
let initPromise = null;

async function loadEngine() {
  const resp = await fetch(wasmUrl);
  const wasmBinary = await resp.arrayBuffer();
  const SQL = await initSqlJs({ wasmBinary });
  return SQL;
}

async function getDb() {
  if (db) return db;
  if (!initPromise) {
    initPromise = loadEngine().then((SQL) => {
      db = new SQL.Database();
      db.exec("PRAGMA foreign_keys = ON;");
      db.exec(SEED_SQL);
      return db;
    });
  }
  await initPromise;
  return db;
}

export async function resetDatabase() {
  // Full re-seed: drop the engine and rebuild the university database exactly
  // as the lectures define it (lab tables back to their original rows too).
  db = null;
  initPromise = null;
  await getDb();
}

export function isSelect(sql) {
  const m = sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim()
    .toLowerCase();
  return m.startsWith("select") || m.startsWith("with") || m.startsWith("pragma");
}

// Runs SQL against the seeded university database.
// Returns { tables: [{columns, rows}], message, changed }
// or throws { message } on a SQL error.
export async function runSql(sql) {
  const d = await getDb();
  const tables = [];
  let changed = 0;
  let message = null;

  try {
    const results = d.exec(sql); // throws on SQL error; runs every statement
    for (const r of results) {
      tables.push({ columns: r.columns, rows: r.values });
    }
    changed = d.getRowsModified();
    if (tables.length === 0) {
      const trimmed = sql
        .replace(/--[^\n]*/g, " ")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .trim();
      const verb = trimmed.split(/\s+/)[0]?.toUpperCase() || "SQL";
      if (verb === "SELECT" || verb === "WITH" || verb === "PRAGMA") {
        message = "Query executed. No rows returned.";
      } else {
        message = `${verb} executed successfully.`;
      }
    }
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    const err = new Error(msg);
    err.displayMessage = msg;
    throw err;
  }
  return { tables, message, changed };
}

export async function engineReady() {
  await getDb();
  return true;
}
