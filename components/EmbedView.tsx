"use client";

import { useEffect, useState } from "react";
import { ParkedOnlyNotice } from "./ParkedOnlyNotice";
import { parseTwitchChannel } from "@/lib/twitch";
import { getChannels, rememberChannel, clearChannels } from "@/lib/twitchHistory";

/** In-app Twitch player. Twitch's embed requires a `parent` matching the host. */
export function EmbedView() {
  const [channel, setChannel] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    setHost(window.location.hostname || "localhost");
    setChannels(getChannels());
  }, []);

  function watch(raw: string) {
    const next = parseTwitchChannel(raw);
    if (next) {
      setErr(false);
      setActive(next);
      setChannel(next);
      setChannels(rememberChannel(next));
    } else {
      setErr(true);
    }
  }

  // Only build the embed once the real host is known — a stale "localhost"
  // parent makes Twitch refuse to play on the deployed site.
  const src =
    active && host
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(active)}&parent=${host}&autoplay=true`
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-10 lg:px-16">
      {/* Parked-only notice: Twitch's HTML5 video blacks out in Drive — point to the WebRTC Cabin Browser. */}
      <ParkedOnlyNotice openLabel="Open in Cabin Browser" setupLabel="Set up Cabin Browser" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          watch(channel);
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={channel}
          onChange={(e) => {
            setChannel(e.target.value);
            if (err) setErr(false);
          }}
          placeholder="Enter a Twitch channel (e.g. pokimane, xqc)…"
          aria-label="Twitch channel name"
          aria-invalid={err}
          aria-describedby={err ? "twitch-err" : undefined}
          className="field flex-1"
        />
        <button type="submit" className="btn btn-primary sm:w-auto">
          Watch live
        </button>
      </form>
      {err && (
        <p id="twitch-err" role="alert" className="-mt-3 mb-5 text-sm text-[#f87171]">
          Enter a Twitch channel name (e.g. pokimane) or a twitch.tv channel link.
        </p>
      )}
      {channels.length > 0 && (
        <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-tertiary">Recent</span>
          {channels.map((c) => (
            <button
              key={c}
              onClick={() => watch(c)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-border-hairline)] px-3.5 text-sm text-text-secondary focus-ring transition hover:border-[var(--color-border-strong)] hover:text-text-primary"
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => {
              clearChannels();
              setChannels([]);
            }}
            className="inline-flex min-h-[44px] items-center px-2 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      )}

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
