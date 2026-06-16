/** Twitch site paths that are not channel names. */
export const TWITCH_RESERVED = new Set([
  "directory", "videos", "video", "p", "settings", "subscriptions",
  "friends", "wallet", "prime", "downloads", "search", "team", "teams",
  "jobs", "turbo", "store", "about", "popout", "u", "moderator",
]);

/** Pull a bare Twitch channel out of a pasted URL or raw handle. Returns "" if none. */
export function parseTwitchChannel(input: string): string {
  const s = input.trim();
  if (!s) return "";
  // A pasted twitch.tv URL → take the first path segment (the channel).
  const m = s.match(/twitch\.tv\/([a-zA-Z0-9_]{1,25})/i);
  if (m) {
    const seg = m[1].toLowerCase();
    // Reserved path (e.g. /directory, /videos) → not a channel; bail out rather
    // than loading a dead player. Must NOT fall through to the raw-handle branch,
    // which would otherwise extract the URL scheme "https".
    return TWITCH_RESERVED.has(seg) ? "" : seg;
  }
  // A scheme-prefixed or dotted host (e.g. "https://twitch.tv", "www.twitch.tv",
  // "twitch.tv", "https://example.com/…") is a URL we failed to extract a channel
  // from — NOT a raw handle. Reject it rather than emitting its scheme/host fragment
  // ("https"/"www"/"twitch") as a bogus channel that loads a dead, error-free player.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(s)) return "";
  // Otherwise treat it as a raw handle (strip a leading @ and anything non-handle).
  const handle = s.replace(/^@/, "").match(/^[a-zA-Z0-9_]{1,25}/);
  if (!handle) return "";
  const h = handle[0].toLowerCase();
  return TWITCH_RESERVED.has(h) ? "" : h;
}
