import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ContractError } from "./errors.js";
import {
  type ContractDocumentKind,
  validateContractDocument,
} from "./validate-document.js";

const fixtureRoot = new URL("../vendor/2.0.0/fixtures/", import.meta.url);
const readFixture = (path: string) =>
  JSON.parse(readFileSync(new URL(path, fixtureRoot), "utf8")) as unknown;

describe("validateContractDocument", () => {
  const validFixtures: ReadonlyArray<[ContractDocumentKind, string]> = [
    ["article", "valid/article.json"],
    ["content", "valid/content.json"],
    ["media-manifest", "valid/media-manifest.json"],
    ["navigation", "valid/navigation.json"],
    ["page", "valid/page-about.json"],
    ["redirects", "valid/redirects.json"],
    ["release", "valid/release.json"],
    ["site", "valid/site.json"],
    ["taxonomy", "valid/taxonomy.json"],
  ];

  it.each(validFixtures)("accepts a valid %s fixture", (kind, path) => {
    expect(validateContractDocument(kind, readFixture(path))).toBeDefined();
  });

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
});
