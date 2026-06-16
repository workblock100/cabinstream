/**
 * Keyless YouTube search via public Piped / Invidious instances.
 * No API key. Iterates instances, skipping any that are down, rate-limited,
 * or returning a Cloudflare/CAPTCHA HTML wall instead of JSON.
 * Instances verified live 2026-06-15; their status flips often, hence the fallback list.
 */

export interface YTResult {
  videoId: string;
  title: string;
  author: string;
  duration: number; // seconds; 0/-1 for live
  thumbnail: string;
}

const PIPED_INSTANCES = [
  "https://api.piped.private.coffee",
];

const INVIDIOUS_INSTANCES = [
  "https://inv.thepixora.com",
  "https://yt.chocolatemoo53.com",
];

const LAST_GOOD_KEY = "cs_yt_instance";
const TIMEOUT_MS = 7000;

async function fetchJson(url: string): Promise<unknown | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, referrerPolicy: "no-referrer" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null; // CAPTCHA / HTML wall
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function rememberGood(base: string) {
  try {
    localStorage.setItem(LAST_GOOD_KEY, base);
  } catch {
    /* ignore */
  }
}

function lastGood(): string | null {
  try {
    return localStorage.getItem(LAST_GOOD_KEY);
  } catch {
    return null;
  }
}

export function mapPiped(data: unknown): YTResult[] {
  const items = (data as { items?: unknown[] })?.items;
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => (it as { type?: string }).type === "stream")
    .map((it) => {
      const o = it as Record<string, unknown>;
      const url = String(o.url ?? "");
      // Anchor to the v= query param and capture exactly 11 id chars, so an earlier
      // "…v=" param or trailing junk after the id can't corrupt the extraction.
      const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      const videoId = m ? m[1] : "";
      return {
        videoId,
        title: String(o.title ?? ""),
        author: String(o.uploaderName ?? ""),
        duration: Number(o.duration ?? 0),
        thumbnail: String(o.thumbnail ?? ""),
      };
    })
    .filter((r) => r.videoId);
}

export function mapInvidious(data: unknown, base: string): YTResult[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => (it as { type?: string }).type === "video")
    .map((it) => {
      const o = it as Record<string, unknown>;
      const thumbs = (o.videoThumbnails as { url?: string }[]) ?? [];
      let thumb = thumbs[1]?.url ?? thumbs[0]?.url ?? "";
      if (thumb.startsWith("/")) thumb = base + thumb;
      return {
        videoId: String(o.videoId ?? ""),
        title: String(o.title ?? ""),
        author: String(o.author ?? ""),
        duration: Number(o.lengthSeconds ?? 0),
        thumbnail: thumb,
      };
    })
    .filter((r) => r.videoId);
}

/** Search YouTube for videos. Returns [] if every instance is unreachable. */
export async function searchYouTube(query: string): Promise<YTResult[]> {
  const q = query.trim();
  if (!q) return [];
  const enc = encodeURIComponent(q);

  const attempts: { base: string; build: () => string; map: (d: unknown) => YTResult[] }[] = [];

  for (const base of PIPED_INSTANCES) {
    attempts.push({ base, build: () => `${base}/search?q=${enc}&filter=videos`, map: (d) => mapPiped(d) });
  }
  for (const base of INVIDIOUS_INSTANCES) {
    attempts.push({ base, build: () => `${base}/api/v1/search?q=${enc}&type=video`, map: (d) => mapInvidious(d, base) });
  }

  // Try the last known-good instance first.
  const good = lastGood();
  if (good) {
    const i = attempts.findIndex((a) => a.base === good);
    if (i > 0) attempts.unshift(attempts.splice(i, 1)[0]);
  }

  // Race the instances instead of summing their 7s timeouts. Try the known-good
  // instance alone first (one RTT on the happy path); if it's down or returns no
  // results, fan out to the rest concurrently and take the first that succeeds.
  type Attempt = (typeof attempts)[number];
  const run = async (a: Attempt): Promise<YTResult[]> => {
    const data = await fetchJson(a.build());
    const results = data ? a.map(data) : [];
    if (!results.length) throw new Error("empty"); // let Promise.any skip this instance
    rememberGood(a.base);
    return results;
  };

  const first = good && attempts[0]?.base === good ? attempts[0] : undefined;
  if (first) {
    try {
      return await run(first);
    } catch {
      /* fall through and race the remaining instances */
    }
  }

  const rest = first ? attempts.slice(1) : attempts;
  if (rest.length === 0) return [];
  try {
    return await Promise.any(rest.map(run));
  } catch {
    return []; // every remaining instance failed or returned empty
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "LIVE";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
