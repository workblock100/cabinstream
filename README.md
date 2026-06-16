# CabinStream

A premium in-car streaming launcher for the **Tesla browser**, built for the front passenger.
One cinematic home screen for 20 services — and, crucially, a way to keep **YouTube playing while
the car is in Drive**.

🚗 Live: **https://workblock100.github.io/cabinstream/** · 🎯 Target device: **Tesla Model Y** (in-car Chromium)

> For passenger entertainment. Don't watch video while driving.

## The problem it solves

Tesla blocks normal HTML5 / MSE video the moment the car shifts into Drive — the in-app YouTube and
Twitch players go black in motion. But the in-car browser is a full Chromium, and **the WebRTC media
pipeline is *not* subject to the in-motion video lock**. CabinStream is built around that distinction:

- **Parked** → use the built-in players in the app.
- **In Drive** → hand off to a **WebRTC "Cabin Browser"** that keeps playing.

## How it works

**Built-in players (parked only)**
- **YouTube** — a custom player with keyless search (public Piped / Invidious instances, with
  multi-instance fallback) and "jump back in" history. Paste a link or search by words.
- **Twitch** — in-app embed by channel.

Both show a clear *"Parked only"* notice and point to the Cabin Browser for in-drive playback.

**Live YouTube — the Cabin Browser (plays in Drive)**
A persistent Chromium running on an always-on home machine via [Neko](https://github.com/m1k1o/neko),
logged into YouTube once and streamed to the car over **WebRTC**. Because the media rides WebRTC, it
survives the in-motion video lock. You save the stream's public URL in **Settings**, and the
"Live YouTube" tiles/banners open it. (The Neko/Docker/tunnel setup lives outside this repo.)

**Launch-out tiles**
The other 18 services (Netflix, Disney+, Prime Video, HBO Max, Hulu, Apple TV+, Paramount+, Peacock,
Crunchyroll, TikTok, ESPN, Spotify, Apple Music, SoundCloud, Tubi, Pluto TV, Plex, YouTube Music)
open in the car browser. The 9 DRM services can't be re-hosted (Widevine), so launch-out is by design.

Catalog is organized into **Video · Live · Music · Free** rows with a cinematic hero, official brand
logos (`simple-icons`), and large touch targets.

## Built for the Model Y

Every change is gated against what the in-car browser actually supports: **Chromium 140**
(Tesla 2026.14+), touch-only ~1280px landscape, autoplay-requires-gesture, Widevine L3, no PWA
install, and `localStorage` that persists across sleep. WebRTC video plays in Drive; HTML5/MSE does not.

## Stack

Next.js 16 (App Router, static export) · React 19 · Tailwind v4 · TypeScript · `simple-icons`.
No backend, no payments — sign-in is a local-only convenience (`localStorage`).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Test

```bash
npm test           # Vitest — 54 unit tests over the pure/localStorage logic
```

Tests cover the bug-prone logic (YouTube link/ID parsing, search-result mapping, Twitch channel
parsing, Cabin-URL normalization + scheme allowlist, recents, session). They run in CI on every push
via a separate workflow and are excluded from the production build.

## Deploy

- **GitHub Pages** (automatic): pushing to `main` runs `.github/workflows/deploy.yml`, which builds a
  static export (`GH_PAGES=1 next build`, basePath `/cabinstream`) and publishes it.
- **Vercel** (zero-config): import the repo, or `npx vercel --prod`.
