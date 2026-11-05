import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@loxrate/config", "@loxrate/ui"],
};

export default nextConfig;
