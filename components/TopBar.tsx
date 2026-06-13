"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, BackIcon, SearchIcon, SignOutIcon, SettingsIcon } from "./ui";
import { getEmail, logout } from "@/lib/session";

export function TopBar({ backHref }: { backHref?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    setEmail(getEmail());

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    tick();
    const id = setInterval(tick, 10000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(id);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex h-[72px] items-center justify-between gap-3 px-6 transition-all duration-300 sm:px-10 lg:px-16 ${
        scrolled
          ? "border-b border-[var(--color-border-divider)] bg-[rgba(20,24,33,0.72)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            aria-label="Back"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-hairline)] bg-white/5 transition hover:bg-white/10"
          >
            <BackIcon className="h-5 w-5" />
          </button>
        )}
        <Logo />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={() => router.push("/watch/youtube")}
          aria-label="Search"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-hairline)] bg-white/5 text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={() => router.push("/settings")}
          aria-label="Settings"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-hairline)] bg-white/5 text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
        >
          <SettingsIcon className="h-[18px] w-[18px]" />
        </button>

        <span className="hidden text-[18px] font-medium tabular-nums text-text-secondary sm:inline">
          {clock}
        </span>

        {email && (
          <span className="hidden max-w-[160px] truncate text-sm text-text-tertiary md:inline">
            {email}
          </span>
        )}

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          aria-label="Sign out"
          className="flex h-12 items-center gap-2 rounded-full border border-[var(--color-border-hairline)] bg-white/5 px-4 text-sm text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
        >
          <SignOutIcon className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
