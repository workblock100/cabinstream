"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCabinUrl } from "@/lib/settings";
import { PlayIcon } from "./ui";

/** Twitch site paths that are not channel names. */
const TWITCH_RESERVED = new Set([
  "directory", "videos", "video", "p", "settings", "subscriptions",
  "friends", "wallet", "prime", "downloads", "search", "team", "teams",
  "jobs", "turbo", "store", "about", "popout", "u", "moderator",
]);

/** Pull a bare Twitch channel out of a pasted URL or raw handle. Returns "" if none. */
function parseTwitchChannel(input: string): string {
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
  // Otherwise treat it as a raw handle (strip a leading @ and anything non-handle).
  const handle = s.replace(/^@/, "").match(/^[a-zA-Z0-9_]{1,25}/);
  if (!handle) return "";
  const h = handle[0].toLowerCase();
  return TWITCH_RESERVED.has(h) ? "" : h;
}

/** In-app Twitch player. Twitch's embed requires a `parent` matching the host. */
export function EmbedView() {
  const router = useRouter();
  const [channel, setChannel] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [cabinUrl, setCabinUrl] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname || "localhost");
    setCabinUrl(getCabinUrl() || null);
  }, []);

  // Only build the embed once the real host is known — a stale "localhost"
  // parent makes Twitch refuse to play on the deployed site.
  const src =
    active && host
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(active)}&parent=${host}&autoplay=true`
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-10 lg:px-16">
      {/* Parked-only notice: Twitch's HTML5 video blacks out in Drive — point to the WebRTC Cabin Browser. */}
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
            Open in Cabin Browser
          </a>
        ) : (
          <button
            onClick={() => router.push("/settings")}
            className="font-medium text-accent-cyan underline underline-offset-4"
          >
            Set up Cabin Browser
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const next = parseTwitchChannel(channel);
          if (next) {
            setActive(next);
            setChannel(next);
          }
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Enter a Twitch channel (e.g. pokimane, xqc)…"
          aria-label="Twitch channel name"
          className="field flex-1"
        />
        <button type="submit" className="btn btn-primary sm:w-auto">
          Watch live
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border-hairline)] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video w-full">
          {src ? (
            <iframe
              key={src}
              src={src}
              title="Twitch player"
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-h3 font-semibold">Enter a channel to start</span>
              <span className="text-sm text-text-tertiary">The live stream plays right here in the app.</span>
            </div>
          )}
        </div>
      </div>

      <a
        href="https://www.twitch.tv/directory"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-[44px] items-center py-2 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
      >
        Browse channels on Twitch ↗
      </a>
    </div>
  );
}
