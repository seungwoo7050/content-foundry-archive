import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";
import { validateContractDocumentForVersion } from "./validate-document.js";
import { validateNicheProducerPolicy } from "./validate-niche-producer-policy.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocumentsForVersion("3.0.0", fixture);
const nicheBlock = validateContractDocumentForVersion(
  "3.0.0",
  "content-block",
  JSON.parse(
    readFileSync(
      new URL(
        "../vendor/3.0.0/fixtures/valid/niche-component-block.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ) as unknown,
);
if (nicheBlock.type !== "niche-component") {
  throw new TypeError("Expected canonical niche-component fixture");
}

function appendToPage(bundle: typeof reference) {
  bundle.pages[0]!.content.push(structuredClone(nicheBlock));
}

function expectInvalidAt(
  bundle: typeof reference,
  policy: Readonly<Record<string, readonly string[]>>,
  path: string,
) {
  expect(() => validateNicheProducerPolicy(bundle, policy)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: [expect.objectContaining({ path })],
    }),
  );
}

describe("validateNicheProducerPolicy", () => {
  it("accepts a bundle without niche components under an empty policy", () => {
    const bundle = structuredClone(reference);
    const validated = validateNicheProducerPolicy(bundle, {});

    expect(validated).toBe(bundle);
    expectTypeOf(validated).toEqualTypeOf<typeof reference>();
  });

  it("accepts an exact same-site producer policy match", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expect(
      validateNicheProducerPolicy(bundle, {
        "site-a": ["date-gap-calculator"],
      }),
    ).toBe(bundle);
  });

  it("rejects a producer-disabled page component", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expectInvalidAt(bundle, { "site-a": [] }, "/pages/0/content/2/componentId");
  });

  it("does not flatten a same-ID policy from another site", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expectInvalidAt(
      bundle,
      { "site-b": ["date-gap-calculator"] },
      "/pages/0/content/2/componentId",
    );
  });

  it("validates niche components in articles", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.content.push(structuredClone(nicheBlock));

    expectInvalidAt(
      bundle,
      { "site-a": [] },
      "/articles/0/content/4/componentId",
    );
  });
});
