/**
 * QA-скриншоты по фазам: ключевые страницы × ширины + спец-кадры.
 * Если сервер не запущен — поднимает `next dev`.
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

const bypassLoader = () => {
  try {
    window.sessionStorage.setItem("loxrate:entered", "1");
  } catch {
    /* noop */
  }
};

const effectsOff = () => {
  try {
    window.sessionStorage.setItem("loxrate:entered", "1");
    window.localStorage.setItem(
      "loxrate:prefs",
      JSON.stringify({ effects: false, sound: false }),
    );
  } catch {
    /* noop */
  }
};

const targets = [
  { name: "home", path: "/", widths: [375, 768, 1280, 1920], init: effectsOff },
  { name: "manifest", path: "/manifest", widths: [375, 1280] },
  { name: "ranks", path: "/ranks", widths: [375, 1280] },
  { name: "access", path: "/access", widths: [375, 1280] },
  { name: "lore", path: "/lore", widths: [375, 1280] },
  { name: "legal-rules", path: "/legal/rules", widths: [1280] },
  { name: "design", path: "/design", widths: [1280] },
  { name: "transitions", path: "/transitions", widths: [1280] },
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

async function preparePage(browser, width, height, options = {}) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: options.reducedMotion ?? "no-preference",
  });
  if (options.init) {
    await page.addInitScript(options.init);
  }
  return page;
}

async function waitForPage(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
}

async function shot(browser, target, width, height, options = {}) {
  const page = await preparePage(browser, width, height, options);
  await page.goto(`${baseUrl}${target.path}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await waitForPage(page);
  await page.screenshot({
    path: resolve(outDir, `${target.name}-${width}.png`),
    fullPage: true,
  });
  await page.close();
  console.log(`  + ${target.name}-${width}.png`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await ensureServer();

  const browser = await chromium.launch();

  try {
    for (const target of targets) {
      for (const width of target.widths) {
        await shot(browser, target, width, Math.round(width * 0.75), {
          init: target.init,
        });
      }
    }

    // Hero с включёнными эффектами (для «вайба»).
    {
      const page = await preparePage(browser, 1280, 960, {
        init: bypassLoader,
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await waitForPage(page);
      await page.screenshot({
        path: resolve(outDir, "home-hero-1280.png"),
        fullPage: false,
      });
      await page.close();
      console.log("  + home-hero-1280.png");
    }

    // Отдельно — «Порог» (без обхода лоадера).
    {
      const page = await preparePage(browser, 1280, 960, {
        init: () => {
          try {
            window.sessionStorage.removeItem("loxrate:entered");
          } catch {
            /* noop */
          }
        },
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({
        content: "nextjs-portal { display: none !important; }",
      });
      await page.waitForTimeout(1100);
      await page.screenshot({
        path: resolve(outDir, "threshold-1280.png"),
        fullPage: false,
      });
      await page.close();
      console.log("  + threshold-1280.png");
    }

    // Шейдерный переход в середине (T9).
    {
      const page = await preparePage(browser, 1280, 960);
      await page.goto(`${baseUrl}/transitions`, { waitUntil: "networkidle" });
      await waitForPage(page);
      await page.waitForTimeout(600);
      await page.getByRole("button", { name: /T9/ }).click();
      await page.waitForTimeout(280);
      await page.screenshot({
        path: resolve(outDir, "transition-t9-cover-1280.png"),
        fullPage: false,
      });
      await page.close();
      console.log("  + transition-t9-cover-1280.png");
    }

    // Курсор на интерактиве.
    {
      const page = await preparePage(browser, 1280, 960);
      await page.goto(`${baseUrl}/design`, { waitUntil: "networkidle" });
      await waitForPage(page);
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

    // Reduced-motion.
    {
      const page = await preparePage(browser, 1280, 960, {
        reducedMotion: "reduce",
      });
      await page.goto(`${baseUrl}/design`, { waitUntil: "networkidle" });
      await waitForPage(page);
      await page.screenshot({
        path: resolve(outDir, "design-reduced-1280.png"),
        fullPage: true,
      });
      await page.close();
      console.log("  + design-reduced-1280.png");
    }

    // Флагманская сцена «Основатели»: старт, середина (цитата), досье.
    {
      const page = await preparePage(browser, 1280, 960, {
        init: bypassLoader,
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await waitForPage(page);

      const scrollFounders = async (ratio) => {
        await page.evaluate((value) => {
          const element = document.getElementById("founders");
          if (!element) return;
          const total = element.offsetHeight - window.innerHeight;
          window.scrollTo(0, element.offsetTop + total * value);
        }, ratio);
        await page.waitForTimeout(900);
      };

      await scrollFounders(0.15);
      await page.mouse.move(640, 760);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: resolve(outDir, "founders-start-1280.png"),
        fullPage: false,
      });

      await scrollFounders(0.45);
      await page.mouse.move(640, 760);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: resolve(outDir, "founders-mid-1280.png"),
        fullPage: false,
      });

      await page
        .getByRole("button", { name: /Открыть досье/ })
        .first()
        .click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: resolve(outDir, "founders-dossier-1280.png"),
        fullPage: false,
      });

      await page.close();
      console.log(
        "  + founders-start-1280.png / founders-mid-1280.png / founders-dossier-1280.png",
      );
    }

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
