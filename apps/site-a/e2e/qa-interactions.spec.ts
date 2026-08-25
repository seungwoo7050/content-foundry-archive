import { expect, test, type Page } from "@playwright/test";

import { QA_QUALITY_VARIANTS } from "../qa/variants";

const qualityVariantId = process.env.QUALITY_VARIANT_ID;
const qualityVariant = qualityVariantId === undefined
  ? undefined
  : QA_QUALITY_VARIANTS.find(({ id }) => id === qualityVariantId);
if (qualityVariantId !== undefined && qualityVariant === undefined) {
  throw new Error("QUALITY_VARIANT_ID must exactly match an entry in QA_QUALITY_VARIANTS");
}

const richArticlePath =
  "/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-" +
  "gallery-faq-source-update-related-action";

async function openQaRoute(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.ok(), `${path} should return success`).toBe(true);
  await expect(page.locator("main")).toBeVisible();
}

test.describe("QA deterministic interactions", () => {
  if (qualityVariant === undefined) return;

  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "QA interactions run only in the Chromium desktop project",
    );
  });

  test("keyboard skip link moves focus to main", async ({ page }) => {
    await openQaRoute(page, "/");
    await page.keyboard.press("Tab");
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("search returns the known short QA article", async ({ page }) => {
    await openQaRoute(page, "/search");
    await page.getByLabel("찾고 싶은 안내").fill("QA 비운영 짧은 글");
    await page.getByRole("button", { name: "검색", exact: true }).click();
    await expect(page.getByText("검색이 완료되었습니다.", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", {
      name: "QA 비운영 짧은 글", exact: true,
    })).toBeVisible();
  });

  test("article TOC reaches the structured heading", async ({ page }) => {
    await openQaRoute(page, richArticlePath);
    await page.locator('a[href="#qa-structure"]').first().click();
    await expect(page).toHaveURL(/#qa-structure$/u);
    await expect(page.locator("h2#qa-structure")).toBeVisible();
  });

  test("article reader actions expose deterministic state", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true, value: async () => undefined,
      });
    });
    await openQaRoute(page, richArticlePath);

    const bookmark = page.locator(".article-bookmark button");
    await expect(bookmark).toBeEnabled();
    await expect(bookmark).toHaveAttribute("aria-pressed", "false");
    await bookmark.click();
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("이 기기에만 기사를 저장했습니다.")).toBeVisible();

    await page.locator(".article-share-action button").click();
    await expect(page.getByText("공유했습니다.", { exact: true })).toBeVisible();

    const helpful = page.locator(".article-feedback").getByRole("button", {
      name: "도움됨", exact: true,
    });
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("의견을 남겨 주셔서 감사합니다.")).toBeVisible();
  });

  test("archive page two links back to the first page", async ({ page }) => {
    await openQaRoute(page, "/archive/page/2");
    const previous = page.getByRole("link", { name: "이전 페이지", exact: true });
    await expect(previous).toHaveAttribute("href", "/archive");
    await previous.click();
    await expect(page).toHaveURL(/\/archive\/?$/u);
  });
});
