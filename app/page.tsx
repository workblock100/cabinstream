"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, ArrowRightIcon, CheckIcon } from "@/components/ui";
import { isAuthed, login } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed()) router.replace("/home");
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setErr(null);
    setBusy(true);
    if (!login(email.trim())) {
      setBusy(false);
      setErr("Couldn't save your sign-in. Enable site data / cookies for this site, then try again.");
      return;
    }
    router.push("/home");
  }

  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-screen flex-col overflow-hidden outline-none">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[460px] w-[460px] rounded-full bg-[var(--color-accent-cyan)]/15 blur-3xl drift" />
      <div className="pointer-events-none absolute -bottom-52 right-[-10%] h-[560px] w-[560px] rounded-full bg-[var(--color-accent-violet)]/20 blur-3xl drift" style={{ animationDelay: "-6s" }} />

      <div className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <span className="text-sm text-text-tertiary">Made for the car browser</span>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-12 lg:grid-cols-2 lg:px-10">
        <section className="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-hairline)] bg-white/5 px-4 py-1.5 text-sm text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_12px_var(--color-accent-cyan)]" />
            Built for the front passenger
          </span>
          <h1 className="mt-6 text-[clamp(44px,7vw,64px)] font-bold leading-[1.04] tracking-tight">
            Every app worth
            <br />
            watching, <span className="brand-text">in the front seat.</span>
          </h1>
          <p className="mt-6 max-w-md text-[18px] leading-relaxed text-text-secondary">
            One home screen for YouTube, TikTok, Twitch, Netflix and 16 more — tuned for
            your car&apos;s wide display. Sign in here, then open it in the car browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-text-secondary">
            <Feature>Big, glanceable touch tiles</Feature>
            <Feature>Built-in YouTube &amp; Twitch player</Feature>
            <Feature>Opens right in the car browser</Feature>
          </div>
        </section>

        <section className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass mx-auto w-full max-w-md rounded-xl p-7 sm:p-9">
            <h2 className="text-h2 font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1.5 text-text-secondary">Enter your email to continue.</p>
            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-text-secondary">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                />
              </div>
              <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
                {busy ? "One sec…" : "Continue"}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
            {err && (
              <p role="alert" className="mt-4 text-sm text-[var(--color-accent-red,#f87171)]">
                {err}
              </p>
            )}
            <p className="mt-6 text-center text-xs leading-relaxed text-text-tertiary">
              For passenger entertainment. Don&apos;t watch video while driving.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckIcon className="h-4 w-4 text-accent-cyan" />
      {children}
    </span>
  );
}
