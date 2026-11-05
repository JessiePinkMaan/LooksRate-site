/**
 * QA-скриншоты: 4 ширины + reduced-motion, в qa/shots/phase-N/.
 * Самодостаточно: если сервер не запущен, поднимает `next start`.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..");
const repoRoot = resolve(here, "../../..");
const phase = process.env.QA_PHASE ?? "phase-1";
const outDir = resolve(repoRoot, "qa", "shots", phase);
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";

const widths = [375, 768, 1280, 1920];
const routes = [
  { name: "home", path: "/" },
  { name: "design", path: "/design" },
];

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

  console.log(`[qa:shots] Поднимаю next dev (${baseUrl})…`);
  server = spawn("pnpm", ["dev"], {
    cwd: appDir,
    shell: true,
    stdio: "ignore",
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

async function shot(browser, path, name, width, height, options = {}) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    ...options,
  });
  await page.goto(`${baseUrl}${path}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  // Дать шрифтам устояться и спрятать dev-оверлей Next.
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: resolve(outDir, `${name}-${width}.png`),
    fullPage: true,
  });
  await page.close();
  console.log(`  + ${name}-${width}.png`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await ensureServer();

  const browser = await chromium.launch();

  try {
    for (const route of routes) {
      for (const width of widths) {
        const height = Math.round(width * 0.75);
        await shot(browser, route.path, route.name, width, height);
      }
    }

    // Проверка rewrite `/_design` → `/design` (одна ширина).
    await shot(browser, "/_design", "design-alias", 1280, 960);

    // Курсор на интерактиве (критерий 5).
    {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 960 },
        deviceScaleFactor: 1,
      });
      await page.goto(`${baseUrl}/design`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({
        content: "nextjs-portal { display: none !important; }",
      });
      await page
        .getByRole("button", { name: "Удерживай, чтобы войти" })
        .hover();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: resolve(outDir, "design-cursor-1280.png"),
        fullPage: false,
      });
      await page.close();
      console.log("  + design-cursor-1280.png");
    }

    // Reduced-motion проход.
    await shot(browser, "/design", "design-reduced", 1280, 960, {
      reducedMotion: "reduce",
    });

    console.log(`[qa:shots] Готово: ${outDir}`);
  } finally {
    await browser.close();
    stopServer();
  }
}

main().catch((error) => {
  console.error("[qa:shots] Ошибка:", error);
  stopServer();
  process.exitCode = 1;
});
