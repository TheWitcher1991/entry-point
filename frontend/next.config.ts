import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Disable ESLint during build (we use oxlint separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build (we check separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
