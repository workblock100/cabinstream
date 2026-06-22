"use client";

/** Tracks recently opened services for the "Jump back in" row. */

const KEY = "cs_recents";
const MAX = 8;

export function trackOpen(serviceId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getRecents().filter((id) => id !== serviceId);
    list.unshift(serviceId);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function clearRecents(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function getRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
