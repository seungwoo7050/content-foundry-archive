import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { QA_QUALITY_VARIANTS } from "../qa/variants";

const qualityVariantId = process.env.QUALITY_VARIANT_ID;
const qualityVariant = qualityVariantId === undefined
  ? undefined
  : QA_QUALITY_VARIANTS.find(({ id }) => id === qualityVariantId);

if (qualityVariantId !== undefined && qualityVariant === undefined) {
  throw new Error("QUALITY_VARIANT_ID must exactly match an entry in QA_QUALITY_VARIANTS");
}

const routes = [
  ["home", "/", "success"],
  [
    "rich article",
    "/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action",
    "success",
  ],
  ["field notes", "/category/field-notes", "success"],
  ["archive", "/archive", "success"],
  ["search", "/search", "success"],
  ["about", "/about", "success"],
  ["privacy", "/privacy", "success"],
  ["advertising disclosure", "/advertising-disclosure", "success"],
  ["contact", "/contact", "success"],
  ["retired", "/retired/qa-old-guide", "success"],
  ["archive page 2", "/archive/page/2", "success"],
  ["field notes page 2", "/category/field-notes/page/2", "success"],
  ["unknown", "/qa-runtime-corpus-unknown", "not-found"],
] as const;

function projectOrigin(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== "string") throw new Error("QA browser project requires baseURL");
  return new URL(baseURL).origin;
}

function watchRuntime(
  page: Page, expectedOrigin: string, expectedNotFoundUrl: string | undefined,
  javaScriptDisabled: boolean,
) {
  const evidence = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
    requestFailures: [] as string[],
    externalRequests: [] as string[],
  };
  page.on("console", (message) => {
    const expectedDocument404 = message.text()
      === "Failed to load resource: the server responded with a status of 404 (Not Found)"
      && message.location().url === expectedNotFoundUrl;
    if (message.type() === "error" && !expectedDocument404) {
      evidence.consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => evidence.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const expectedScriptBlock = javaScriptDisabled
      && request.resourceType() === "script"
      && request.failure()?.errorText === "csp"
      && new URL(request.url()).origin === expectedOrigin;
    if (!expectedScriptBlock) evidence.requestFailures.push(`${request.method()} ${request.url()}`);
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (["http:", "https:"].includes(url.protocol) && url.origin !== expectedOrigin) {
      evidence.externalRequests.push(request.url());
    }
  });
  return evidence;
}

test.describe("QA static runtime corpus", () => {
  if (qualityVariant === undefined) return;
  const variant = qualityVariant;

  for (const [label, path, expected] of routes) {
    test(`${label} stays local and renderable`, async ({ page }, testInfo) => {
      const origin = projectOrigin(testInfo);
      const expectedNotFoundUrl = expected === "not-found"
        ? new URL(path, origin).href : undefined;
      const evidence = watchRuntime(
        page, origin, expectedNotFoundUrl,
        testInfo.project.use.javaScriptEnabled === false,
      );
      const response = await page.goto(path, { waitUntil: "networkidle" });
      if (expected === "not-found") {
        expect(response?.status(), `${path} should return 404`).toBe(404);
      } else {
        expect(response?.ok(), `${path} should return success`).toBe(true);
      }
      await expect(page.locator("main")).toHaveCount(1);
      const overflow = await page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
        - document.documentElement.clientWidth);
      expect(overflow, `${path} horizontal overflow`).toBe(0);
      expect(evidence, `${path} runtime evidence`).toEqual({
        consoleErrors: [], pageErrors: [], requestFailures: [], externalRequests: [],
      });
      if (path === "/") {
        await expect(page.locator(
          `[data-theme="${variant.theme}"][data-skin="${variant.skin}"]`,
        )).toBeVisible();
        await expect(page.getByRole("heading", { level: 1, name: /QA 비운영/u })).toBeVisible();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/u);
      }
    });
  }
});
