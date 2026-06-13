"use client";

import type { Service } from "@/lib/services";
import { tileGradient } from "@/lib/services";
import { ServiceLogo } from "./ServiceLogo";
import { ArrowOutIcon } from "./ui";

export function AppTile({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const { from, to, fg } = tileGradient(service);
  const inApp = service.type === "youtube" || service.type === "embed";

  return (
    <div className="w-[158px] sm:w-[196px] lg:w-[216px]">
      <button
        onClick={onOpen}
        aria-label={`Open ${service.name}`}
        className="tile group flex aspect-[16/10] w-full items-center justify-center"
        style={{ background: `linear-gradient(145deg, ${from}, ${to})`, color: fg }}
      >
        <span className="transition-transform duration-300 ease-out group-hover:scale-110">
          <ServiceLogo service={service} size={52} />
        </span>

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {inApp && <span className="badge badge-glass">Player</span>}
        </div>
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          {service.drm && <span className="badge badge-glass">DRM</span>}
          {!service.drm && service.category === "Free" && <span className="badge badge-free">Free</span>}
        </div>

        {!inApp && (
          <span className="absolute bottom-2.5 right-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-90">
            <ArrowOutIcon className="h-4 w-4" />
          </span>
        )}
      </button>

      <div className="mt-2.5 px-0.5">
        <div className="truncate text-[15px] font-semibold text-text-primary">{service.name}</div>
        <div className="truncate text-[13px] text-text-tertiary">{service.tagline}</div>
      </div>
    </div>
  );
}
