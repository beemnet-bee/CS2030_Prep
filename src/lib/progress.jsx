// Progress tracking with localStorage — no account needed, it just works.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createElement } from "react";
import { lectures } from "../data/lectures/index.js";

const KEY = "cs2030-progress-v1";
const THEME_KEY = "cs2030-theme";

const empty = {
  parts: {},        // "3:conditions" -> true when a part is marked complete
  quizzes: {},      // lecture number -> best score percent
  examBest: null,   // best practice-exam percent
  lastVisit: null,  // { lecture: 4, partIndex: 1 }
  codeRuns: 0,
  theme: "light",
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch { /* storage may be unavailable — progress just won't persist */ }
  }, [state]);

  // apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme || "light";
    try { localStorage.setItem(THEME_KEY, state.theme || "light"); } catch {}
  }, [state.theme]);

  const togglePart = useCallback((lectureNum, partId, done) => {
    setState((s) => {
      const parts = { ...s.parts };
      const key = `${lectureNum}:${partId}`;
      if (done) parts[key] = true;
      else delete parts[key];
      return { ...s, parts };
    });
  }, []);

  const markAllParts = useCallback((lectureNum, partIds, done) => {
    setState((s) => {
      const parts = { ...s.parts };
      for (const id of partIds) {
        const key = `${lectureNum}:${id}`;
        if (done) parts[key] = true;
        else delete parts[key];
      }
      return { ...s, parts };
    });
  }, []);

  const setQuizScore = useCallback((lectureNum, percent) => {
    setState((s) => {
      const prev = s.quizzes[lectureNum];
      const best = Math.max(prev || 0, percent);
      return { ...s, quizzes: { ...s.quizzes, [lectureNum]: best } };
    });
  }, []);

  const setExamBest = useCallback((percent) => {
    setState((s) => ({ ...s, examBest: Math.max(s.examBest || 0, percent) }));
  }, []);

  const setLastVisit = useCallback((lecture, partIndex) => {
    setState((s) => ({ ...s, lastVisit: { lecture, partIndex } }));
  }, []);

  const bumpCodeRuns = useCallback(() => {
    setState((s) => ({ ...s, codeRuns: (s.codeRuns || 0) + 1 }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const resetAll = useCallback(() => {
    setState((s) => ({ ...empty, theme: s.theme }));
  }, []);

  // ----- derived stats -----
  // Each lecture has its authored parts + the auto wrap-up part (summary + quiz).
  const stats = useMemo(() => {
    const allParts = lectures.flatMap((l) =>
      [...l.parts.map((p) => `${l.num}:${p.id}`), `${l.num}:wrap-up`]
    );
    const doneParts = allParts.filter((k) => state.parts[k]).length;
    const overall = allParts.length ? Math.round((doneParts / allParts.length) * 100) : 0;
    const perLecture = lectures.map((l) => {
      const keys = [...l.parts.map((p) => `${l.num}:${p.id}`), `${l.num}:wrap-up`];
      const done = keys.filter((k) => state.parts[k]).length;
      return {
        num: l.num,
        slug: l.slug,
        title: l.title,
        done,
        total: keys.length,
        percent: keys.length ? Math.round((done / keys.length) * 100) : 0,
      };
    });
    const quizScores = Object.values(state.quizzes);
    const quizAvg = quizScores.length
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;
    return {
      totalParts: allParts.length,
      doneParts,
      overall,
      perLecture,
      quizAvg,
      lecturesComplete: perLecture.filter((l) => l.percent === 100).length,
    };
  }, [state.parts, state.quizzes]);

  const value = {
    ...state,
    stats,
    togglePart,
    markAllParts,
    setQuizScore,
    setExamBest,
    setLastVisit,
    bumpCodeRuns,
    toggleTheme,
    resetAll,
  };

  return createElement(ProgressContext.Provider, { value }, children);
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
