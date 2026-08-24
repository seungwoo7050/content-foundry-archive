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

describe("validateContractDocument", () => {
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
      expect(validateContractDocument(kind, value)).toBeDefined();
      expect(
        validateContractDocumentForVersion("2.0.0", kind, value),
      ).toBeDefined();
    },
  );

  it("classifies an invalid article slug", () => {
    expect(() =>
      validateContractDocument(
        "article",
        readFixture("invalid/article-invalid-slug.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });

  it("requires stable heading ids", () => {
    expect(() =>
      validateContractDocument(
        "content",
        readFixture("invalid/content-heading-missing-id.json"),
      ),
    ).toThrowError(ContractError);
  });

  it("rejects a supported-looking but unknown version first", () => {
    expect(() =>
      validateContractDocument(
        "release",
        readFixture("invalid/release-unsupported-version.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }));
  });

  it("does not expose a vendored v3 block through the legacy validator", () => {
    expect(() =>
      validateContractDocument(
        "content-block",
        readV3Fixture("valid/gallery-block.json"),
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_INVALID" }));
  });
});
