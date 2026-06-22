"use client";

/**
 * Recently watched Twitch channels (most-recent-first), so a passenger can
 * re-open a channel with one tap. Reuses the pure pushSearch logic; persisted
 * under its own key.
 */

import { pushSearch } from "@/lib/searchHistory";

const KEY = "cs_twitch_channels";
const MAX = 8;

export function getChannels(): string[] {
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

export function rememberChannel(name: string): string[] {
  const next = pushSearch(getChannels(), name);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function clearChannels(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
