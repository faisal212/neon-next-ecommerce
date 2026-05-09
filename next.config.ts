import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Drop Next's polyfill-module from client bundles. Aliases the polyfill
  // path to an empty module so Turbopack inlines `{}` instead of the
  // ~10–15 KB backfill bundle. Targets modern browsers only — older
  // Safari/Edge that need `Promise.withResolvers` etc. would break here.
  turbopack: {
    resolveAlias: {
      "next/dist/build/polyfills/polyfill-module": path.resolve(
        "./lib/empty.js",
      ),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'assets.refine.pk',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1440, 1700, 1920, 2048],
    minimumCacheTTL: 31536000,
    qualities: [75, 85],
  },
};

export default nextConfig;
