"use client";

import { useEffect, useState } from "react";

/** In-app Twitch player. Twitch's embed requires a `parent` matching the host. */
export function EmbedView() {
  const [channel, setChannel] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [host, setHost] = useState("localhost");

  useEffect(() => {
    setHost(window.location.hostname || "localhost");
  }, []);

  const src = active
    ? `https://player.twitch.tv/?channel=${encodeURIComponent(active)}&parent=${host}&autoplay=true`
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-10 lg:px-16">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (channel.trim()) setActive(channel.trim().toLowerCase());
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
