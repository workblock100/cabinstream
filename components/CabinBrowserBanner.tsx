"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCabinUrl } from "@/lib/settings";
import { PlayIcon, SettingsIcon } from "./ui";

/** The headline in-drive feature: opens the WebRTC Cabin Browser (logged-in YouTube). */
export function CabinBrowserBanner() {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUrl(getCabinUrl() || null);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="px-6 pt-8 sm:px-10 lg:px-16">
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-border-hairline)] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 accent-gradient opacity-[0.16]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--color-accent-cyan)]/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="text-label font-semibold uppercase tracking-[0.18em] text-accent-cyan">
              Plays while driving
            </div>
            <h2 className="mt-2 text-h2 font-bold tracking-tight">Live YouTube</h2>
            <p className="mt-1.5 text-text-secondary">
              {url
                ? "Your logged-in YouTube, streamed from home over WebRTC — keeps playing in Drive."
                : "Stream your always-logged-in YouTube from your home computer so it plays even in Drive. Set it up once."}
            </p>
          </div>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary shrink-0">
              <PlayIcon className="h-5 w-5" />
              Open Live YouTube
            </a>
          ) : (
            <button onClick={() => router.push("/settings")} className="btn btn-secondary shrink-0">
              <SettingsIcon className="h-5 w-5" />
              Set up Live YouTube
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
