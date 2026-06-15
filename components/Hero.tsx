"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getService } from "@/lib/services";
import { trackOpen } from "@/lib/recents";
import { comfortScrollTo } from "@/lib/scroll";
import { ServiceLogo } from "./ServiceLogo";
import { PlayIcon, ArrowRightIcon } from "./ui";

const FEATURED_IDS = ["youtube", "netflix", "disney-plus", "spotify", "twitch"];
const featured = FEATURED_IDS.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));

export function Hero() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  // Announce ONLY user-initiated slide changes — not the 8s auto-advance — so a
  // screen reader isn't interrupted every 8 seconds (set in selectSlide).
  const [liveName, setLiveName] = useState("");

  useEffect(() => {
    if (paused || interacted) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // honor reduced-motion: leave the hero on the current slide
    }
    const id = setInterval(() => setI((v) => (v + 1) % featured.length), 8000);
    return () => clearInterval(id);
  }, [paused, interacted]);

  const s = featured[i];
  if (!s) return null;

  function open() {
    trackOpen(s.id);
    router.push(`/watch/${s.id}`);
  }

  function scrollDown() {
    comfortScrollTo(window.innerHeight * 0.62);
  }

  function selectSlide(idx: number) {
    setInteracted(true); // once the user takes control, stop auto-advance
    setLiveName(featured[idx]?.name ?? "");
    setI(idx);
  }

  return (
    <section
      className="relative isolate flex min-h-[clamp(360px,46vh,560px)] items-end overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured apps"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">{liveName ? `Featured: ${liveName}` : ""}</p>
      {/* ambient brand glow */}
      <div
        key={`glow-${i}`}
        className="pointer-events-none absolute -right-24 -top-32 h-[520px] w-[620px] rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle, #${s.brandHex}, transparent 62%)` }}
      />
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[520px] rounded-full bg-[var(--color-accent-violet)]/20 blur-3xl" />

      {/* giant ghost logo */}
      <div key={`mark-${i}`} className="fade-up pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-white/[0.06] lg:block">
        <ServiceLogo service={s} size={300} />
      </div>

      {/* scrims */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,13,0.92)_0%,rgba(7,9,13,0.55)_38%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,var(--color-bg-base)_0%,transparent_100%)]" />

      {/* content */}
      <div
        key={`content-${i}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${i + 1} of ${featured.length}: ${s.name}`}
        className="fade-up relative z-10 max-w-2xl px-6 pb-12 sm:px-10 lg:px-16"
      >
        <h1 className="sr-only">CabinStream — featured apps</h1>
        <div className="text-label font-semibold uppercase tracking-[0.18em] text-accent-cyan">Featured</div>
        <h2 className="mt-3 text-[clamp(40px,6vw,64px)] font-bold leading-[1.04] tracking-tight">
          {s.name}
        </h2>
        <p className="mt-3 max-w-md text-[18px] leading-relaxed text-text-secondary">
          {s.type === "youtube"
            ? "Search and watch in the built-in player when parked — for playback in Drive, use Live YouTube below."
            : s.type === "embed"
              ? "Live streams play right here in the built-in player."
              : `Opens ${s.name} in the car browser, tuned for the front seat.`}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={open} className="btn btn-primary">
            <PlayIcon className="h-5 w-5" />
            Open {s.name}
          </button>
          <button onClick={scrollDown} className="btn btn-secondary">
            All apps
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* page dots — 44px touch targets with visible focus */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center sm:right-8 lg:right-14">
        {featured.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => selectSlide(idx)}
            aria-label={`Show featured ${f.name}`}
            aria-current={idx === i ? "true" : undefined}
            className="flex h-11 min-w-11 items-center justify-center focus-ring rounded-full"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === i ? "w-6 accent-gradient" : "w-2 bg-white/45"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
