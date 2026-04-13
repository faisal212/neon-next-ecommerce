import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
