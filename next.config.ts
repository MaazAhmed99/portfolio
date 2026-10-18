import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The parent Desktop\New-Dev folder has its own package-lock.json, which makes
  // Next infer the wrong workspace root. Pin it to this project.
  outputFileTracingRoot: path.resolve(__dirname),

  // Lets a production build run beside `next dev` without both writing to
  // .next (which breaks the dev server): NEXT_DIST_DIR=.next-prod next build
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Screenshots are large PNGs; keep the build honest about what it ships.
  poweredByHeader: false,
};

export default nextConfig;
