import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(appRoot, "out");
const articleSlug = "government24-resident-registration-guide";
const articleRelativePath = `article/${articleSlug}.html`;
const staticPageRelativePath = "about.html";
const categorySlug = "daily-admin";
const categoryRelativePath = `category/${categorySlug}.html`;
const allowedClientModules = new Set([
  join(appRoot, "components/adsense-bootstrap.tsx"),
  join(appRoot, "components/analytics-event-dispatcher.tsx"),
  join(appRoot, "components/article-bookmark.tsx"),
  join(appRoot, "components/article-feedback.tsx"),
  join(appRoot, "components/article-share-button.tsx"),
  join(appRoot, "components/ga4-tag.tsx"),
  join(appRoot, "components/manual-ad-slot.tsx"),
  join(appRoot, "components/search-controller.tsx"),
  join(appRoot, "lib/use-google-cmp-consent.ts"),
]);

function readArtifact(relativePath) {
  const artifactPath = join(outRoot, relativePath);
  assert.ok(existsSync(artifactPath), `Missing static artifact: ${relativePath}`);
  return readFileSync(artifactPath, "utf8");
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readMeta(html, name) {
  const pattern = new RegExp(
    `<meta name="${escapePattern(name)}" content="([^"]+)"`,
  );
  const value = html.match(pattern)?.[1];
  assert.ok(value, `Missing metadata: ${name}`);
  return value;
}

function assertCanonical(html, expected) {
  assert.match(
    html,
    new RegExp(`<link rel="canonical" href="${escapePattern(expected)}"`),
  );
}

function readJsonLdScripts(label, html) {
  return [...html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )].flatMap((match) => {
    const attributes = match[1];
    if (!/\btype="application\/ld\+json"/i.test(attributes)) return [];
    assert.match(
      attributes,
      /^\s*type="application\/ld\+json"\s*$/i,
      `${label} JSON-LD script includes unexpected attributes`,
    );
    const source = match[2].trim();
    assert.doesNotMatch(source, /</, `${label} JSON-LD includes a raw less-than sign`);
    return [JSON.parse(source)];
  });
}

function assertSafeScripts(label, html) {
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    assert.ok(
      match[1].startsWith("/_next/"),
      `${label} includes an external script source: ${match[1]}`,
    );
  }

  for (const match of html.matchAll(
    /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    const attributes = match[1];
    const source = match[2].trim();
    if (/\btype="application\/ld\+json"/i.test(attributes)) {
      assert.match(
        attributes,
        /^\s*type="application\/ld\+json"\s*$/i,
        `${label} JSON-LD script includes unexpected attributes`,
      );
      assert.doesNotMatch(
        source,
        /</,
        `${label} JSON-LD includes a raw less-than sign`,
      );
      JSON.parse(source);
      continue;
    }
    assert.match(
      source,
      /^(?:\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push|self\.__next_f\.push)/,
      `${label} includes a non-Next inline script`,
    );
  }
}

function assertSafeHtml(label, html) {
  assert.doesNotMatch(html, /<iframe\b/i, `${label} includes an iframe`);
  assert.doesNotMatch(html, /\son(?:click|error|load)=/i, `${label} includes an event handler`);
  assert.doesNotMatch(html, /javascript:/i, `${label} includes a JavaScript URL`);
  assert.doesNotMatch(
    html,
    /googletagmanager|google-analytics|doubleclick|adsbygoogle|data-ad-client/i,
    `${label} includes ads or analytics`,
  );
  assertSafeScripts(label, html);
}

function assertMinimalThemeRoute(label, html, routeKind) {
  assert.match(
    html,
    /data-theme="minimal-knowledge-base"/,
    `${label} does not use the configured theme`,
  );
  assert.match(
    html,
    /data-skin="calm-blue"/,
    `${label} does not use the configured skin`,
  );
  assert.match(
    html,
    new RegExp(`data-route="${escapePattern(routeKind)}"`),
    `${label} does not expose its route kind`,
  );
  assert.equal(
    [...html.matchAll(/<main(?:\s|>)/g)].length,
    1,
    `${label} must contain exactly one main landmark`,
  );
  assert.match(html, /<main id="main-content">/);
  assert.match(
    html,
    /<a\b(?=[^>]*\bhref="#main-content")[^>]*>본문으로 바로가기<\/a>/,
  );
  assert.match(html, /<nav aria-label="생활메모">/);
  assert.match(
    html,
    /<footer\b[^>]*><small>© 2026 생활메모 · 운영: 생활메모<\/small><nav aria-label="운영 및 정책">/,
  );
  assert.match(html, /<a href="\/about">소개<\/a>/);
  const renderedMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.doesNotMatch(
    renderedMarkup,
    /\b(?:ART|MED)-\d{6}\b/,
    `${label} exposes a raw content record ID in rendered markup`,
  );
}

function listSourceFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }
    return [".ts", ".tsx"].includes(extname(path)) ? [path] : [];
  });
}

function listFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

const home = readArtifact("index.html");
const article = readArtifact(articleRelativePath);
const staticPage = readArtifact(staticPageRelativePath);
const category = readArtifact(categoryRelativePath);
const archive = readArtifact("archive.html");
const adsTxt = readArtifact("ads.txt");
const notFound = readArtifact("404.html");
const search = readArtifact("search.html");
const robots = readArtifact("robots.txt");
const rss = readArtifact("rss.xml");
const searchIndex = JSON.parse(readArtifact("search-index.json"));
const sitemap = readArtifact("sitemap.xml");
const identity = JSON.parse(readArtifact("_release.json"));
for (const [label, html, routeKind] of [
  ["home", home, "home"],
  ["article", article, "article"],
  ["static page", staticPage, "static-page"],
  ["category", category, "category"],
  ["archive", archive, "archive"],
  ["search", search, "search"],
  ["404", notFound, "not-found"],
]) {
  assertMinimalThemeRoute(label, html, routeKind);
}
const providerFreeBuildConfigChecksums = {
  template: "sha256:b045e9d32e8625362973269eb4927858fee61dfa13672d5a9a85a635894446d6",
  preview: "sha256:18483304689d4499c1a862ac5e36944476c32304334b859c7ada448b37a7e871",
};
const verifierMode = process.env.RELEASE_MODE ?? "template";
assert.ok(
  Object.hasOwn(providerFreeBuildConfigChecksums, verifierMode),
  `Static fixture verifier does not support ${verifierMode} mode`,
);
const expectedBuildConfigChecksum =
  providerFreeBuildConfigChecksums[verifierMode];
const expectedIdentities = {
  "2.0.0": {
    releaseId: "REL-2026-000042",
    siteId: "site-a",
    contractVersion: "2.0.0",
    bundleChecksum:
      "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
    buildConfigChecksum: expectedBuildConfigChecksum,
    supportedContractVersions: ["2.0.0", "3.0.0"],
    routeCount: 7,
  },
  "3.0.0": {
    releaseId: "REL-2026-000043",
    siteId: "site-a",
    contractVersion: "3.0.0",
    bundleChecksum:
      "sha256:45a1c3f057fb59b3a7fd28e5e87a8c41eb299d0446c71949e5d4e32d2a92d745",
    buildConfigChecksum: expectedBuildConfigChecksum,
    supportedContractVersions: ["2.0.0", "3.0.0"],
    routeCount: 7,
  },
};
assert.deepEqual(identity, expectedIdentities[identity.contractVersion]);
for (const [label, html] of [
  ["home", home],
  ["article", article],
  ["static page", staticPage],
  ["category", category],
  ["archive", archive],
  ["search", search],
  ["404", notFound],
]) {
  assert.equal(
    readMeta(html, "content-foundry-build-config-checksum"),
    identity.buildConfigChecksum,
    `${label} build config metadata does not match release identity`,
  );
}
assert.equal(adsTxt, "");
assert.equal(robots, "User-Agent: *\nDisallow: /\n\n");

const sitemapEntries = [...sitemap.matchAll(
  /<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g,
)].map((match) => ({
  url: match[1],
  ...(match[2] ? { lastModified: match[2] } : {}),
}));
const expectedArticleLastModified =
  identity.contractVersion === "3.0.0"
    ? "2026-08-24T02:30:00Z"
    : "2026-08-20T01:00:00Z";
assert.deepEqual(searchIndex.release, {
  releaseId: identity.releaseId,
  siteId: identity.siteId,
  contractVersion: identity.contractVersion,
  bundleChecksum: identity.bundleChecksum,
});
assert.equal(searchIndex.schemaVersion, "1.0.0");
assert.equal(searchIndex.locale, "ko-KR");
assert.equal(searchIndex.entries.length, 1);
assert.deepEqual(
  {
    id: searchIndex.entries[0].id,
    path: searchIndex.entries[0].path,
    updatedAt: searchIndex.entries[0].updatedAt,
    categoryKeys: Object.keys(searchIndex.entries[0].category).sort(),
    tagKeys: Object.keys(searchIndex.entries[0].tags[0]).sort(),
    headingKeys: Object.keys(searchIndex.entries[0].headings[0]).sort(),
  },
  {
    id: "ART-000123",
    path: `/article/${articleSlug}`,
    updatedAt: expectedArticleLastModified,
    categoryKeys: ["id", "label", "slug"],
    tagKeys: ["id", "label", "slug"],
    headingKeys: ["id", "text"],
  },
);
assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss version="2\.0">/);
assert.match(rss, /<title>생활메모<\/title>/);
assert.match(
  rss,
  new RegExp(`<link>https://example\\.com/article/${articleSlug}</link>`),
);
assert.match(
  rss,
  /<pubDate>Thu, 20 Aug 2026 01:00:00 GMT<\/pubDate>/,
);
assert.match(rss, /<category>생활·행정<\/category>/);
assert.equal([...rss.matchAll(/<item>/g)].length, 1);
assert.deepEqual(sitemapEntries, [
  { url: "https://example.com/" },
  { url: "https://example.com/archive" },
  {
    url: `https://example.com/article/${articleSlug}`,
    lastModified: expectedArticleLastModified,
  },
  { url: `https://example.com/category/${categorySlug}` },
  { url: "https://example.com/about" },
]);

assert.match(home, /<h1>생활메모<\/h1>/);
const homeStructuredData = readJsonLdScripts("home", home);
assert.deepEqual(homeStructuredData, [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "생활메모",
    url: "https://example.com/",
    description: "실생활에 도움이 되는 정보를 정리하는 1인 운영 블로그",
    inLanguage: "ko-KR",
    publisher: { "@type": "Person", name: "생활메모" },
  },
]);
assert.ok(!Object.hasOwn(homeStructuredData[0], "potentialAction"));
assert.match(home, /<h2><a href="\/search">사이트 검색<\/a><\/h2>/);
assert.match(
  home,
  /<nav aria-label="생활메모"><ul><li><a href="\/">홈<\/a><\/li><li><a href="\/category\/daily-admin">생활·행정<\/a><\/li><\/ul><\/nav>/,
);
assert.match(article, /<h1>정부24 주민등록등본 발급 방법<\/h1>/);
assert.match(
  article,
  /<nav aria-label="현재 위치"><ol><li><a href="\/">생활메모<\/a><\/li><li><a href="\/category\/daily-admin">생활·행정<\/a><\/li><li><span aria-current="page">정부24 주민등록등본 발급 방법<\/span><\/li><\/ol><\/nav>/,
);
const articleStructuredData = readJsonLdScripts("article", article);
assert.deepEqual(articleStructuredData, [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "정부24 주민등록등본 발급 방법",
    description: "정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.",
    url: `https://example.com/article/${articleSlug}`,
    inLanguage: "ko-KR",
    datePublished: "2026-08-20T01:00:00Z",
    ...(identity.contractVersion === "3.0.0"
      ? { dateModified: "2026-08-24T02:30:00Z" }
      : {}),
    author: { "@type": "Person", name: "생활메모" },
    publisher: { "@type": "Person", name: "생활메모" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "생활메모",
        item: "https://example.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "생활·행정",
        item: "https://example.com/category/daily-admin",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "정부24 주민등록등본 발급 방법",
        item: `https://example.com/article/${articleSlug}`,
      },
    ],
  },
]);
for (const [label, html] of [
  ["article", article],
  ["category", category],
  ["static page", staticPage],
  ["search", search],
]) {
  assert.ok(
    readJsonLdScripts(label, html).every((data) => data["@type"] !== "WebSite"),
    `${label} includes home-only WebSite structured data`,
  );
}
assert.match(article, /<h2[^>]*>이 안내의 정보<\/h2>/);
assert.match(article, /<dt>작성<\/dt><dd>생활메모<\/dd>/);
assert.match(article, /<dt>운영<\/dt><dd>생활메모<\/dd>/);
assert.match(
  article,
  /<dt>게시<\/dt><dd><time dateTime="2026-08-20T01:00:00Z">2026년 8월 20일<\/time>/,
);
if (identity.contractVersion === "3.0.0") {
  assert.match(
    article,
    /<dt>수정<\/dt><dd><time dateTime="2026-08-24T02:30:00Z">2026년 8월 24일<\/time>/,
  );
} else {
  assert.doesNotMatch(article, /<dt>수정<\/dt>/);
}
assert.match(article, /href="\/about">운영 방식 보기<\/a>/);
assert.match(article, /<button type="button">공유<\/button>/);
assert.match(article, /<h2[^>]*>이 안내가 도움이 되었나요\?<\/h2>/);
assert.match(article, /<button aria-pressed="false" type="button">도움됨<\/button>/);
assert.doesNotMatch(article, /기사 저장 상태를 확인하고 있습니다/);
assert.doesNotMatch(
  article,
  /(?:article-sources-title|article-update-triggers-title|article-faq-title)/,
);
assert.match(staticPage, /<h1>소개<\/h1>/);
assert.match(
  category,
  /<h1>생활·행정<\/h1><p>생활과 행정 절차 안내<\/p>/,
);
assert.match(category, /<h2>최근 안내<\/h2>/);
const expectedCategoryDate =
  identity.contractVersion === "3.0.0"
    ? ["2026-08-24T02:30:00Z", "2026년 8월 24일"]
    : ["2026-08-20T01:00:00Z", "2026년 8월 20일"];
assert.match(
  category,
  new RegExp(
    `<time dateTime="${expectedCategoryDate[0]}">${expectedCategoryDate[1]}<\\/time>`,
  ),
);
assert.match(
  category,
  new RegExp(`href="/article/${articleSlug}">정부24 주민등록등본 발급 방법`),
);
assert.match(category, /정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다\./);
assert.match(category, /<h2>관련 주제<\/h2>/);
assert.match(category, /<li>정부24<\/li>/);
assert.match(archive, /<h1>전체 글<\/h1>/);
assert.match(archive, /게시일 최신순으로 모았습니다\./);
assert.match(archive, /href="\/category\/daily-admin">생활·행정<\/a>/);
assert.match(
  archive,
  new RegExp(
    `<time dateTime="${expectedCategoryDate[0]}">${expectedCategoryDate[1]}<\\/time>`,
  ),
);
assert.match(
  archive,
  new RegExp(`href="/article/${articleSlug}">정부24 주민등록등본 발급 방법`),
);
assert.match(
  staticPage,
  /생활메모의 운영 목적과 정보 준비 방법을 안내합니다\./,
);
assert.match(
  staticPage,
  /생활메모는 실생활 정보를 정리하는 1인 운영 블로그입니다\./,
);
assert.match(notFound, /페이지를 찾을 수 없습니다/);
assert.match(notFound, /<p>404<\/p>/);
assert.match(notFound, /href="\/">생활메모 홈으로 돌아가기<\/a>/);
assert.match(search, /<h1>검색<\/h1>/);
assert.match(search, /<label for="site-search-query">찾고 싶은 안내<\/label>/);
assert.match(search, /<input id="site-search-query" type="search"/);
assert.doesNotMatch(search, /<input[^>]+\sname=/);
assert.match(search, /검색어는 이 기기에서만 처리합니다\./);
assert.match(search, /href="\/category\/daily-admin">생활·행정<\/a>/);
assert.match(home, /<meta name="robots" content="noindex, nofollow"/);
assert.match(article, /<meta name="robots" content="noindex, nofollow"/);
assert.match(staticPage, /<meta name="robots" content="noindex, nofollow"/);
assert.match(category, /<meta name="robots" content="noindex, nofollow"/);
assert.match(archive, /<meta name="robots" content="noindex, nofollow"/);
assert.match(search, /<meta name="robots" content="noindex, nofollow"/);
assertCanonical(home, "https://example.com");
assertCanonical(
  article,
  `https://example.com/article/${articleSlug}`,
);
assertCanonical(staticPage, "https://example.com/about");
assertCanonical(category, `https://example.com/category/${categorySlug}`);
assertCanonical(archive, "https://example.com/archive");
assertCanonical(search, "https://example.com/search");
assert.match(archive, /<title>전체 글 \| 생활메모<\/title>/);
assert.match(category, /<title>생활·행정 \| 생활메모<\/title>/);
assert.equal(readMeta(category, "description"), "생활과 행정 절차 안내");
assert.match(category, /<meta property="og:type" content="website"/);
assert.match(category, /<meta property="og:title" content="생활·행정"/);
assert.match(category, /<meta property="og:description" content="생활과 행정 절차 안내"/);
assert.match(category, /<meta property="og:url" content="https:\/\/example\.com\/category\/daily-admin"/);
assert.match(category, /<meta name="twitter:card" content="summary"/);
assert.match(category, /<meta name="twitter:title" content="생활·행정"/);
assert.match(category, /<meta name="twitter:description" content="생활과 행정 절차 안내"/);

const identityFields = {
  releaseId: "content-foundry-release-id",
  siteId: "content-foundry-site-id",
  contractVersion: "content-foundry-contract-version",
  bundleChecksum: "content-foundry-bundle-checksum",
};
const releaseIdentity = Object.fromEntries(
  Object.keys(identityFields).map((field) => [field, identity[field]]),
);
for (const [field, metaName] of Object.entries(identityFields)) {
  assert.equal(readMeta(home, metaName), identity[field]);
  assert.equal(readMeta(article, metaName), identity[field]);
  assert.equal(readMeta(staticPage, metaName), identity[field]);
  assert.equal(readMeta(category, metaName), identity[field]);
  assert.equal(readMeta(archive, metaName), identity[field]);
  assert.equal(readMeta(search, metaName), identity[field]);
}

const articleArtifacts = readdirSync(join(outRoot, "article"))
  .filter((name) => name.endsWith(".html"))
  .sort();
assert.deepEqual(articleArtifacts, [`${articleSlug}.html`]);
assert.ok(!existsSync(join(outRoot, "article", "missing-article.html")));
assert.ok(!existsSync(join(outRoot, "missing-page.html")));
const categoryArtifacts = readdirSync(join(outRoot, "category"))
  .filter((name) => name.endsWith(".html"))
  .sort();
assert.deepEqual(categoryArtifacts, [`${categorySlug}.html`]);
assert.ok(!existsSync(join(outRoot, "category", "missing-category.html")));

assert.match(home, /property="og:image" content="https:\/\/example\.com\/og\.png"/);
assert.doesNotMatch(article, /(?:og:image|twitter:image|og\.png)/);
assert.doesNotMatch(staticPage, /(?:og:image|twitter:image|og\.png)/);
assert.doesNotMatch(category, /(?:og:image|twitter:image|og\.png)/);
assert.doesNotMatch(archive, /(?:og:image|twitter:image|og\.png)/);
assert.doesNotMatch(search, /(?:og:image|twitter:image|og\.png)/);
assertSafeHtml("home", home);
assertSafeHtml("article", article);
assertSafeHtml("static page", staticPage);
assertSafeHtml("category", category);
assertSafeHtml("archive", archive);
assertSafeHtml("search", search);
assertSafeHtml("404", notFound);

const projectionPath = join(appRoot, ".site-build/media-projection.json");
const dispositionPath = join(appRoot, ".site-build/route-dispositions.json");
const publicMediaRoot = join(appRoot, "public/_media");
const exportedMediaRoot = join(outRoot, "_media");
assert.ok(!existsSync(join(outRoot, ".site-build")), "Private build state was exported");
const dispositions = JSON.parse(readFileSync(dispositionPath, "utf8"));
assert.deepEqual(dispositions, {
  schemaVersion: "1.0.0",
  release: releaseIdentity,
  items: [],
});

if (identity.contractVersion === "2.0.0") {
  assert.ok(!existsSync(projectionPath), "v2 retained a media projection");
  assert.ok(!existsSync(publicMediaRoot), "v2 retained public media");
  assert.ok(!existsSync(exportedMediaRoot), "v2 exported media");
  assert.doesNotMatch(article, /content-gallery|data-action-kind|\/_media\//);
  assert.doesNotMatch(staticPage, /data-action-kind|\/_media\//);
} else {
  const mediaHashes = [
    "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
    "6ece129d56e4d016fd870514dee9310d37dd4f504b6c145509f52b7ef315ca67",
  ];
  const expectedMedia = mediaHashes.flatMap((hash) => [
    `${hash}/source.png`,
    `${hash}/webp-q82/16w.webp`,
  ]).sort();
  const exportedMedia = listFiles(exportedMediaRoot)
    .map((path) => path.slice(exportedMediaRoot.length + 1))
    .sort();
  assert.deepEqual(exportedMedia, expectedMedia);
  assert.deepEqual(
    listFiles(publicMediaRoot)
      .map((path) => path.slice(publicMediaRoot.length + 1))
      .sort(),
    expectedMedia,
  );

  for (const hash of mediaHashes) {
    const source = readFileSync(join(exportedMediaRoot, hash, "source.png"));
    assert.equal(createHash("sha256").update(source).digest("hex"), hash);
    const derivative = readFileSync(
      join(exportedMediaRoot, hash, "webp-q82/16w.webp"),
    );
    assert.equal(derivative.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(derivative.subarray(8, 12).toString("ascii"), "WEBP");
  }

  assert.match(article, /<figcaption>발급 화면 순서<\/figcaption>/);
  assert.match(article, /alt="파란색으로 표시된 발급 화면 순서 1단계"/);
  assert.match(article, /alt="초록색으로 표시된 발급 화면 순서 2단계"/);
  assert.match(article, /data-action-kind="internal"><a href="\/about">/);
  assert.match(
    staticPage,
    /data-action-kind="internal"><a href="\/article\/government24-resident-registration-guide">/,
  );
  for (const relativePath of expectedMedia) {
    assert.match(article, new RegExp(escapePattern(`/_media/${relativePath}`)));
  }

  const projection = JSON.parse(readFileSync(projectionPath, "utf8"));
  assert.deepEqual(
    {
      contractVersion: projection.contractVersion,
      siteId: projection.siteId,
      releaseId: projection.releaseId,
      bundleChecksum: projection.bundleChecksum,
    },
    releaseIdentity,
  );
  assert.equal(projection.assets.length, 2);
}

for (const sourceRoot of ["app", "components", "lib"]) {
  for (const sourcePath of listSourceFiles(join(appRoot, sourceRoot))) {
    const source = readFileSync(sourcePath, "utf8");
    const isClientModule = /^["']use client["'];/m.test(source);
    assert.equal(
      isClientModule,
      allowedClientModules.has(sourcePath),
      `${sourcePath} has an unexpected client-module classification`,
    );
    assert.doesNotMatch(
      source,
      /dangerouslySetInnerHTML/,
      `${sourcePath} executes raw HTML`,
    );
  }
}

const searchControllerSource = readFileSync(
  join(appRoot, "components/search-controller.tsx"),
  "utf8",
);
assert.doesNotMatch(
  searchControllerSource,
  /\b(?:localStorage|sessionStorage|sendBeacon|URLSearchParams)\b|console\.|(?:window|document)\.location|history\./,
  "Search controller persists, logs, or exposes raw queries",
);

console.log("Site A static export verified.");
