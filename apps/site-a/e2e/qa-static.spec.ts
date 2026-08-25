import { expect, test } from "@playwright/test";

import { QA_QUALITY_VARIANTS } from "../qa/variants";

const qualityVariantId = process.env.QUALITY_VARIANT_ID;
const qualityVariant = qualityVariantId === undefined
  ? undefined
  : QA_QUALITY_VARIANTS.find(({ id }) => id === qualityVariantId);

if (qualityVariantId !== undefined && qualityVariant === undefined) {
  throw new Error(
    "QUALITY_VARIANT_ID must exactly match an entry in QA_QUALITY_VARIANTS",
  );
}

test.describe("QA static release identity", () => {
  if (qualityVariant === undefined) {
    return;
  }

  test("home exposes the selected non-operational identity", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(response?.ok(), "home should return a successful response").toBe(true);
    await expect(
      page.locator(
        `[data-theme="${qualityVariant.theme}"][data-skin="${qualityVariant.skin}"]`,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /QA 비운영/u }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /(?:^|,\s*)noindex(?:\s*,|$)/u,
    );
  });
});
