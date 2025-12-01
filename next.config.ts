import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN || '',
    '*.replit.dev',
    'localhost:5000',
    '127.0.0.1:5000',
  ].filter(Boolean),
};

export default nextConfig;
