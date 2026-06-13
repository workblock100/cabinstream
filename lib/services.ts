export type ServiceType = "youtube" | "embed" | "launch";
export type Category = "Video" | "Live" | "Music" | "Free";

export interface Service {
  id: string;
  name: string;
  /** simple-icons slug (may not exist in the package — then we render a wordmark) */
  slug: string;
  /** official brand hex, no leading # */
  brandHex: string;
  category: Category;
  /** youtube = rich in-app player, embed = in-app iframe, launch = opens in car browser */
  type: ServiceType;
  url: string;
  /** DRM-protected: can only be opened in the browser, never re-hosted */
  drm: boolean;
  tagline: string;
  /** override the wordmark fallback text when there's no simple-icon */
  wordmark?: string;
}

export const SERVICES: Service[] = [
  // --- Video ---
  { id: "netflix", name: "Netflix", slug: "netflix", brandHex: "E50914", category: "Video", type: "launch", url: "https://www.netflix.com", drm: true, tagline: "Movies & series" },
  { id: "disney-plus", name: "Disney+", slug: "disneyplus", brandHex: "0063E5", category: "Video", type: "launch", url: "https://www.disneyplus.com", drm: true, tagline: "Disney, Marvel, Star Wars", wordmark: "Disney+" },
  { id: "prime-video", name: "Prime Video", slug: "primevideo", brandHex: "00A8E1", category: "Video", type: "launch", url: "https://www.primevideo.com", drm: true, tagline: "Amazon movies & TV", wordmark: "prime" },
  { id: "max", name: "Max", slug: "hbomax", brandHex: "002BE7", category: "Video", type: "launch", url: "https://play.max.com", drm: true, tagline: "HBO & more" },
  { id: "hulu", name: "Hulu", slug: "hulu", brandHex: "1CE783", category: "Video", type: "launch", url: "https://www.hulu.com", drm: true, tagline: "TV & originals", wordmark: "hulu" },
  { id: "apple-tv-plus", name: "Apple TV+", slug: "appletv", brandHex: "111114", category: "Video", type: "launch", url: "https://tv.apple.com", drm: true, tagline: "Apple originals" },
  { id: "paramount-plus", name: "Paramount+", slug: "paramountplus", brandHex: "0064FF", category: "Video", type: "launch", url: "https://www.paramountplus.com", drm: true, tagline: "A mountain of TV" },
  { id: "peacock", name: "Peacock", slug: "peacock", brandHex: "0A0A0A", category: "Video", type: "launch", url: "https://www.peacocktv.com", drm: true, tagline: "NBCUniversal", wordmark: "peacock" },
  { id: "crunchyroll", name: "Crunchyroll", slug: "crunchyroll", brandHex: "F47521", category: "Video", type: "launch", url: "https://www.crunchyroll.com", drm: true, tagline: "Anime everywhere" },
  { id: "tiktok", name: "TikTok", slug: "tiktok", brandHex: "111114", category: "Video", type: "launch", url: "https://www.tiktok.com/foryou", drm: false, tagline: "Short-form video" },

  // --- Live ---
  { id: "youtube", name: "YouTube", slug: "youtube", brandHex: "FF0033", category: "Live", type: "youtube", url: "https://www.youtube.com", drm: false, tagline: "Built-in player" },
  { id: "twitch", name: "Twitch", slug: "twitch", brandHex: "9146FF", category: "Live", type: "embed", url: "https://www.twitch.tv", drm: false, tagline: "Live streams" },
  { id: "espn", name: "ESPN", slug: "espn", brandHex: "FF0033", category: "Live", type: "launch", url: "https://www.espn.com/watch", drm: false, tagline: "Live sports", wordmark: "ESPN" },

  // --- Music ---
  { id: "spotify", name: "Spotify", slug: "spotify", brandHex: "1ED760", category: "Music", type: "launch", url: "https://open.spotify.com", drm: false, tagline: "Music & podcasts" },
  { id: "youtube-music", name: "YouTube Music", slug: "youtubemusic", brandHex: "FF0033", category: "Music", type: "launch", url: "https://music.youtube.com", drm: false, tagline: "Songs & videos" },
  { id: "apple-music", name: "Apple Music", slug: "applemusic", brandHex: "FA243C", category: "Music", type: "launch", url: "https://music.apple.com", drm: false, tagline: "100M songs" },
  { id: "soundcloud", name: "SoundCloud", slug: "soundcloud", brandHex: "FF5500", category: "Music", type: "launch", url: "https://soundcloud.com", drm: false, tagline: "Tracks & creators" },

  // --- Free ---
  { id: "tubi", name: "Tubi", slug: "tubi", brandHex: "7408FF", category: "Free", type: "launch", url: "https://tubitv.com", drm: false, tagline: "Free movies & TV" },
  { id: "pluto-tv", name: "Pluto TV", slug: "plutotv", brandHex: "1A1F6C", category: "Free", type: "launch", url: "https://pluto.tv", drm: false, tagline: "Free live channels", wordmark: "pluto" },
  { id: "plex", name: "Plex", slug: "plex", brandHex: "E5A00D", category: "Free", type: "launch", url: "https://watch.plex.tv", drm: false, tagline: "Free media & TV" },
];

export const CATEGORY_ORDER: Category[] = ["Video", "Live", "Music", "Free"];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function servicesByCategory(cat: Category): Service[] {
  return SERVICES.filter((s) => s.category === cat);
}

/* ---------- Tile colors ---------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function shade(hex: string, amount: number): string {
  // amount < 0 darkens, > 0 lightens
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const next = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount;
    return Math.max(0, Math.min(255, Math.round(next)));
  });
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Gradient + readable foreground for a service tile. Very dark brands get a neutral
 *  charcoal so the white logo reads; light/mid-bright brands flip the logo to near-black.
 *  When the foreground is dark we darken the gradient less, so the logo clears 3:1
 *  contrast at BOTH ends of the gradient (e.g. Crunchyroll, Prime Video, SoundCloud). */
export function tileGradient(s: Service): { from: string; to: string; fg: string } {
  const lum = relativeLuminance(s.brandHex);
  if (lum < 0.06) {
    return { from: "#23262e", to: "#0d0f14", fg: "#ffffff" };
  }
  const from = `#${s.brandHex}`;
  const fg = lum > 0.45 ? "#07090d" : "#ffffff";
  return { from, to: shade(from, fg === "#ffffff" ? -0.4 : -0.25), fg };
}

/* ---------- YouTube player helpers ---------- */

export interface FeaturedVideo {
  id: string;
  title: string;
  channel: string;
}

export const FEATURED_VIDEOS: FeaturedVideo[] = [
  { id: "OPf0YbXqDm0", title: "Uptown Funk", channel: "Mark Ronson ft. Bruno Mars" },
  { id: "kJQP7kiw5Fk", title: "Despacito", channel: "Luis Fonsi" },
  { id: "JGwWNGJdvx8", title: "Shape of You", channel: "Ed Sheeran" },
  { id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", channel: "Queen" },
  { id: "9bZkp7q19f0", title: "Gangnam Style", channel: "PSY" },
  { id: "RgKAFK5djSk", title: "See You Again", channel: "Wiz Khalifa ft. Charlie Puth" },
  { id: "CevxZvSJLk8", title: "Roar", channel: "Katy Perry" },
  { id: "hT_nvWreIhg", title: "Counting Stars", channel: "OneRepublic" },
];

/** Pull an 11-char YouTube ID out of a URL or raw ID. Returns null if none found. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}
