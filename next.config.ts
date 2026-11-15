import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 2048],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
