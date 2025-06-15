import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler:{
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ufs.sh', // Wildcard for any UploadThing domain
      },
    ],
  },
};

export default nextConfig;
