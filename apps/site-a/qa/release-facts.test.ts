import { validateContractDocument } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { projectQaReleaseFacts } from "./release-facts";

const variant = {
  theme: "editorial-utility",
  skin: "warm-neutral",
  origin: "https://editorial-warm-neutral.qa.public-sites.example",
} as const;
const facts = projectQaReleaseFacts(variant);

describe("QA release variant facts", () => {
  it("projects four schema-valid Contract 4 documents", () => {
    for (const [kind, document] of [
      ["release", facts.release],
      ["site", facts.site],
      ["navigation", facts.navigation],
      ["media-manifest", facts.mediaManifest],
    ] as const) {
      expect(validateContractDocument("4.0.0", kind, document)).toBe(document);
    }
  });

  it("binds fixed QA identity and the supplied visual variant", () => {
    expect(facts.release).toMatchObject({
      releaseId: "REL-QA-20260825-000001",
      createdAt: "2026-08-25T00:00:00Z",
      contentRevision: 1,
      siteConfigRevision: 1,
      articleCount: 17,
      pageCount: 4,
      defaultTheme: variant.theme,
      defaultSkin: variant.skin,
      bundleChecksum: `sha256:${"0".repeat(64)}`,
    });
    expect(facts.site).toMatchObject({
      origin: variant.origin,
      defaultTheme: variant.theme,
      defaultSkin: variant.skin,
      analytics: { provider: "disabled", publicMeasurementId: null },
      ads: { provider: "disabled", enabled: false, publicClientId: null },
    });
  });
});
