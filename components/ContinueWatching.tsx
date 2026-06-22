"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLastVideo, type LastVideo } from "@/lib/lastVideo";
import { PlayIcon } from "./ui";

/** Home "Continue watching" card — resumes the last in-app YouTube video.
 *  Renders nothing when there is no stored last video. */
export function ContinueWatching() {
  const router = useRouter();
  const [video, setVideo] = useState<LastVideo | null>(null);

  useEffect(() => {
    setVideo(getLastVideo());
  }, []);

  if (!video) return null;

  return (
    <section
      aria-label="Continue watching"
      className="mx-auto w-full max-w-6xl px-6 pt-10 sm:px-10 lg:px-16"
    >
      <h2 className="text-h3 font-semibold tracking-tight">Continue watching</h2>
      <button
        onClick={() => router.push("/watch/youtube")}
        className="group mt-3 flex w-full max-w-md items-center gap-4 rounded-xl border border-[var(--color-border-hairline)] bg-white/[0.03] p-3 text-left focus-ring transition hover:border-[var(--color-border-strong)]"
      >
        <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
            alt=""
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 backdrop-blur">
              <PlayIcon className="h-4 w-4 translate-x-px text-white" />
            </span>
          </span>
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm font-medium">{video.title}</span>
          <span className="mt-1 line-clamp-1 text-xs text-text-tertiary">{video.channel}</span>
        </span>
      </button>
    </section>
  );
}
