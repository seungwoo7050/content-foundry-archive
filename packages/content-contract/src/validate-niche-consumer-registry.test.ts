import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";
import { validateContractDocumentForVersion } from "./validate-document.js";
import { validateNicheConsumerRegistry } from "./validate-niche-consumer-registry.js";

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
  registry: Readonly<Record<string, readonly string[]>>,
  path: string,
) {
  expect(() => validateNicheConsumerRegistry(bundle, registry)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: [expect.objectContaining({ path })],
    }),
  );
}

describe("validateNicheConsumerRegistry", () => {
  it("accepts a bundle without niche components under an empty registry", () => {
    const bundle = structuredClone(reference);
    const validated = validateNicheConsumerRegistry(bundle, {});

    expect(validated).toBe(bundle);
    expectTypeOf(validated).toEqualTypeOf<typeof reference>();
  });

  it("accepts an exact same-site consumer registration", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expect(
      validateNicheConsumerRegistry(bundle, {
        "site-a": ["date-gap-calculator"],
      }),
    ).toBe(bundle);
  });

  it("rejects a page component missing from the site registry", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expectInvalidAt(bundle, { "site-a": [] }, "/pages/0/content/2/componentId");
  });

  it("does not flatten a same-ID registration from another site", () => {
    const bundle = structuredClone(reference);
    appendToPage(bundle);

    expectInvalidAt(
      bundle,
      { "site-b": ["date-gap-calculator"] },
      "/pages/0/content/2/componentId",
    );
  });

  it("validates niche-component registration in articles", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.content.push(structuredClone(nicheBlock));

    expectInvalidAt(
      bundle,
      { "site-a": [] },
      "/articles/0/content/4/componentId",
    );
  });
});
