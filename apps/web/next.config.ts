import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { NextConfig } from "next";

// В монорепе .env лежит в корне, а Next ищет его в apps/web.
// Загружаем корневой .env до старта приложения (не перекрывая уже заданные переменные).
const rootEnvFile = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  transpilePackages: ["@loxrate/config", "@loxrate/ui"],
  async rewrites() {
    // Next не роутит папки с `_`, поэтому стенд живёт в /design,
    // а путь из ТЗ `/_design` ведёт на него.
    return [
      { source: "/_design", destination: "/design" },
      { source: "/_transitions", destination: "/transitions" },
    ];
  },
};

export default nextConfig;
