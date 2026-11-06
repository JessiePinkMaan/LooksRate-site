import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { NextConfig } from "next";

// В монорепе .env лежит в корне, а Next ищет его в apps/web.
// Загружаем корневой .env до старта приложения (не перекрывая уже заданные переменные).
const rootEnvFile = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

// Сборка под Cloudflare Workers (OpenNext) несовместима с `standalone`
// и с серверной оптимизацией картинок.
const onWorkers =
  process.env.CF_WORKERS === "true" || process.env.CF_WORKERS === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: onWorkers ? undefined : "standalone",
  devIndicators: false,
  images: onWorkers ? { unoptimized: true } : undefined,
  // Prisma должен остаться внешним пакетом, иначе OpenNext не сможет
  // подменить клиент на версию для Workers.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  transpilePackages: ["@loxrate/config", "@loxrate/ui", "@loxrate/db"],
  async rewrites() {
    // Next не роутит папки с `_`, поэтому стенд живёт в /design,
    // а путь из ТЗ `/_design` ведёт на него.
    return [
      { source: "/_design", destination: "/design" },
      { source: "/_transitions", destination: "/transitions" },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      },
      {
        key: "Content-Security-Policy",
        value:
          "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
      },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: noindex },
      { source: "/dev/:path*", headers: noindex },
      { source: "/design", headers: noindex },
      { source: "/transitions", headers: noindex },
      { source: "/me", headers: noindex },
      { source: "/login", headers: noindex },
      { source: "/settings", headers: noindex },
    ];
  },
};

export default nextConfig;
