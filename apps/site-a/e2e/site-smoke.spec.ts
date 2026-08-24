import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = {
  home: "/",
  article: "/article/government24-resident-registration-guide",
  search: "/search",
} as const;

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;

function watchRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  return errors;
}

async function openRoute(page: Page, path: string): Promise<string[]> {
  const runtimeErrors = watchRuntimeErrors(page);
  const response = await page.goto(path, { waitUntil: "networkidle" });

  expect(response?.ok(), `${path} should return a successful response`).toBe(true);
  await expect(page.locator("main")).toBeVisible();
  return runtimeErrors;
}

async function expectPageQuality(page: Page, runtimeErrors: readonly string[]): Promise<void> {
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(
    widths.scroll,
    `document width ${widths.scroll}px exceeds viewport width ${widths.client}px`,
  ).toBeLessThanOrEqual(widths.client);

  const { violations } = await new AxeBuilder({ page })
    .withTags([...axeTags])
    .analyze();
  const summary = violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  expect(violations, JSON.stringify(summary, null, 2)).toEqual([]);
  expect(runtimeErrors).toEqual([]);
}

test.describe("Site A release quality", () => {
  test("home exposes the published theme and navigation", async ({ page }) => {
    const runtimeErrors = await openRoute(page, routes.home);

    await expect(page.locator('[data-theme="minimal-knowledge-base"]')).toBeVisible();
    await expect(page.getByRole("heading", {
      level: 1,
      name: "생활메모",
    })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "생활메모" })).toBeVisible();

    await expectPageQuality(page, runtimeErrors);
  });

  test("search returns the known published article", async ({ page }) => {
    const runtimeErrors = await openRoute(page, routes.search);

    await expect(page.getByRole("heading", { level: 1, name: "검색" })).toBeVisible();
    await page.getByLabel("찾고 싶은 안내").fill("정부24");
    await page.getByRole("button", { name: "검색", exact: true }).click();
    await expect(page.getByText("검색이 완료되었습니다.")).toBeVisible();
    await expect(page.getByRole("link", {
      name: "정부24 주민등록등본 발급 방법",
    })).toBeVisible();

    await expectPageQuality(page, runtimeErrors);
  });

  test("article exposes its heading, breadcrumb, and contents", async ({ page }) => {
    const runtimeErrors = await openRoute(page, routes.article);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "정부24 주민등록등본 발급 방법",
      }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "현재 위치" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "문서 목차" })).toBeVisible();

    await expectPageQuality(page, runtimeErrors);
  });
});
