import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 85, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 2048],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Static brand assets are immutable between releases; optimised derivatives
  // are cached by the image optimizer (minimumCacheTTL above).
  async headers() {
    const year = 60 * 60 * 24 * 365;
    return [
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${year}, immutable` },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
