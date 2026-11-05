/**
 * a11y-аудит на axe-core: ключевые страницы, отчёт в qa/reports/axe.json.
 * Падает (exit 1) при serious/critical нарушениях.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..");
const repoRoot = resolve(here, "../../..");
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const reportDir = resolve(repoRoot, "qa", "reports");

const effectsOff = () => {
  try {
    window.localStorage.setItem(
      "loxrate:prefs",
      JSON.stringify({ effects: false, sound: false }),
    );
  } catch {
    /* noop */
  }
};

const bypassLoader = () => {
  effectsOff();
  try {
    window.sessionStorage.setItem("loxrate:entered", "1");
  } catch {
    /* noop */
  }
};

const showThreshold = () => {
  effectsOff();
  try {
    window.sessionStorage.removeItem("loxrate:entered");
  } catch {
    /* noop */
  }
};

const pages = [
  { name: "home", path: "/", init: bypassLoader },
  { name: "threshold", path: "/", init: showThreshold },
  { name: "manifest", path: "/manifest", init: effectsOff },
  { name: "ranks", path: "/ranks", init: effectsOff },
  { name: "access", path: "/access", init: effectsOff },
  { name: "lore", path: "/lore", init: effectsOff },
  { name: "founders", path: "/founders", init: effectsOff },
  { name: "vault", path: "/vault", init: effectsOff },
  {
    name: "vault-video",
    path: "/vault/welcome-to-vault",
    init: effectsOff,
  },
  { name: "ideas", path: "/ideas", init: effectsOff },
  { name: "hall", path: "/hall", init: effectsOff },
  { name: "login", path: "/login", init: effectsOff },
  { name: "legal-rules", path: "/legal/rules", init: effectsOff },
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
  console.log(`[qa:a11y] Поднимаю next dev (${baseUrl})…`);
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

async function main() {
  await mkdir(reportDir, { recursive: true });
  await ensureServer();

  const browser = await chromium.launch();
  const results = [];
  let blocking = 0;

  try {
    for (const target of pages) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 960 },
      });
      const page = await context.newPage();
      if (target.init) await page.addInitScript(target.init);

      await page.goto(`${baseUrl}${target.path}`, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);

      const analysis = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = analysis.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact ?? "minor",
        help: violation.help,
        nodes: violation.nodes.length,
        targets: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
      }));

      const serious = violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      );
      blocking += serious.length;

      results.push({ page: target.name, violations });
      console.log(
        `  ${target.name}: ${violations.length} violations` +
          (serious.length ? ` (${serious.length} serious/critical)` : ""),
      );
      for (const violation of serious) {
        console.log(
          `    ! ${violation.id} [${violation.impact}] ×${violation.nodes} — ${violation.help}`,
        );
      }

      await page.close();
      await context.close();
    }

    await writeFile(
      resolve(reportDir, "axe.json"),
      JSON.stringify(results, null, 2),
      "utf8",
    );
    console.log(`[qa:a11y] Отчёт: ${resolve(reportDir, "axe.json")}`);
  } finally {
    await browser.close();
    stopServer();
  }

  if (blocking > 0) {
    console.error(`[qa:a11y] serious/critical: ${blocking} — нужно исправить.`);
    process.exitCode = 1;
  } else {
    console.log("[qa:a11y] serious/critical нет.");
  }
}

main().catch((error) => {
  console.error("[qa:a11y] Ошибка:", error);
  stopServer();
  process.exitCode = 1;
});
