"use client";

import type { Service } from "@/lib/services";
import { tileGradient } from "@/lib/services";
import { ServiceLogo } from "./ServiceLogo";
import { ArrowOutIcon } from "./ui";

/** For DRM / non-embeddable services: a clear hand-off into the car browser. */
export function LaunchOut({ service }: { service: Service }) {
  const { from, to, fg } = tileGradient(service);

  function open() {
    window.open(service.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-6 text-center">
      <div
        className="tile flex h-36 w-36 items-center justify-center"
        style={{ background: `linear-gradient(145deg, ${from}, ${to})`, color: fg }}
      >
        <ServiceLogo service={service} size={68} />
      </div>

      <h1 className="mt-8 text-[40px] font-bold tracking-tight">Open {service.name}</h1>
      <p className="mt-3 max-w-md text-[17px] leading-relaxed text-text-secondary">
        {service.drm ? (
          <>
            {service.name} is DRM-protected, so it plays in its own web app — not inside CabinStream.
            We&apos;ll open it in the car browser. Sign in to {service.name} there; playback depends on
            what the browser supports.
          </>
        ) : (
          <>We&apos;ll open {service.name} in the car browser. Sign in there and you&apos;re set.</>
        )}
      </p>

      <button onClick={open} className="btn btn-primary mt-8 w-full max-w-xs">
        Open {service.name}
        <ArrowOutIcon className="h-5 w-5" />
      </button>
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center break-all py-2 text-sm text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
      >
        {service.url}
      </a>
    </div>
  );
}
