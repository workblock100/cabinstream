"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { EmbedView } from "@/components/EmbedView";
import { LaunchOut } from "@/components/LaunchOut";
import { getService, type Service } from "@/lib/services";
import { isAuthed } from "@/lib/session";

export function WatchScreen() {
  const router = useRouter();
  const params = useParams<{ service: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  const service: Service | undefined = getService(params.service);

  if (!ready) return <main id="main" tabIndex={-1} className="min-h-dvh outline-none" />;

  if (!service) {
    return (
      <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col outline-none">
        <TopBar backHref="/home" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-h2 font-semibold">Service not found</h1>
          <button onClick={() => router.push("/home")} className="btn btn-secondary">
            Back to home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col outline-none">
      <TopBar backHref="/home" />
      {(service.type === "youtube" || service.type === "embed") && (
        <div className="mx-auto w-full max-w-6xl px-6 pb-1 pt-2 sm:px-10 lg:px-16">
          <h1 className="text-h2 font-semibold tracking-tight">{service.name}</h1>
          <p className="text-sm text-text-tertiary">{service.tagline}</p>
        </div>
      )}
      <div className="mt-4 flex flex-1 flex-col">
        {service.type === "youtube" && <YouTubePlayer />}
        {service.type === "embed" && <EmbedView />}
        {service.type === "launch" && <LaunchOut service={service} />}
      </div>
    </main>
  );
}
