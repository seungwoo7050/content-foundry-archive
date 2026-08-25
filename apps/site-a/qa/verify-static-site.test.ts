import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { RESPONSIVE_WEBP_QUALITY } from "@content-foundry/media";
import { afterEach, describe, expect, it } from "vitest";

import { qaArticles } from "./articles";
import { qaCorpus } from "./corpus";
import { qaMediaAssets } from "./media-assets";
import {
  QA_CORE_HTML_ARTIFACTS,
  QA_PAGINATION_ARTIFACTS,
  verifyQaStaticHtmlCorpus,
  verifyQaStaticMetadata,
  verifyQaStaticPagination,
  verifyQaStaticSecurity,
  verifyQaStaticSiteArtifacts,
  verifyQaStaticSiteIdentity,
} from "./verify-static-site";

const roots: string[] = [];
const checksum = `sha256:${"1".repeat(64)}`;
const origin = "https://friendly-mobile-utility-calm-blue.qa.public-sites.example";
const dormantProviderSource = [
  '"https://www.googletagmanager.com/gtag/js"',
  '"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"',
].join("\n");
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
    const previous = QA_PAGINATION_ARTIFACTS.find(([artifact]) => artifact === path)?.[2];
    writeFileSync(target, [
      `<title>${previous ? "QA 2페이지" : "QA"}</title>`,
      canonical,
      `<meta name="robots" content="noindex, nofollow">`,
      `<meta name="content-foundry-build-config-checksum" content="${checksum}">`,
      `<body data-theme="friendly-mobile-utility" data-skin="calm-blue">QA 비운영</body>`,
      previous ? `<a href="${previous}" rel="prev">이전 페이지</a>` : "",
    ].join(""));
  }
  writeFileSync(join(outputDirectory, "robots.txt"), "User-Agent: *\nDisallow: /\n\n");
  writeFileSync(join(outputDirectory, "ads.txt"), "");
  writeFileSync(join(outputDirectory, "sitemap.xml"), [
    `<loc>${origin}/</loc>`,
    ...QA_PAGINATION_ARTIFACTS.map(([, route]) => `<loc>${origin}${route}</loc>`),
  ].join(""));
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
  const socialUrl = `${origin}/_media/${qaMediaAssets[0]!.sha256}/source.webp`;
  const article = qaArticles[0]!;
  for (const [path, title, url] of [
    ["index.html", qaCorpus.site.name, origin],
    [`${article.seo.canonicalPath.slice(1)}.html`, article.title, `${origin}${article.seo.canonicalPath}`],
  ] as const) {
    const target = join(outputDirectory, path);
    writeFileSync(target, readFileSync(target, "utf8") + [
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${socialUrl}">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:image" content="${socialUrl}">`,
      `<script type="application/ld+json">{"@type":"Thing"}</script>`,
    ].join(""));
  }
  const home = join(outputDirectory, "index.html");
  const favicon = qaMediaAssets[4]!;
  const faviconWidth = Math.min(favicon.width, 480);
  const faviconHeight = Math.max(1, Math.round(
    (favicon.height * faviconWidth) / favicon.width,
  ));
  const faviconDerivative = join(outputDirectory, "_media", favicon.sha256,
    `webp-q${RESPONSIVE_WEBP_QUALITY}`, `${faviconWidth}w.webp`);
  mkdirSync(dirname(faviconDerivative), { recursive: true });
  writeFileSync(faviconDerivative, "webp");
  writeFileSync(home, readFileSync(home, "utf8")
    + `<link href="/_media/${favicon.sha256}/webp-q${RESPONSIVE_WEBP_QUALITY}/${faviconWidth}w.webp" rel="icon" sizes="${faviconWidth}x${faviconHeight}" type="${favicon.mimeType}">`
    + `<a href="https://source.qa.public-sites.example/synthetic-reference">QA source</a>`);
  const dormant = join(outputDirectory, "_next/static/chunks/dormant.js");
  mkdirSync(dirname(dormant), { recursive: true });
  writeFileSync(dormant, dormantProviderSource);
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

  it("accepts pagination identity and rejects a non-anchor previous link", () => {
    const valid = fixture();
    expect(verifyQaStaticPagination(valid)).toEqual({ paginationCount: 2 });
    const archive = join(valid.outputDirectory, "archive/page/2.html");
    writeFileSync(archive, readFileSync(archive, "utf8").replace(' rel="prev"', ""));
    expect(() => verifyQaStaticPagination(valid)).toThrow(/previous anchor mismatch/u);
  });

  it("accepts QA social metadata and rejects a foreign image", () => {
    const valid = fixture();
    expect(verifyQaStaticMetadata(valid)).toEqual({ metadataPageCount: 2 });
    const missingFavicon = fixture();
    rmSync(join(missingFavicon.outputDirectory, "_media", qaMediaAssets[4]!.sha256,
      `webp-q${RESPONSIVE_WEBP_QUALITY}`, "480w.webp"));
    expect(() => verifyQaStaticMetadata(missingFavicon)).toThrow(/missing .*480w\.webp/u);
    const home = join(valid.outputDirectory, "index.html");
    writeFileSync(home, readFileSync(home, "utf8").replace(
      `/_media/${qaMediaAssets[0]!.sha256}/`,
      "/_media/foreign/",
    ));
    expect(() => verifyQaStaticMetadata(valid)).toThrow(/social metadata mismatch/u);
  });

  it("rejects active external and provider payloads but reports dormant endpoints", () => {
    const valid = fixture();
    expect(verifyQaStaticSecurity(valid)).toEqual({
      htmlCount: 13, jsCount: 1, dormantEndpointCount: 2,
    });
    for (const tag of [
      '<iframe src="https://external.invalid/embed"></iframe>',
      '<link rel="stylesheet" href="https://external.invalid/site.css">',
      '<link rel="preload" href="//external.invalid/font.woff2">',
      '<link rel="modulepreload" href="https://external.invalid/chunk.js">',
      '<link rel="icon" href="https://external.invalid/favicon.webp">',
    ]) {
      const external = fixture();
      const home = join(external.outputDirectory, "index.html");
      writeFileSync(home, readFileSync(home, "utf8") + tag);
      expect(() => verifyQaStaticSecurity(external)).toThrow(/external auto-load/u);
    }
    const provider = fixture();
    writeFileSync(join(provider.outputDirectory, "index.html"), '<ins class="adsbygoogle"></ins>');
    expect(() => verifyQaStaticSecurity(provider)).toThrow(/provider DOM payload/u);
    const configured = fixture();
    writeFileSync(join(configured.outputDirectory, "_next/static/chunks/dormant.js"),
      `${dormantProviderSource}\n"G-ABCDE12345"`);
    expect(() => verifyQaStaticSecurity(configured)).toThrow(/actual provider ID/u);
  });
});
