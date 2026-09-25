import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages. NEXT_PUBLIC_BASE_PATH is set by the deploy
 * workflow (e.g. "/ai-atlas"); it stays empty for local development.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
