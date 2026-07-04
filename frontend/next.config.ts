import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Lock Turbopack root to frontend to avoid workspace lockfile inference warnings.
    root: __dirname,
  },
};

export default nextConfig;
