// Tiny dependency-free syntax highlighter for the two course languages.
// Produces HTML with .tok-* spans; colors live in global.css and stay inside
// the lime theme family (bright lime keywords, soft lime strings, neutral
// gray-green comments). Escape-first, single-pass tokenization.

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Each rule set: a global regex whose named groups map to token classes.
// Group order = priority (comment/string win over keywords, etc.).
const SQL_KEYWORDS = [
  "select", "from", "where", "group", "by", "order", "having", "limit", "offset",
  "join", "inner", "left", "right", "full", "outer", "cross", "on", "using",
  "as", "and", "or", "not", "in", "is", "null", "like", "between", "exists",
  "distinct", "all", "any", "union", "intersect", "except", "case", "when",
  "then", "else", "end", "insert", "into", "values", "update", "set", "delete",
  "create", "table", "primary", "foreign", "key", "references", "constraint",
  "unique", "check", "default", "autoincrement", "alter", "add", "drop", "rename",
  "column", "to", "index", "view", "with", "recursive", "asc", "desc", "nulls",
  "first", "last", "cast", "begin", "commit", "rollback", "transaction",
  "integer", "int", "text", "varchar", "char", "real", "numeric", "decimal",
  "date", "time", "timestamp", "boolean", "blob", "serial", "foreign",
];

const SQL_RE = new RegExp(
  [
    "(?<com>--[^\\n]*|/\\*[\\s\\S]*?\\*/)",
    "(?<str>'(?:[^'\\\\]|\\\\.|'')*'|\"(?:[^\"\\\\]|\\\\.)*\")",
    "(?<num>\\b\\d+(?:\\.\\d+)?\\b)",
    `(?<kw>\\b(?:${SQL_KEYWORDS.join("|")})\\b)`,
    "(?<fn>\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\())",
  ].join("|"),
  "gi"
);

const PY_KEYWORDS = [
  "def", "return", "if", "elif", "else", "for", "while", "in", "import", "from",
  "as", "class", "try", "except", "finally", "with", "lambda", "pass", "break",
  "continue", "raise", "yield", "global", "nonlocal", "del", "assert", "async",
  "await", "and", "or", "not", "is", "None", "True", "False", "match", "case",
];

const PY_BUILTINS = [
  "print", "range", "len", "str", "int", "float", "list", "dict", "set", "tuple",
  "sum", "min", "max", "abs", "sorted", "reversed", "enumerate", "zip", "map",
  "filter", "type", "isinstance", "round", "open", "input", "bool", "dict",
];

const PY_RE = new RegExp(
  [
    "(?<com>#[^\\n]*)",
    "(?<str>(?:[rbuf]{0,2})(?:'''[\\s\\S]*?'''|\"\"\"[\\s\\S]*?\"\"\"|'(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\"))",
    "(?<dec>@\\w+)",
    "(?<num>\\b\\d+(?:\\.\\d+)?\\b)",
    `(?<kw>\\b(?:${PY_KEYWORDS.join("|")})\\b)`,
    `(?<bi>\\b(?:${PY_BUILTINS.join("|")})\\b)`,
    "(?<fn>\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\())",
  ].join("|"),
  "g"
);

const RULES = { sql: [SQL_RE, "sql"], python: [PY_RE, "python"] };

function runHighlight(code, re) {
  let out = "";
  let last = 0;
  for (const m of code.matchAll(re)) {
    const groups = m.groups || {};
    const name = Object.keys(groups).find((g) => groups[g] !== undefined);
    if (!name) continue;
    out += esc(code.slice(last, m.index));
    out += `<span class="tok-${name}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  out += esc(code.slice(last));
  return out;
}

// lang: "sql" | "python" (anything else → escaped plain text)
export function highlightCode(code, lang) {
  const l = (lang || "").toLowerCase();
  const key = l.includes("py") ? "python" : l.includes("sql") ? "sql" : null;
  if (!key) return esc(code);
  try {
    return runHighlight(code, RULES[key][0]);
  } catch {
    return esc(code);
  }
}
