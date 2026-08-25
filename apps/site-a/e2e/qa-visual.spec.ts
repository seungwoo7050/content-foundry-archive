import { expect, test, type Page } from "@playwright/test";

import { QA_QUALITY_VARIANTS } from "../qa/variants";

const qualityVariantId = process.env.QUALITY_VARIANT_ID;
const qualityVariant = qualityVariantId === undefined
  ? undefined
  : QA_QUALITY_VARIANTS.find(({ id }) => id === qualityVariantId);
if (qualityVariantId !== undefined && qualityVariant === undefined) {
  throw new Error("QUALITY_VARIANT_ID must exactly match an entry in QA_QUALITY_VARIANTS");
}

const visualVariants = QA_QUALITY_VARIANTS.filter(({ theme, skin }) =>
  skin === "calm-blue" || theme === "friendly-mobile-utility");
if (visualVariants.length !== 7) {
  throw new Error("QA visual variants must be the five calm-blue sites and all Friendly skins");
}
const visualVariant = qualityVariant !== undefined
  && visualVariants.some(({ id }) => id === qualityVariant.id)
  ? qualityVariant
  : undefined;

const visualProjects = new Set(["chromium-desktop", "chromium-mobile"]);
const routes = [
  { id: "home", path: "/" },
  {
    id: "rich-article",
    path: "/article/qa-nonproduction-very-long-korean-title-layout-table-code-"
      + "command-gallery-faq-source-update-related-action",
  },
] as const;

async function settleVisualPage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
}

test.describe("QA visual regression", () => {
  if (visualVariant === undefined) return;
  const variant = visualVariant;

  test.beforeEach(({}, testInfo) => {
    test.skip(
      !visualProjects.has(testInfo.project.name),
      "QA visual baselines run only in Chromium desktop and mobile projects",
    );
  });

  for (const route of routes) {
    test(`${route.id} matches its full-page baseline`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(response?.ok(), `${route.path} should return success`).toBe(true);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator(
        `[data-theme="${variant.theme}"][data-skin="${variant.skin}"]`,
      )).toBeVisible();
      await settleVisualPage(page);

      await expect(page).toHaveScreenshot(
        `${variant.id}--${route.id}.webp`,
        {
          animations: "disabled",
          caret: "hide",
          fullPage: true,
          maxDiffPixelRatio: 0,
          maxDiffPixels: 0,
          scale: "css",
          threshold: 0,
        },
      );
    });
  }
});
