import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Mirror the basePath set in next.config.ts — Next does NOT rewrite string fields
// inside the manifest body, so the static-export (GitHub Pages) build needs the prefix.
const basePath = process.env.GH_PAGES === "1" ? "/cabinstream" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CabinStream — Front-seat streaming",
    short_name: "CabinStream",
    description:
      "Stream YouTube, TikTok, Twitch, Netflix and more from your car's browser.",
    start_url: `${basePath}/`,
    display: "standalone",
    orientation: "landscape",
    background_color: "#07090d",
    theme_color: "#07090d",
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
