import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This can help with some turbopack issues
  },
  // To silence the Turbopack error if you have a custom webpack config (which next-pwa adds)
  // You can set turbopack: {} or use --webpack flag in build
};

export default withPWA(nextConfig);
