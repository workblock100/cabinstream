"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/services";
import { tileGradient } from "@/lib/services";
import { getCabinUrl } from "@/lib/settings";
import { ServiceLogo } from "./ServiceLogo";
import { ArrowOutIcon } from "./ui";

export function AppTile({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const { from, to, fg } = tileGradient(service);
  const inApp = service.type === "youtube" || service.type === "embed";

  // The YouTube tile is the headline affordance, but the in-app player is parked-only
  // (HTML5 video blacks out in Drive). If a Cabin Browser (WebRTC) URL is configured,
  // route this one tile straight to the Live stream that survives motion.
  const [cabinUrl, setCabinUrl] = useState<string | null>(null);
  useEffect(() => {
    if (service.id === "youtube") setCabinUrl(getCabinUrl() || null);
  }, [service.id]);

  const isLive = service.id === "youtube" && !!cabinUrl;

  function handleOpen() {
    if (isLive) {
      window.open(cabinUrl!, "_blank", "noopener,noreferrer");
      return;
    }
    onOpen();
  }

  return (
    <div className="w-[158px] sm:w-[196px] lg:w-[216px]">
      <button
        onClick={handleOpen}
        aria-label={isLive ? `Open ${service.name} — live, plays while driving` : `Open ${service.name}`}
        className="tile group flex aspect-[16/10] w-full items-center justify-center"
        style={{ background: `linear-gradient(145deg, ${from}, ${to})`, color: fg }}
      >
        <span className="transition-transform duration-300 ease-out group-hover:scale-110">
          <ServiceLogo service={service} size={52} />
        </span>

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {isLive ? (
            <span className="badge badge-live">
              <span className="dot" />
              Live
            </span>
          ) : (
            inApp && <span className="badge badge-glass">Player</span>
          )}
        </div>
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          {service.drm && <span className="badge badge-glass">DRM</span>}
          {!service.drm && service.category === "Free" && <span className="badge badge-free">Free</span>}
        </div>

        {(!inApp || isLive) && (
          <span className="absolute bottom-2.5 right-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-90">
            <ArrowOutIcon className="h-4 w-4" />
          </span>
        )}
      </button>

      <div className="mt-2.5 px-0.5">
        <div className="truncate text-[15px] font-semibold text-text-primary">{service.name}</div>
        <div className="truncate text-[13px] text-text-tertiary">
          {isLive ? "Plays while driving" : service.tagline}
        </div>
      </div>
    </div>
  );
}
