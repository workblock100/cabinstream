"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { CabinBrowserBanner } from "@/components/CabinBrowserBanner";
import { Row } from "@/components/Row";
import { CATEGORY_ORDER, getService, servicesByCategory, type Category, type Service } from "@/lib/services";
import { isAuthed } from "@/lib/session";
import { getRecents } from "@/lib/recents";

const CATEGORY_TITLE: Record<Category, string> = {
  Video: "Video",
  Live: "Live & sports",
  Music: "Music",
  Free: "Free to watch",
};

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [recents, setRecents] = useState<Service[]>([]);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/");
      return;
    }
    setRecents(getRecents().map(getService).filter((s): s is Service => Boolean(s)));
    setReady(true);
  }, [router]);

  if (!ready) return <main id="main" tabIndex={-1} className="min-h-screen outline-none" />;

  return (
    <main id="main" tabIndex={-1} className="min-h-screen outline-none">
      <TopBar />
      <Hero />
      <CabinBrowserBanner />

      <div className="py-10">
        {recents.length > 0 && <Row title="Jump back in" services={recents} />}
        {CATEGORY_ORDER.map((c) => (
          <Row key={c} title={CATEGORY_TITLE[c]} services={servicesByCategory(c)} />
        ))}
      </div>

      <footer className="border-t border-[var(--color-border-divider)] px-6 py-8 text-sm leading-relaxed text-text-tertiary sm:px-10 lg:px-16">
        <p className="max-w-3xl">
          <span className="text-text-secondary">Heads up —</span> Netflix, Disney+, Prime Video, Max,
          Hulu, Apple TV+, Paramount+, Peacock and Crunchyroll are DRM-protected, so CabinStream opens
          them in the car browser; playback depends on what the browser supports. YouTube and Twitch run
          in the built-in player. For passenger entertainment — don&apos;t watch video while driving.
        </p>
      </footer>
    </main>
  );
}
