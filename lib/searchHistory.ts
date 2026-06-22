"use client";

/**
 * Recent YouTube search terms (most-recent-first), so a passenger can re-run a
 * search with one tap instead of retyping on the in-car touch keyboard.
 * Persisted in localStorage. The push logic is pure for easy unit-testing.
 */

const KEY = "cs_searches";
const MAX = 8;

/** Put `term` at the front, de-duped (case-insensitive), trimmed, capped. */
export function pushSearch(list: string[], term: string): string[] {
  const t = term.trim();
  if (!t) return list;
  const rest = list.filter((s) => s.toLowerCase() !== t.toLowerCase());
  return [t, ...rest].slice(0, MAX);
}

export function getSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** Remember a term and return the updated list. */
export function rememberSearch(term: string): string[] {
  const next = pushSearch(getSearches(), term);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function clearSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
