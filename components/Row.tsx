"use client";

import { useRouter } from "next/navigation";
import type { Service } from "@/lib/services";
import { AppTile } from "./AppTile";
import { trackOpen } from "@/lib/recents";

export function Row({ title, services }: { title: string; services: Service[] }) {
  const router = useRouter();
  if (!services.length) return null;

  function open(s: Service) {
    trackOpen(s.id);
    router.push(`/watch/${s.id}`);
  }

  return (
    <section className="mt-10 first:mt-0">
      <h2 className="mb-4 flex items-center gap-3 px-6 text-h3 font-semibold tracking-tight sm:px-10 lg:px-16">
        {title}
        <span className="h-[3px] w-8 rounded-full accent-gradient" />
      </h2>
      <div className="row-scroll px-6 pb-2 sm:px-10 lg:px-16">
        {services.map((s) => (
          <AppTile key={s.id} service={s} onOpen={() => open(s)} />
        ))}
      </div>
    </section>
  );
}
