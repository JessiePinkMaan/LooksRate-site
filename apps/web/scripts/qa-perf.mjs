/**
 * Перф-бюджеты R1: LCP/CLS + размер JS/CSS/трансфера (production build).
 * Запуск: сначала `pnpm build`, затем `pnpm qa:perf`.
 * Отчёт — qa/reports/perf.json. Падает при выходе за бюджеты.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..");
const repoRoot = resolve(here, "../../..");
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const reportDir = resolve(repoRoot, "qa", "reports");

const budgets = {
  lcpMs: 2500,
  cls: 0.1,
  initialJsBytes: 250 * 1024,
};

let server = null;

async function isUp() {
  try {
    const response = await fetch(baseUrl, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isUp()) return;
  console.log(`[qa:perf] Поднимаю next start (${baseUrl})…`);
  server = spawn("pnpm", ["start"], {
    cwd: appDir,
    shell: true,
    stdio: "ignore",
    env: {
      ...process.env,
      NODE_ENV: "production",
      // Production-safe окружение для локального прогона (guard §22).
      DEV_LOGIN: "false",
      TELEGRAM_MODE: "live",
      PAYMENT_PROVIDERS: "stars",
    },
  });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await isUp()) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Сервер не поднялся за 60 с: ${baseUrl}`);
}

function stopServer() {
  if (!server) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    server.kill("SIGTERM");
  }
  server = null;
}

async function measure(browser, path) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 960 },
  });

  await page.addInitScript(() => {
    window.__lcp = 0;
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lcp = entry.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* noop */
    }
  });

  await page.goto(`${baseUrl}${path}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(2500);

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const sum = (items) =>
      items.reduce((total, item) => total + (item.transferSize || 0), 0);
    const js = resources.filter((item) => item.name.includes(".js"));
    const css = resources.filter((item) => item.name.includes(".css"));
    return {
      lcpMs: Math.round(window.__lcp ?? 0),
      cls: Number((window.__cls ?? 0).toFixed(4)),
      jsBytes: sum(js),
      cssBytes: sum(css),
      transferBytes: sum(resources),
      requests: resources.length,
      domContentLoadedMs: Math.round(
        navigation?.domContentLoadedEventEnd ?? 0,
      ),
      loadMs: Math.round(navigation?.loadEventEnd ?? 0),
    };
  });

  await page.close();
  return metrics;
}

async function main() {
  await mkdir(reportDir, { recursive: true });
  await ensureServer();

  const browser = await chromium.launch();
  const results = [];
  let failed = 0;

  try {
    for (const path of ["/", "/manifest"]) {
      const metrics = await measure(browser, path);
      const problems = [];
      if (metrics.lcpMs > budgets.lcpMs) problems.push("LCP");
      if (metrics.cls > budgets.cls) problems.push("CLS");
      if (metrics.jsBytes > budgets.initialJsBytes) problems.push("JS");
      if (problems.length) failed += 1;

      results.push({ path, metrics, problems });
      console.log(
        `  ${path}: LCP ${metrics.lcpMs}ms · CLS ${metrics.cls} · JS ${Math.round(
          metrics.jsBytes / 1024,
        )} КБ · CSS ${Math.round(metrics.cssBytes / 1024)} КБ · transfer ${Math.round(
          metrics.transferBytes / 1024,
        )} КБ${problems.length ? ` · ВНЕ БЮДЖЕТА: ${problems.join(", ")}` : ""}`,
      );
    }

    await writeFile(
      resolve(reportDir, "perf.json"),
      JSON.stringify({ budgets, results }, null, 2),
      "utf8",
    );
    console.log(`[qa:perf] Отчёт: ${resolve(reportDir, "perf.json")}`);
  } finally {
    await browser.close();
    stopServer();
  }

  if (failed > 0) {
    console.error("[qa:perf] Есть страницы вне бюджета.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[qa:perf] Ошибка:", error);
  stopServer();
  process.exitCode = 1;
});
