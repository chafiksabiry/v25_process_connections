import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable Turbopack for build to avoid font loading issues
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['v25.harx.ai', 'localhost'],
    },
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
      // Redirection vers les orchestrators internes (micro-frontends)
      {
        source: '/comporchestrator',
        destination: '/app11',
        permanent: false,
      },
      {
        source: '/comporchestrator/:path*',
        destination: '/app11/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
