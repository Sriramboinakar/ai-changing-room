import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native binary — must load outside Turbopack's bundler.
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default nextConfig;
