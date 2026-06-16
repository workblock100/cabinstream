"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCabinUrl } from "@/lib/settings";
import { PlayIcon } from "./ui";

/**
 * Notice shown above the in-app HTML5 players (YouTube iframe, Twitch embed).
 * Those black out when the car is in Drive, so this points the passenger to the
 * WebRTC Cabin Browser, which keeps playing in motion. The CTA wording differs
 * per surface ("Live YouTube" vs "Cabin Browser"), hence the label props.
 */
export function ParkedOnlyNotice({
  openLabel,
  setupLabel,
}: {
  openLabel: string;
  setupLabel: string;
}) {
  const router = useRouter();
  const [cabinUrl, setCabinUrl] = useState<string | null>(null);

  useEffect(() => {
    setCabinUrl(getCabinUrl() || null);
  }, []);

  return (
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
          {openLabel}
        </a>
      ) : (
        <button
          onClick={() => router.push("/settings")}
          className="inline-flex min-h-[44px] items-center font-medium text-accent-cyan underline underline-offset-4"
        >
          {setupLabel}
        </button>
      )}
    </div>
  );
}
