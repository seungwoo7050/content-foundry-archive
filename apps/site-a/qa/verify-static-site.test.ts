import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { qaArticles } from "./articles";
import { qaMediaAssets } from "./media-assets";
import {
  QA_CORE_HTML_ARTIFACTS,
  verifyQaStaticHtmlCorpus,
  verifyQaStaticSiteArtifacts,
  verifyQaStaticSiteIdentity,
} from "./verify-static-site";

const roots: string[] = [];
const checksum = `sha256:${"1".repeat(64)}`;
const origin = "https://friendly-mobile-utility-calm-blue.qa.public-sites.example";
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
  for (const [path, canonicalPath] of QA_CORE_HTML_ARTIFACTS) {
    const target = join(outputDirectory, path);
    mkdirSync(dirname(target), { recursive: true });
    const canonical = canonicalPath === null
      ? ""
      : `<link rel="canonical" href="${origin}${canonicalPath}">`;
    writeFileSync(target, [
      canonical,
      `<meta name="robots" content="noindex, nofollow">`,
      `<meta name="content-foundry-build-config-checksum" content="${checksum}">`,
      `<body data-theme="friendly-mobile-utility" data-skin="calm-blue">QA 비운영</body>`,
    ].join(""));
  }
  writeFileSync(join(outputDirectory, "robots.txt"), "User-Agent: *\nDisallow: /\n\n");
  writeFileSync(join(outputDirectory, "ads.txt"), "");
  writeFileSync(join(outputDirectory, "sitemap.xml"), `<loc>${origin}/</loc>`);
  writeFileSync(join(outputDirectory, "search-index.json"), JSON.stringify({
    schemaVersion: "1.0.0",
    locale: "ko-KR",
    release: { bundleChecksum: checksum },
    entries: qaArticles.map(({ title, seo }) => ({ title, path: seo.canonicalPath })),
  }));
  for (const asset of qaMediaAssets) {
    const directory = join(outputDirectory, "_media", asset.sha256);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "source.webp"), "webp");
  }
  return {
    outputDirectory, origin, theme: "friendly-mobile-utility", skin: "calm-blue",
  } as const;
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

  it("accepts site-wide QA artifacts and rejects an incomplete search index", () => {
    const valid = fixture();
    expect(verifyQaStaticSiteArtifacts(valid)).toEqual({
      searchCount: 17,
      mediaCount: 5,
    });
    writeFileSync(join(valid.outputDirectory, "search-index.json"), JSON.stringify({
      schemaVersion: "1.0.0",
      locale: "ko-KR",
      release: { bundleChecksum: checksum },
      entries: [],
    }));
    expect(() => verifyQaStaticSiteArtifacts(valid)).toThrow(/search index mismatch/u);
  });

  it("accepts the HTML corpus and rejects missing or operating routes", () => {
    const valid = fixture();
    expect(verifyQaStaticHtmlCorpus(valid)).toEqual({ htmlCount: 13 });
    rmSync(join(valid.outputDirectory, "archive.html"));
    expect(() => verifyQaStaticHtmlCorpus(valid)).toThrow(/missing archive\.html/u);
    const operating = fixture();
    writeFileSync(join(operating.outputDirectory, "index.html"), "operating");
    expect(() => verifyQaStaticHtmlCorpus(operating)).toThrow(/canonical mismatch/u);
  });
});
