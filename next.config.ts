import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/trending',
        destination: '/explore',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        pathname: '/igdb/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
