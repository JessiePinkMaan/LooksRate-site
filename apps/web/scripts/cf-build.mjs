/**
 * Сборка для Cloudflare Workers.
 * OpenNext запускает `next build`, поэтому CF_WORKERS нужен уже на этом шаге:
 * next.config переключает output/images под Workers.
 */
import { spawnSync } from "node:child_process";

if (!process.env.SITE_URL) {
  console.warn(
    "[cf:build] SITE_URL не задан: robots.txt и sitemap.xml уедут с localhost.",
  );
}

const result = spawnSync("opennextjs-cloudflare", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CF_WORKERS: "true" },
});

process.exit(result.status ?? 1);
