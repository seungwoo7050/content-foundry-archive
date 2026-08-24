import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ContractError } from "./errors.js";
import {
  type ContractDocumentKind,
  validateContractDocument,
  validateContractDocumentForVersion,
} from "./validate-document.js";

const fixtureRoot = new URL("../vendor/2.0.0/fixtures/", import.meta.url);
const v3FixtureRoot = new URL("../vendor/3.0.0/fixtures/", import.meta.url);
const readFixture = (path: string) =>
  JSON.parse(readFileSync(new URL(path, fixtureRoot), "utf8")) as unknown;
const readV3Fixture = (path: string) =>
  JSON.parse(readFileSync(new URL(path, v3FixtureRoot), "utf8")) as unknown;

const fixtureValue = (kind: ContractDocumentKind, path: string) => {
  const value = readFixture(path);
  return kind === "content-block" && Array.isArray(value) ? value[0] : value;
};

const invalidV3BlockFixtures = [
  "invalid/action-link-unsafe-scheme.json",
  "invalid/command-execution-request.json",
  "invalid/gallery-single-item.json",
  "invalid/niche-component-backend-request.json",
] as const;

describe("contract document validation", () => {
  const validFixtures: ReadonlyArray<[ContractDocumentKind, string]> = [
    ["article", "valid/article.json"],
    ["content-block", "valid/content.json"],
    ["content", "valid/content.json"],
    ["media-manifest", "valid/media-manifest.json"],
    ["navigation", "valid/navigation.json"],
    ["page", "valid/page-about.json"],
    ["redirects", "valid/redirects.json"],
    ["release", "valid/release.json"],
    ["site", "valid/site.json"],
    ["taxonomy", "valid/taxonomy.json"],
  ];

  it.each(validFixtures)(
    "accepts a valid %s fixture through public and versioned validation",
    (kind, path) => {
      const value = fixtureValue(kind, path);
      expect(validateContractDocument("2.0.0", kind, value)).toBeDefined();
      expect(
        validateContractDocumentForVersion("2.0.0", kind, value),
      ).toBeDefined();
    },
  );

  it.each(validFixtures)(
    "accepts a valid v3 %s fixture through public and versioned validation",
    (kind, path) => {
      const v3Path =
        kind === "content-block"
          ? "valid/gallery-block.json"
          : kind === "media-manifest"
            ? "bundles/valid/site-a-minimal/media/media-manifest.json"
            : path;
      const value = readV3Fixture(v3Path);
      expect(validateContractDocument("3.0.0", kind, value)).toBeDefined();
      expect(
        validateContractDocumentForVersion("3.0.0", kind, value),
      ).toBeDefined();
    },
  );

  it("accepts every aggregate v3 content block directly", () => {
    const content = readV3Fixture("valid/content.json");
    if (!Array.isArray(content)) throw new TypeError("Expected content fixture array");

    expect(content).toHaveLength(16);
    for (const block of content) {
      expect(
        validateContractDocumentForVersion("3.0.0", "content-block", block),
      ).toBeDefined();
    }
  });

  it.each(invalidV3BlockFixtures)(
    "classifies %s through the v3 aggregate block schema",
    (path) => {
      expect(() =>
        validateContractDocumentForVersion(
          "3.0.0",
          "content-block",
          readV3Fixture(path),
        ),
      ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
    },
  );

  it.each([
    ["2.0.0", readV3Fixture],
    ["3.0.0", readFixture],
  ] as const)("keeps the %s release schema isolated", (version, readOtherVersion) => {
    expect(() =>
      validateContractDocumentForVersion(
        version,
        "release",
        readOtherVersion("valid/release.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });

  it("classifies an invalid release inside the registered v3 schema", () => {
    expect(() =>
      validateContractDocumentForVersion(
        "3.0.0",
        "release",
        readV3Fixture("invalid/release-unsupported-version.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });

  it("classifies an invalid article slug", () => {
    expect(() =>
      validateContractDocument(
        "2.0.0",
        "article",
        readFixture("invalid/article-invalid-slug.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });

  it("requires stable heading ids", () => {
    expect(() =>
      validateContractDocument(
        "2.0.0",
        "content",
        readFixture("invalid/content-heading-missing-id.json"),
      ),
    ).toThrowError(ContractError);
  });

  it("rejects an unsupported explicit version before schema validation", () => {
    expect(() =>
      validateContractDocument(
        "4.0.0" as "2.0.0",
        "release",
        readFixture("invalid/release-unsupported-version.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }));
  });

  it("does not expose a vendored v3 block through the legacy validator", () => {
    expect(() =>
      validateContractDocument(
        "2.0.0",
        "content-block",
        readV3Fixture("valid/gallery-block.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });
});
