import { expect, test } from "@playwright/test";

const bypassLoader = () => {
  try {
    window.sessionStorage.setItem("loxrate:entered", "1");
  } catch {
    /* noop */
  }
};

test("главная: hero и CTA", async ({ page }) => {
  await page.addInitScript(bypassLoader);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Будь");
  await expect(
    page.getByRole("link", { name: "Войти в Подвал" }),
  ).toBeVisible();
});

test("статические страницы отвечают", async ({ page }) => {
  const pages: Array<[string, string]> = [
    ["/manifest", "Манифест"],
    ["/founders", "Основатели"],
    ["/ranks", "Лестница рангов"],
    ["/access", "Уровни доступа"],
    ["/lore", "Лор"],
    ["/vault", "Видео"],
    ["/ideas", "Идеи"],
    ["/hall", "Зал славы"],
    ["/login", "Вход"],
    ["/legal/rules", "Правила сообщества"],
  ];

  for (const [path, heading] of pages) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
  }
});

test("health и SEO-эндпоинты", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap");

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/manifest");
});
