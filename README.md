# CabinStream

A premium in-car streaming launcher for the **Tesla browser** — built for the front passenger.
One home screen for YouTube, TikTok, Twitch, Netflix and 16 more, tuned for the wide car display.

- **Built-in player** for YouTube (with keyless search) and Twitch — plays in-app.
- **Launch-out** for DRM services (Netflix, Disney+, Prime Video, Max, Hulu, Apple TV+, Paramount+, Peacock, Crunchyroll) — opened in the car browser, since DRM content can't be re-hosted.
- TV-home layout: cinematic hero + category rows, official brand logos, big touch targets.

> For passenger entertainment. Don't watch video while driving.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · `simple-icons`. No backend, no payments — auth is a local-only convenience.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy

- **GitHub Pages** (automatic): pushing to `main` runs `.github/workflows/deploy.yml`, which builds a static export (`GH_PAGES=1 next build`) and publishes it.
- **Vercel** (zero-config): import the repo, or run `npx vercel --prod`. The default build is dynamic and Vercel-ready.
