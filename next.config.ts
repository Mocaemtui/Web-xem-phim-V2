import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ophim1.com",
      },
      {
        protocol: "https",
        hostname: "img.ophim1.com",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
      },
    ],
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
