import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
