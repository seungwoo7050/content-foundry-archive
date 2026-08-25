import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { RESPONSIVE_WEBP_QUALITY } from "@content-foundry/media";

import { qaArticles } from "./articles";
import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { qaCorpus } from "./corpus";
import { qaMediaAssets } from "./media-assets";

type IdentityPlan = Pick<QaStaticBuildPlan, "outputDirectory" | "theme" | "skin">;
type ArtifactPlan = IdentityPlan & Pick<QaStaticBuildPlan, "origin">;
const checksumPattern = /^sha256:(?!0{64}$)[0-9a-f]{64}$/u;
const supportedVersions = ["2.0.0", "3.0.0", "4.0.0"];
const actualProviderId = /\bG-[A-Z0-9]{10}\b|\bca-pub-[0-9]{16}\b/u;
const providerDomMarkers = Object.freeze([
  "adsbygoogle",
  "data-ad-client",
  "google-adsense-account",
  "data-content-foundry-provider",
  "googletagmanager.com",
  "google-analytics.com",
  "doubleclick.net",
]);
const dormantProviderEndpoints = Object.freeze([
  "https://www.googletagmanager.com/gtag/js",
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
]);
export const QA_CORE_HTML_ARTIFACTS = Object.freeze([
  ["index.html", ""],
  ["archive.html", "/archive"],
  ["archive/page/2.html", "/archive/page/2"],
  ["category/field-notes.html", "/category/field-notes"],
  ["category/field-notes/page/2.html", "/category/field-notes/page/2"],
  ["search.html", "/search"],
  ["about.html", "/about"],
  ["contact.html", "/contact"],
  ["privacy.html", "/privacy"],
  ["advertising-disclosure.html", "/advertising-disclosure"],
  ["404.html", null],
  ["retired/qa-old-guide.html", null],
  [
    "article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action.html",
    "/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action",
  ],
] as const);
export const QA_PAGINATION_ARTIFACTS = Object.freeze([
  ["archive/page/2.html", "/archive/page/2", "/archive"],
  ["category/field-notes/page/2.html", "/category/field-notes/page/2", "/category/field-notes"],
] as const);

const reject = (message: string): never => {
  throw new Error(`Invalid QA static identity: ${message}`);
};

function readArtifact(plan: IdentityPlan, path: string): string {
  const target = join(plan.outputDirectory, path);
  if (!existsSync(target)) return reject(`missing ${path}`);
  if (!lstatSync(target).isFile()) return reject(`${path} is not a file`);
  return readFileSync(target, "utf8");
}

export function verifyQaStaticSiteIdentity(plan: IdentityPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  if (identity.releaseId !== "REL-QA-20260825-000001"
    || identity.siteId !== "site-a"
    || identity.contractVersion !== "4.0.0"
    || identity.routeCount !== 33
    || !checksumPattern.test(identity.bundleChecksum)
    || !checksumPattern.test(identity.buildConfigChecksum)
    || JSON.stringify(identity.supportedContractVersions)
      !== JSON.stringify(supportedVersions)) return reject("release mismatch");

  const home = readArtifact(plan, "index.html");
  if (!/<meta name="robots" content="[^"]*noindex/iu.test(home)) {
    return reject("home is indexable");
  }
  for (const marker of [
    `data-theme="${plan.theme}"`,
    `data-skin="${plan.skin}"`,
    "QA 비운영",
    `<meta name="content-foundry-build-config-checksum" content="${identity.buildConfigChecksum}"`,
  ]) {
    if (!home.includes(marker)) return reject(`home is missing ${marker}`);
  }
  return Object.freeze({ routeCount: identity.routeCount as number });
}

export function verifyQaStaticSiteArtifacts(plan: ArtifactPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  if (readArtifact(plan, "robots.txt") !== "User-Agent: *\nDisallow: /\n\n") {
    return reject("robots policy mismatch");
  }
  if (readArtifact(plan, "ads.txt") !== "") return reject("ads.txt is not empty");
  const sitemap = readArtifact(plan, "sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)]
    .flatMap((match) => match[1] ? [match[1]] : []);
  if (locations.length === 0
    || locations.some((location) => !location.startsWith(`${plan.origin}/`))) {
    return reject("sitemap origin mismatch");
  }
  const search = JSON.parse(readArtifact(plan, "search-index.json"));
  const expectedArticle = qaArticles[0]!;
  const representative = search.entries?.find(
    ({ path }: { path?: unknown }) => path === expectedArticle.seo.canonicalPath,
  );
  if (search.schemaVersion !== "1.0.0" || search.locale !== "ko-KR"
    || search.release?.bundleChecksum !== identity.bundleChecksum
    || search.entries?.length !== 17
    || representative?.title !== expectedArticle.title) {
    return reject("search index mismatch");
  }
  if (qaMediaAssets.length !== 5) return reject("media catalog count mismatch");
  for (const asset of qaMediaAssets) {
    readArtifact(plan, `_media/${asset.sha256}/source.webp`);
  }
  return Object.freeze({ searchCount: search.entries.length, mediaCount: 5 });
}

export function verifyQaStaticHtmlCorpus(plan: ArtifactPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  for (const [path, canonicalPath] of QA_CORE_HTML_ARTIFACTS) {
    const html = readArtifact(plan, path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/iu)?.[1];
    const expected = canonicalPath === null ? undefined : `${plan.origin}${canonicalPath}`;
    if (canonical !== expected) return reject(`${path} canonical mismatch`);
    if (!/<meta name="robots" content="[^"]*noindex/iu.test(html)) {
      return reject(`${path} is indexable`);
    }
    for (const marker of [
      `data-theme="${plan.theme}"`,
      `data-skin="${plan.skin}"`,
      "QA 비운영",
      `<meta name="content-foundry-build-config-checksum" content="${identity.buildConfigChecksum}"`,
    ]) {
      if (!html.includes(marker)) return reject(`${path} is missing ${marker}`);
    }
  }
  return Object.freeze({ htmlCount: QA_CORE_HTML_ARTIFACTS.length });
}

function relAnchorHrefs(html: string, rel: "prev" | "next"): string[] {
  return [...html.matchAll(/<a\b([^>]*)>/giu)].flatMap((match) => {
    const attributes = match[1] ?? "";
    if (!attributes.includes(`rel="${rel}"`)) return [];
    const href = attributes.match(/\bhref="([^"]+)"/iu)?.[1];
    return href ? [href] : [];
  });
}

function listPaginationRoutes(root: string, directory = ""): string[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listPaginationRoutes(root, path);
    return /^(?:archive|category\/[^/]+)\/page\/(?:[2-9]|[1-9][0-9]+)\.html$/u.test(path)
      ? [`/${path.slice(0, -5)}`]
      : [];
  });
}

export function verifyQaStaticPagination(plan: ArtifactPlan) {
  for (const [path, route, previous] of QA_PAGINATION_ARTIFACTS) {
    const html = readArtifact(plan, path);
    if (!/<title>[^<]*2페이지/iu.test(html)) return reject(`${path} title mismatch`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/iu)?.[1];
    if (canonical !== `${plan.origin}${route}`) return reject(`${path} canonical mismatch`);
    if (JSON.stringify(relAnchorHrefs(html, "prev")) !== JSON.stringify([previous])) {
      return reject(`${path} previous anchor mismatch`);
    }
    if (relAnchorHrefs(html, "next").length > 0) return reject(`${path} has a next anchor`);
  }
  const expected = QA_PAGINATION_ARTIFACTS.map(([, route]) => route).sort();
  const exported = listPaginationRoutes(plan.outputDirectory).sort();
  const sitemap = readArtifact(plan, "sitemap.xml");
  const indexed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)]
    .flatMap((match) => match[1] ? [new URL(match[1]).pathname] : [])
    .filter((route) => /\/page\/(?:[2-9]|[1-9][0-9]+)$/u.test(route))
    .sort();
  if (JSON.stringify(exported) !== JSON.stringify(expected)
    || JSON.stringify(indexed) !== JSON.stringify(expected)) {
    return reject("pagination route inventory mismatch");
  }
  return Object.freeze({ paginationCount: expected.length });
}

function readMeta(html: string, attribute: "name" | "property", key: string): string {
  const value = html.match(
    new RegExp(`<meta ${attribute}="${key}" content="([^"]+)"`, "iu"),
  )?.[1];
  return value ?? reject(`missing ${key} metadata`);
}

function assertSocialMetadata(html: string, title: string, url: string, image: string) {
  const actual = [
    readMeta(html, "property", "og:title"),
    readMeta(html, "property", "og:url"),
    readMeta(html, "property", "og:image"),
    readMeta(html, "name", "twitter:title"),
    readMeta(html, "name", "twitter:image"),
  ];
  if (JSON.stringify(actual) !== JSON.stringify([title, url, image, title, image])) {
    return reject("social metadata mismatch");
  }
  const jsonLd = [...html.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/giu,
  )].flatMap((match) => match[1] ? [match[1]] : []);
  if (jsonLd.length === 0) return reject("missing JSON-LD");
  for (const source of jsonLd) JSON.parse(source);
}

export function verifyQaStaticMetadata(plan: ArtifactPlan) {
  const home = readArtifact(plan, "index.html");
  const articleRecord = qaArticles[0]!;
  const article = readArtifact(plan, `${articleRecord.seo.canonicalPath.slice(1)}.html`);
  const favicon = qaMediaAssets.find(({ id }) =>
    id === qaCorpus.presentation.brand.faviconMediaId);
  const social = qaMediaAssets.find(({ id }) =>
    id === qaCorpus.presentation.brand.socialImageMediaId);
  const hero = qaMediaAssets.find(({ id }) => id === articleRecord.heroMediaId);
  if (!favicon || !social || !hero) return reject("brand media is missing");
  const faviconWidth = Math.min(favicon.width, 480);
  const faviconHeight = Math.max(1, Math.round(
    (favicon.height * faviconWidth) / favicon.width,
  ));
  const faviconUrl = `/_media/${favicon.sha256}/webp-q${RESPONSIVE_WEBP_QUALITY}/${faviconWidth}w.webp`;
  readArtifact(plan, faviconUrl.slice(1));
  const faviconTag = home.match(/<link\b(?=[^>]*\brel="icon")([^>]*)>/iu)?.[1];
  const faviconLink = ["href", "type", "sizes"].map((name) =>
    faviconTag?.match(new RegExp(`\\b${name}="([^"]+)"`, "iu"))?.[1]);
  if (JSON.stringify(faviconLink)
    !== JSON.stringify([faviconUrl, favicon.mimeType, `${faviconWidth}x${faviconHeight}`])) {
    return reject("favicon metadata mismatch");
  }
  assertSocialMetadata(
    home, qaCorpus.site.name, plan.origin,
    `${plan.origin}/_media/${social.sha256}/source.webp`,
  );
  assertSocialMetadata(
    article, articleRecord.title, `${plan.origin}${articleRecord.seo.canonicalPath}`,
    `${plan.origin}/_media/${hero.sha256}/source.webp`,
  );
  return Object.freeze({ metadataPageCount: 2 });
}

type SiteCodeFile = Readonly<{ path: string; source: string; kind: "html" | "js" }>;

function readSiteCode(root: string, directory = ""): SiteCodeFile[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readSiteCode(root, path);
    const kind = entry.name.endsWith(".html") ? "html"
      : entry.name.endsWith(".js") ? "js" : undefined;
    return entry.isFile() && kind
      ? [{ path, source: readFileSync(join(root, path), "utf8"), kind }]
      : [];
  });
}

function externalAutoLoads(html: string): string[] {
  const resourceTags = [
    ...html.matchAll(/<(?:script|iframe|img|source)\b([^>]*)>/giu),
    ...html.matchAll(
      /<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\b(?:stylesheet|preload|modulepreload|icon)\b)([^>]*)>/giu,
    ),
  ];
  return resourceTags.flatMap((tag) =>
    [...(tag[1] ?? "").matchAll(
      /\b(href|src|(?:image)?srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/giu,
    )].flatMap((attribute) => {
      const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
      const urls = attribute[1]?.toLowerCase().endsWith("srcset")
        ? value.split(",").map((candidate) => candidate.trim().split(/\s+/u)[0] ?? "")
        : [value];
      return urls.filter((url) => /^(?:https?:)?\/\//iu.test(url));
    }));
}

export function verifyQaStaticSecurity(plan: IdentityPlan) {
  if (readArtifact(plan, "ads.txt") !== "") return reject("ads.txt is not empty");
  const files = readSiteCode(plan.outputDirectory);
  for (const file of files) {
    if (actualProviderId.test(file.source)) return reject(`actual provider ID in ${file.path}`);
    if (file.kind === "html" && externalAutoLoads(file.source).length > 0) {
      return reject(`external auto-load in ${file.path}`);
    }
    if (file.kind === "html" && providerDomMarkers.some((marker) =>
      file.source.toLowerCase().includes(marker))) {
      return reject(`provider DOM payload in ${file.path}`);
    }
  }
  const javascript = files.filter(({ kind }) => kind === "js");
  const dormantEndpointCount = dormantProviderEndpoints.filter((endpoint) =>
    javascript.some(({ source }) => source.includes(endpoint))).length;
  return Object.freeze({
    htmlCount: files.length - javascript.length,
    jsCount: javascript.length,
    dormantEndpointCount,
  });
}
