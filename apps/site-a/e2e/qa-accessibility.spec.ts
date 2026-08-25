import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { QA_QUALITY_VARIANTS } from "../qa/variants";

const qualityVariantId = process.env.QUALITY_VARIANT_ID;
const qualityVariant = qualityVariantId === undefined
  ? undefined
  : QA_QUALITY_VARIANTS.find(({ id }) => id === qualityVariantId);
if (qualityVariantId !== undefined && qualityVariant === undefined) {
  throw new Error("QUALITY_VARIANT_ID must exactly match an entry in QA_QUALITY_VARIANTS");
}

const axeProjects = new Set(["chromium-desktop", "chromium-mobile"]);
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;
const routes = [
  ["home", "/"],
  [
    "rich article",
    "/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action",
  ],
] as const;

test.describe("QA Axe accessibility", () => {
  if (qualityVariant === undefined) return;
  const variant = qualityVariant;

  test.beforeEach(({}, testInfo) => {
    test.skip(
      !axeProjects.has(testInfo.project.name),
      "Axe QA scans run only in Chromium desktop and mobile projects",
    );
  });

  for (const [label, path] of routes) {
    test(`${label} has no WCAG 2.2 A or AA violations`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.ok(), `${path} should return success`).toBe(true);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator(
        `[data-theme="${variant.theme}"][data-skin="${variant.skin}"]`,
      )).toBeVisible();

      const { violations } = await new AxeBuilder({ page })
        .withTags([...axeTags])
        .analyze();
      const summary = violations.map(({ id, impact, help, nodes }) => ({
        id,
        impact,
        help,
        targets: nodes.map(({ target }) => target),
      }));
      expect(violations, JSON.stringify(summary, null, 2)).toEqual([]);
    });
  }
});
