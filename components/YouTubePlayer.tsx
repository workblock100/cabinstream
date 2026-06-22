"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FEATURED_VIDEOS, parseYouTubeId, looksLikeVideoUrl } from "@/lib/services";
import { searchYouTube, formatDuration, type YTResult } from "@/lib/youtube";
import { getLastVideo, saveLastVideo, type LastVideo } from "@/lib/lastVideo";
import {
  getQueue,
  saveQueue,
  addToQueue,
  addManyToQueue,
  removeFromQueue,
  moveInQueue,
  type QueueItem,
} from "@/lib/queue";
import { comfortScrollTo } from "@/lib/scroll";
import { ParkedOnlyNotice } from "./ParkedOnlyNotice";
import {
  SearchIcon,
  PlayIcon,
  PlusIcon,
  CheckIcon,
  CloseIcon,
  SkipNextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "./ui";

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
  // The "Up Next" queue — videos lined up to play back-to-back, persisted so a
  // car-tab reload keeps them.
  const [queue, setQueue] = useState<QueueItem[]>([]);
  // Embed origin (for the YouTube IFrame API handshake). Known only client-side.
  const [origin, setOrigin] = useState("");
  // Autoplay-with-sound is blocked without a user gesture (Tesla browser /
  // Chrome). First paint and the localStorage restore have no gesture, so we
  // load WITHOUT autoplay there — the passenger sees YouTube's normal Play
  // button (one tap starts it with sound) instead of a stalled black frame.
  // Every in-app tile/paste tap flips this true via play() so those autoplay.
  const [gestured, setGestured] = useState(false);
  // Monotonic id so only the most recent in-flight search updates state.
  const reqId = useRef(0);
  // Latest playNext, so the (once-attached) message listener never goes stale.
  const playNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    setOrigin(window.location.origin);
    setQueue(getQueue());
    // Restore whatever was playing last so reloading the car browser tab
    // doesn't drop you back on the demo song. Falls back to the featured
    // video when nothing valid is stored.
    const last = getLastVideo();
    if (last) setCurrent(last);
  }, []);

  // Auto-advance: the embed (enablejsapi=1) posts state changes; when the video
  // ENDS (playerState 0) we play the next queued video. Best-effort — if the
  // handshake is blocked, the "Play next" button still advances manually.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== "string" || !e.origin.includes("youtube")) return;
      let d: { event?: string; info?: unknown };
      try {
        d = JSON.parse(e.data);
      } catch {
        return;
      }
      const ended =
        (d.event === "onStateChange" && d.info === 0) ||
        (d.event === "infoDelivery" &&
          (d.info as { playerState?: number } | null)?.playerState === 0);
      if (ended) playNextRef.current();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const src = useMemo(() => {
    let s = `https://www.youtube-nocookie.com/embed/${current.id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    if (origin) s += `&origin=${encodeURIComponent(origin)}`;
    if (gestured) s += "&autoplay=1";
    return s;
  }, [current.id, gestured, origin]);

  // Tell the freshly-loaded embed to start emitting state-change events.
  function onIframeLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    const w = e.currentTarget.contentWindow;
    if (!w) return;
    try {
      w.postMessage(JSON.stringify({ event: "listening", id: "cs-yt", channel: "widget" }), "*");
      w.postMessage(
        JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }),
        "*",
      );
    } catch {
      /* ignore — auto-advance just falls back to the manual button */
    }
  }

  function play(item: LastVideo) {
    setGestured(true);
    const next = { id: item.id, title: item.title, channel: item.channel };
    setCurrent(next);
    saveLastVideo(next);
    comfortScrollTo(0);
  }

  function mutateQueue(next: QueueItem[]) {
    setQueue(next);
    saveQueue(next);
  }
  const isQueued = (id: string) => queue.some((q) => q.id === id);
  function toggleQueue(v: GridItem) {
    mutateQueue(
      isQueued(v.id)
        ? removeFromQueue(queue, v.id)
        : addToQueue(queue, { id: v.id, title: v.title, channel: v.channel, thumb: v.thumb }),
    );
  }
  function playFromQueue(item: QueueItem) {
    mutateQueue(removeFromQueue(queue, item.id));
    play(item);
  }
  function addAllToQueue(items: GridItem[]) {
    mutateQueue(
      addManyToQueue(
        queue,
        items.map((v) => ({ id: v.id, title: v.title, channel: v.channel, thumb: v.thumb })),
      ),
    );
  }
  function playNext() {
    if (queue.length === 0) return;
    const [head, ...rest] = queue;
    mutateQueue(rest);
    play(head);
  }
  // Keep the message listener's playNext fresh without re-attaching it.
  useEffect(() => {
    playNextRef.current = playNext;
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Only treat input as a pasted link/ID when it looks like a YouTube URL —
    // otherwise a bare 11-char search word (e.g. "documentary") parses as an id
    // and would load a broken embed instead of searching.
    const id = looksLikeVideoUrl(q) ? parseYouTubeId(q) : null;
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
      <ParkedOnlyNotice openLabel="Open Live YouTube" setupLabel="Set up Live YouTube" />

      {/* Player */}
      <div className="overflow-hidden rounded-lg border border-[var(--color-border-hairline)] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video w-full">
          <iframe
            key={current.id}
            src={src}
            title={current.title}
            onLoad={onIframeLoad}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-h3 font-semibold leading-tight tracking-tight">{current.title}</div>
          <div className="text-sm text-text-tertiary">{current.channel}</div>
        </div>
        {queue.length > 0 && (
          <button onClick={playNext} className="btn btn-secondary btn-compact shrink-0">
            <SkipNextIcon className="h-4 w-4" />
            Play next
          </button>
        )}
      </div>

      {/* Up Next queue */}
      {queue.length > 0 && (
        <section
          aria-label="Up next"
          className="mt-4 rounded-lg border border-[var(--color-border-hairline)] bg-white/[0.03] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Up next · {queue.length}</h2>
              <p className="text-xs text-text-tertiary">Plays automatically when each video ends.</p>
            </div>
            <button
              onClick={() => mutateQueue([])}
              className="inline-flex min-h-[44px] items-center px-3 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {queue.map((q, i) => (
              <li key={q.id} className="flex items-center gap-2">
                <button
                  onClick={() => playFromQueue(q)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left focus-ring transition hover:bg-white/[0.04]"
                >
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded bg-black/40">
                    {q.thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={q.thumb}
                        alt=""
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-sm font-medium">{q.title}</span>
                    <span className="line-clamp-1 text-xs text-text-tertiary">{q.channel}</span>
                  </span>
                </button>
                {queue.length > 1 && (
                  <>
                    <button
                      onClick={() => mutateQueue(moveInQueue(queue, q.id, -1))}
                      disabled={i === 0}
                      aria-label={`Move ${q.title} up`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-tertiary focus-ring transition hover:bg-white/[0.06] hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => mutateQueue(moveInQueue(queue, q.id, 1))}
                      disabled={i === queue.length - 1}
                      aria-label={`Move ${q.title} down`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-tertiary focus-ring transition hover:bg-white/[0.06] hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => mutateQueue(removeFromQueue(queue, q.id))}
                  aria-label={`Remove ${q.title} from Up next`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-tertiary focus-ring transition hover:bg-white/[0.06] hover:text-text-primary"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
      <div className="mt-8 flex flex-wrap items-center gap-3" aria-busy={loading}>
        <h2 className="text-h3 font-semibold tracking-tight">{gridLabel}</h2>
        {results && (
          <>
            <button onClick={() => addAllToQueue(results)} className="btn btn-secondary btn-compact">
              <PlusIcon className="h-4 w-4" />
              Add all to Up next
            </button>
            <button
              onClick={clearResults}
              className="inline-flex min-h-[44px] items-center px-3 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
            >
              Clear
            </button>
          </>
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
            <div key={v.id} className="group relative">
              <button
                onClick={() => play(v)}
                className={`block w-full overflow-hidden rounded-2xl border focus-ring text-left transition ${
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
                    referrerPolicy="no-referrer"
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
              <button
                type="button"
                onClick={() => toggleQueue(v)}
                aria-label={isQueued(v.id) ? `Remove ${v.title} from Up next` : `Add ${v.title} to Up next`}
                aria-pressed={isQueued(v.id)}
                className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 backdrop-blur transition hover:bg-black/85 focus-ring"
              >
                {isQueued(v.id) ? (
                  <CheckIcon className="h-4 w-4 text-accent-cyan" />
                ) : (
                  <PlusIcon className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
