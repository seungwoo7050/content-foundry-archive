import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";
import { validateExternalActionUrls } from "./validate-external-action-urls.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocumentsForVersion("3.0.0", fixture);

type Action = Extract<
  (typeof reference)["articles"][number]["content"][number],
  { type: "action-link" }
>;

function replaceArticleAction(bundle: typeof reference, action: Action) {
  bundle.articles[0]!.content[3] = action;
}

function expectInvalidAt(bundle: typeof reference, path: string) {
  expect(() => validateExternalActionUrls(bundle)).toThrowError(
    expect.objectContaining({
      code: "CONTRACT_INVALID",
      issues: expect.arrayContaining([expect.objectContaining({ path })]),
    }),
  );
}

describe("validateExternalActionUrls", () => {
  it("accepts official and affiliate actions on other origins", () => {
    const bundle = structuredClone(reference);
    replaceArticleAction(bundle, {
      type: "action-link",
      kind: "official",
      label: "공식 안내 읽기",
      url: "https://example.com:444/guide",
    });
    bundle.pages[0]!.content[1] = {
      type: "action-link",
      kind: "affiliate",
      label: "제휴 안내 읽기",
      url: "https://affiliate.example/offer",
    };

    const validated = validateExternalActionUrls(bundle);
    expect(validated).toBe(bundle);
    expectTypeOf(validated).toEqualTypeOf<typeof reference>();
  });

  it.each([
    "https://example.com/about",
    "https://EXAMPLE.com:443/about",
  ])("rejects same-origin external action %s", (url) => {
    const bundle = structuredClone(reference);
    replaceArticleAction(bundle, {
      type: "action-link",
      kind: "official",
      label: "운영자 소개 읽기",
      url,
    });

    expectInvalidAt(bundle, "/articles/0/content/3/url");
  });

  it.each([
    {
      kind: "username and password",
      url: "https://reader:placeholder@official.example/guide",
    },
    { kind: "username", url: "https://reader@official.example/guide" },
    { kind: "password", url: "https://:placeholder@official.example/guide" },
  ])("rejects $kind credentials in an external action URL", ({ url }) => {
    const bundle = structuredClone(reference);
    replaceArticleAction(bundle, {
      type: "action-link",
      kind: "official",
      label: "공식 신청 안내 읽기",
      url,
    });

    expectInvalidAt(bundle, "/articles/0/content/3/url");
  });

  it("rejects an external HTTPS URI without a host", () => {
    const bundle = structuredClone(reference);
    replaceArticleAction(bundle, {
      type: "action-link",
      kind: "official",
      label: "공식 안내 읽기",
      url: "https://",
    });

    expectInvalidAt(bundle, "/articles/0/content/3/url");
  });

  it.each(["https://", "mailto:owner@example.com"])(
    "classifies a non-network site origin %s",
    (origin) => {
      const bundle = structuredClone(reference);
      bundle.site.origin = origin;

      expectInvalidAt(bundle, "/site/origin");
    },
  );

  it("validates external actions in static pages", () => {
    const bundle = structuredClone(reference);
    bundle.pages[0]!.content[1] = {
      type: "action-link",
      kind: "affiliate",
      label: "사이트 안의 제휴 안내 읽기",
      url: "https://example.com/affiliate",
    };

    expectInvalidAt(bundle, "/pages/0/content/1/url");
  });
});
