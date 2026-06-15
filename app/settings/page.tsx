"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { ArrowOutIcon, CheckIcon } from "@/components/ui";
import { isAuthed } from "@/lib/session";
import { getCabinUrl, setCabinUrl } from "@/lib/settings";

export default function SettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/");
      return;
    }
    const stored = getCabinUrl();
    setUrl(stored);
    setSavedUrl(stored);
    setReady(true);
  }, [router]);

  if (!ready) return <main id="main" tabIndex={-1} className="min-h-dvh outline-none" />;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!setCabinUrl(url)) {
      setError(true);
      return;
    }
    setError(false);
    const stored = getCabinUrl();
    setUrl(stored);
    setSavedUrl(stored);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col outline-none">
      <TopBar backHref="/home" />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-2 sm:px-10">
        <h1 className="text-h2 font-semibold tracking-tight">Cabin Browser</h1>
        <p className="mt-2 max-w-xl leading-relaxed text-text-secondary">
          Your Cabin Browser is a Chromium running on your always-on home computer, streamed to the car
          over WebRTC. Log into YouTube once there and it stays logged in — and because it&apos;s WebRTC,
          it keeps playing while the car is in Drive. Paste its public URL here.
        </p>

        <form onSubmit={save} className="mt-7 space-y-4">
          <label htmlFor="cabin-url" className="block text-sm text-text-secondary">
            Cabin Browser URL
          </label>
          <input
            id="cabin-url"
            type="url"
            inputMode="url"
            placeholder="https://your-tunnel.trycloudflare.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(false);
            }}
            className="field"
            aria-invalid={error}
            aria-describedby={error ? "cabin-url-error" : undefined}
          />
          {error && (
            <p id="cabin-url-error" role="alert" className="text-sm text-[#f87171]">
              That doesn&apos;t look like a valid URL. Try something like https://your-tunnel.trycloudflare.com
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">
              {saved ? (
                <>
                  <CheckIcon className="h-5 w-5" /> Saved
                </>
              ) : (
                "Save"
              )}
            </button>
            {savedUrl && (
              <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Open it <ArrowOutIcon className="h-5 w-5" />
              </a>
            )}
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {saved ? "Cabin Browser URL saved" : ""}
          </p>
        </form>

        <div className="mt-10 rounded-xl border border-[var(--color-border-divider)] bg-white/[0.03] p-5 text-sm leading-relaxed text-text-tertiary">
          <p className="mb-2 font-semibold text-text-secondary">First-time setup (on your home computer)</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Start the Cabin Browser stack (Docker / Neko) — see <code>~/cabin-browser</code>.</li>
            <li>Open the stream on the computer, sign in with the Neko password, and log into YouTube once.</li>
            <li>Start the Cloudflare tunnel to get a public URL, and paste it above.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
