"use client";

/**
 * "Up Next" queue for the in-app YouTube player. Persisted so reloading the car
 * browser tab keeps the videos you lined up. Pure helpers (add/remove) are kept
 * separate from the localStorage I/O so they're easy to unit-test.
 */

import { parseYouTubeId } from "@/lib/services";

const KEY = "cs_queue";
const MAX = 50;

export interface QueueItem {
  id: string;
  title: string;
  channel: string;
  thumb?: string;
}

/** Append an item, ignoring bad ids and duplicates; caps the queue length. */
export function addToQueue(list: QueueItem[], item: QueueItem): QueueItem[] {
  if (!parseYouTubeId(item.id)) return list;
  if (list.some((q) => q.id === item.id)) return list;
  return [...list, item].slice(0, MAX);
}

export function removeFromQueue(list: QueueItem[], id: string): QueueItem[] {
  return list.filter((q) => q.id !== id);
}

/** Append many items at once (e.g. a whole search), keeping dedup + cap rules. */
export function addManyToQueue(list: QueueItem[], items: QueueItem[]): QueueItem[] {
  return items.reduce((acc, item) => addToQueue(acc, item), list);
}

/** Return a new array with the items in random order (Fisher-Yates). */
export function shuffleQueue(list: QueueItem[]): QueueItem[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Move an item one slot earlier (dir -1) or later (dir 1); clamped at the ends. */
export function moveInQueue(list: QueueItem[], id: string, dir: -1 | 1): QueueItem[] {
  const i = list.findIndex((q) => q.id === id);
  if (i === -1) return list;
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function getQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object" && typeof x.id === "string" && parseYouTubeId(x.id))
      .map((x) => ({
        id: x.id as string,
        title: String(x.title ?? ""),
        channel: String(x.channel ?? ""),
        thumb: typeof x.thumb === "string" ? x.thumb : undefined,
      }))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function saveQueue(list: QueueItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function clearQueue(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
