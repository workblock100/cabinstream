"use client";

/**
 * "Cabin Browser" = the persistent Chromium running on your always-on home computer,
 * streamed to the car over WebRTC (Neko). Logged into YouTube once, it stays logged in,
 * and because it's WebRTC it plays while the car is in Drive.
 *
 * The stream's public URL (from your Cloudflare tunnel) is stored here so it's easy to
 * update when it changes.
 */

const KEY_CABIN_URL = "cs_cabin_url";

export function getCabinUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_CABIN_URL) ?? "";
}

/**
 * Stores the Cabin Browser URL after normalizing it. A scheme-less value like
 * "my-tunnel.trycloudflare.com" would be treated as a RELATIVE path (404 on the
 * deployed site), so we prepend https:// and reject anything that isn't a URL.
 * @returns true if saved (or cleared); false if unparseable (existing value kept).
 */
export function setCabinUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  const trimmed = url.trim();
  if (!trimmed) {
    localStorage.removeItem(KEY_CABIN_URL);
    return true;
  }
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    localStorage.setItem(KEY_CABIN_URL, parsed.toString());
    return true;
  } catch {
    return false;
  }
}
