"use client";

/**
 * Remembers the last YouTube video played in the built-in player so the in-car
 * loop survives a Tesla-browser reload / tab restore. Only the {id,title,channel}
 * is kept, and the id is re-validated with parseYouTubeId on the way IN and OUT
 * so a corrupted localStorage value can never inject a bad iframe src.
 *
 * This is intentionally scoped to the parked YouTube player — it does NOT touch
 * the WebRTC Cabin Browser route (a Neko stream root, not a video id).
 */

import { parseYouTubeId } from "@/lib/services";

const KEY = "cs_last_video";

export interface LastVideo {
  id: string;
  title: string;
  channel: string;
}

export function saveLastVideo(v: LastVideo): void {
  if (typeof window === "undefined") return;
  if (!parseYouTubeId(v.id)) return; // never persist a bad id
  try {
    localStorage.setItem(KEY, JSON.stringify({ id: v.id, title: v.title, channel: v.channel }));
  } catch {
    /* ignore */
  }
}

export function getLastVideo(): LastVideo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<LastVideo>;
    const id = typeof o.id === "string" ? parseYouTubeId(o.id) : null;
    if (!id) return null;
    return { id, title: String(o.title ?? "Now playing"), channel: String(o.channel ?? "") };
  } catch {
    return null;
  }
}
