import assert from "node:assert/strict";
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

function assertSafeScripts(label, html) {
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    assert.ok(
      match[1].startsWith("/_next/"),
      `${label} includes an external script source: ${match[1]}`,
    );
  }

  for (const match of html.matchAll(
    /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const source = match[1].trim();
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

function listSourceFiles(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }
    return [".ts", ".tsx"].includes(extname(path)) ? [path] : [];
  });
}

const home = readArtifact("index.html");
const article = readArtifact(articleRelativePath);
const staticPage = readArtifact(staticPageRelativePath);
const category = readArtifact(categoryRelativePath);
const notFound = readArtifact("404.html");
const identity = JSON.parse(readArtifact("_release.json"));

assert.match(home, /<h1 id="home-title">생활메모<\/h1>/);
assert.match(
  home,
  /<nav aria-label="주요 메뉴"><ul><li><a href="\/">홈<\/a><\/li><li><a href="\/category\/daily-admin">생활·행정<\/a><\/li><\/ul><\/nav>/,
);
assert.match(article, /<h1>정부24 주민등록등본 발급 방법<\/h1>/);
assert.match(staticPage, /<h1>소개<\/h1>/);
assert.match(
  category,
  /<h1>생활·행정<\/h1><p>생활과 행정 절차 안내<\/p>/,
);
assert.match(category, /<h2 id="category-recent">최근 안내<\/h2>/);
assert.match(
  category,
  /<time dateTime="2026-08-20T01:00:00Z">2026년 8월 20일<\/time>/,
);
assert.match(
  category,
  new RegExp(`href="/article/${articleSlug}">정부24 주민등록등본 발급 방법`),
);
assert.match(category, /정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다\./);
assert.match(category, /<h2 id="category-topics">관련 주제<\/h2>/);
assert.match(category, /<li>정부24<\/li>/);
assert.match(
  staticPage,
  /생활메모의 운영 목적과 정보 준비 방법을 안내합니다\./,
);
assert.match(
  staticPage,
  /생활메모는 실생활 정보를 정리하는 1인 운영 블로그입니다\./,
);
assert.match(notFound, /페이지를 찾을 수 없습니다/);
assert.match(notFound, /href="\/">생활메모 홈으로 돌아가기<\/a>/);
assert.match(home, /<meta name="robots" content="noindex, nofollow"/);
assert.match(article, /<meta name="robots" content="noindex, nofollow"/);
assert.match(staticPage, /<meta name="robots" content="noindex, nofollow"/);
assert.match(category, /<meta name="robots" content="noindex, nofollow"/);
assertCanonical(home, "https://example.com");
assertCanonical(
  article,
  `https://example.com/article/${articleSlug}`,
);
assertCanonical(staticPage, "https://example.com/about");
assertCanonical(category, `https://example.com/category/${categorySlug}`);
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
assert.deepEqual(Object.keys(identity).sort(), Object.keys(identityFields).sort());
for (const [field, metaName] of Object.entries(identityFields)) {
  assert.equal(readMeta(home, metaName), identity[field]);
  assert.equal(readMeta(article, metaName), identity[field]);
  assert.equal(readMeta(staticPage, metaName), identity[field]);
  assert.equal(readMeta(category, metaName), identity[field]);
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
assertSafeHtml("home", home);
assertSafeHtml("article", article);
assertSafeHtml("static page", staticPage);
assertSafeHtml("category", category);
assertSafeHtml("404", notFound);

for (const sourceRoot of ["app", "components", "lib"]) {
  for (const sourcePath of listSourceFiles(join(appRoot, sourceRoot))) {
    const source = readFileSync(sourcePath, "utf8");
    assert.doesNotMatch(source, /^["']use client["'];/m, `${sourcePath} is a client module`);
    assert.doesNotMatch(
      source,
      /dangerouslySetInnerHTML/,
      `${sourcePath} executes raw HTML`,
    );
  }
}

console.log("Site A static export verified.");
