import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { validateReleaseFromEnvironment } from "./validate-release-cli.js";

const packageDirectory = fileURLToPath(new URL("../", import.meta.url));
const fixture = (version: "2.0.0" | "3.0.0") =>
  `vendor/${version}/fixtures/bundles/valid/site-a-minimal`;

describe("validateReleaseFromEnvironment", () => {
  it("validates v2 without requiring or reading v3 context", () => {
    expect(
      validateReleaseFromEnvironment(
        {
          CONTENT_RELEASE_DIR: fixture("2.0.0"),
          CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE: "missing.json",
        },
        packageDirectory,
      ),
    ).toEqual(
      expect.objectContaining({
        validationScope: "contract-consumer",
        contractVersion: "2.0.0",
        releaseId: "REL-2026-000042",
        siteId: "site-a",
      }),
    );
  });

  it("rejects a missing release directory as CLI usage", () => {
    expect(() =>
      validateReleaseFromEnvironment({}, packageDirectory),
    ).toThrowError(
      expect.objectContaining({ name: "ReleaseValidationUsageError" }),
    );
  });

  it("keeps v3 closed before support activation", () => {
    expect(() =>
      validateReleaseFromEnvironment(
        { CONTENT_RELEASE_DIR: fixture("3.0.0") },
        packageDirectory,
      ),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }));
  });
});
