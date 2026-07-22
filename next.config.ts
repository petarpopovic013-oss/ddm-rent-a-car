import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obtjnbhzitkuvvlabjrb.supabase.co",
        pathname: "/storage/v1/object/public/rc-vehicle-images/**",
      },
    ],
  },
};

export default nextConfig;
