import type { NextConfig } from "next";

// When GH_PAGES=1 (GitHub Pages CI), build a fully static site served from /cabinstream.
// Default build stays dynamic and is zero-config for Vercel.
const isGhPages = process.env.GH_PAGES === "1";
const repo = "cabinstream";

const nextConfig: NextConfig = isGhPages
  ? {
      output: "export",
      basePath: `/${repo}`,
      images: { unoptimized: true },
      trailingSlash: true,
    }
  : {};

export default nextConfig;
