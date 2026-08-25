import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { verifyQaStaticSiteIdentity } from "./verify-static-site";

const roots: string[] = [];
const checksum = `sha256:${"1".repeat(64)}`;
const release = {
  releaseId: "REL-QA-20260825-000001",
  siteId: "site-a",
  contractVersion: "4.0.0",
  bundleChecksum: checksum,
  buildConfigChecksum: checksum,
  supportedContractVersions: ["2.0.0", "3.0.0", "4.0.0"],
  routeCount: 33,
};

function fixture() {
  const outputDirectory = mkdtempSync(join(tmpdir(), "public-sites-qa-identity-"));
  roots.push(outputDirectory);
  writeFileSync(join(outputDirectory, "_release.json"), JSON.stringify(release));
  writeFileSync(join(outputDirectory, "index.html"), [
    `<meta name="robots" content="noindex, nofollow">`,
    `<meta name="content-foundry-build-config-checksum" content="${checksum}">`,
    `<body data-theme="friendly-mobile-utility" data-skin="calm-blue">QA 비운영</body>`,
  ].join(""));
  return { outputDirectory, theme: "friendly-mobile-utility", skin: "calm-blue" } as const;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

describe("verifyQaStaticSiteIdentity", () => {
  it("accepts the QA release and home identity", () => {
    expect(verifyQaStaticSiteIdentity(fixture())).toEqual({ routeCount: 33 });
  });

  it("rejects a changed release and a missing home", () => {
    const changed = fixture();
    writeFileSync(join(changed.outputDirectory, "_release.json"), JSON.stringify({
      ...release,
      routeCount: 32,
    }));
    expect(() => verifyQaStaticSiteIdentity(changed)).toThrow(/release mismatch/u);
    const missing = fixture();
    rmSync(join(missing.outputDirectory, "index.html"));
    expect(() => verifyQaStaticSiteIdentity(missing)).toThrow(/missing index\.html/u);
  });
});
