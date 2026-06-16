"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FEATURED_VIDEOS, parseYouTubeId } from "@/lib/services";
import { searchYouTube, formatDuration, type YTResult } from "@/lib/youtube";
import { getCabinUrl } from "@/lib/settings";
import { getLastVideo, saveLastVideo, type LastVideo } from "@/lib/lastVideo";
import { comfortScrollTo } from "@/lib/scroll";
import { SearchIcon, PlayIcon } from "./ui";

interface GridItem {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  duration?: number;
}

const featuredItems: GridItem[] = FEATURED_VIDEOS.map((v) => ({
  id: v.id,
  title: v.title,
  channel: v.channel,
  thumb: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
}));

export function YouTubePlayer() {
  const router = useRouter();
  const [cabinUrl, setCabinUrl] = useState<string | null>(null);
  const [current, setCurrent] = useState<LastVideo>({
    id: FEATURED_VIDEOS[0].id,
    title: FEATURED_VIDEOS[0].title,
    channel: FEATURED_VIDEOS[0].channel,
  });
  const [query, setQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [results, setResults] = useState<GridItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // Autoplay-with-sound is blocked without a user gesture (Tesla browser /
  // Chrome). First paint and the localStorage restore have no gesture, so we
  // load WITHOUT autoplay there — the passenger sees YouTube's normal Play
  // button (one tap starts it with sound) instead of a stalled black frame.
  // Every in-app tile/paste tap flips this true via play() so those autoplay.
  const [gestured, setGestured] = useState(false);
  // Monotonic id so only the most recent in-flight search updates state.
  const reqId = useRef(0);

  useEffect(() => {
    setCabinUrl(getCabinUrl() || null);
    // Restore whatever was playing last so reopening the PWA in the car
    // doesn't drop you back on the demo song. Falls back to the featured
    // video when nothing valid is stored.
    const last = getLastVideo();
    if (last) setCurrent(last);
  }, []);

  const src = useMemo(
    () =>
      `https://www.youtube-nocookie.com/embed/${current.id}?rel=0&modestbranding=1&playsinline=1${gestured ? "&autoplay=1" : ""}`,
    [current.id, gestured],
  );

  function play(item: LastVideo) {
    setGestured(true);
    const next = { id: item.id, title: item.title, channel: item.channel };
    setCurrent(next);
    saveLastVideo(next);
    comfortScrollTo(0);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const id = parseYouTubeId(q);
    if (id) {
      reqId.current++; // invalidate any in-flight (possibly hung) search
      setLoading(false); // re-enable Search + clear the skeleton immediately
      setNote(null);
      play({ id, title: "Now playing", channel: "Pasted link" });
      setQuery("");
      return;
    }

    const myId = ++reqId.current;
    setLoading(true);
    setNote(null);
    const res = await searchYouTube(q);
    // A newer search started since this began — drop this stale result
    // (leave loading=true so the spinner stays up until the latest settles).
    if (myId !== reqId.current) return;
    setLoading(false);

    const items = res
      .map((r: YTResult) => ({
        id: parseYouTubeId(r.videoId) ?? "",
        title: r.title,
        channel: r.author,
        thumb: r.thumbnail,
        duration: r.duration,
      }))
      // Drop any result whose videoId fails to parse (rotting public instances
      // can return non-empty but malformed ids that survive searchYouTube's filter).
      .filter((v) => v.id);

    if (items.length) {
      setSearchedTerm(q);
      setResults(items);
    } else {
      // No usable results (empty response OR every id filtered out) — keep the
      // featured grid visible and surface a single honest note instead of a
      // blank grid labeled `Results for "term"`.
      setResults(null);
      setNote("No results right now — paste a YouTube link to play it directly.");
    }
  }

  function clearResults() {
    setResults(null);
    setNote(null);
  }

  const grid = results ?? featuredItems;
  const gridLabel = results ? `Results for "${searchedTerm}"` : "Featured";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-10 lg:px-16">
      {/* Parked-only notice: this embed blacks out in Drive — point to the WebRTC Cabin Browser. */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border-hairline)] bg-white/[0.03] px-4 py-3 text-sm">
        <span className="text-text-secondary">
          <span className="font-semibold text-text-primary">Parked only.</span> This player stops when the car is in Drive.
        </span>
        {cabinUrl ? (
          <a
            href={cabinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-compact"
          >
            <PlayIcon className="h-4 w-4" />
            Open Live YouTube
          </a>
        ) : (
          <button
            onClick={() => router.push("/settings")}
            className="font-medium text-accent-cyan underline underline-offset-4"
          >
            Set up Live YouTube
          </button>
        )}
      </div>

      {/* Player */}
      <div className="overflow-hidden rounded-lg border border-[var(--color-border-hairline)] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video w-full">
          <iframe
            key={current.id}
            src={src}
            title={current.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-h3 font-semibold leading-tight tracking-tight">{current.title}</div>
        <div className="text-sm text-text-tertiary">{current.channel}</div>
      </div>

      {/* Search / paste */}
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube, or paste a link…"
            aria-label="Search YouTube or paste a video link"
            className="field !pl-12"
            inputMode="search"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60 sm:w-auto">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {note && (
        <p role="status" aria-live="polite" className="mt-2 text-sm text-amber-400/90">
          {note}
        </p>
      )}

      {/* Screen-reader announcement for search state changes (persistent live region) */}
      <p className="sr-only" role="status" aria-live="polite">
        {loading
          ? "Searching YouTube"
          : results
            ? `${results.length} result${results.length === 1 ? "" : "s"} for ${searchedTerm}`
            : ""}
      </p>

      {/* Grid */}
      <div className="mt-8 flex items-center gap-3" aria-busy={loading}>
        <h2 className="text-h3 font-semibold tracking-tight">{gridLabel}</h2>
        {results && (
          <button
            onClick={clearResults}
            className="inline-flex min-h-[44px] items-center px-3 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, k) => (
            <div key={k} className="animate-pulse">
              <div className="aspect-video w-full rounded-2xl bg-white/5" />
              <div className="mt-2 h-4 w-4/5 rounded bg-white/5" />
              <div className="mt-1.5 h-3 w-2/5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {grid.map((v) => (
            <button
              key={v.id}
              onClick={() => play(v)}
              className={`group overflow-hidden rounded-2xl border focus-ring text-left transition ${
                v.id === current.id
                  ? "border-accent-cyan ring-2 ring-[rgba(34,211,238,0.45)]"
                  : "border-[var(--color-border-hairline)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              <div className="relative aspect-video w-full bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumb}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 backdrop-blur">
                    <PlayIcon className="h-5 w-5 translate-x-px text-white" />
                  </span>
                </span>
                {typeof v.duration === "number" && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
                    {formatDuration(v.duration)}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</div>
                <div className="mt-1 truncate text-xs text-text-tertiary">{v.channel}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
