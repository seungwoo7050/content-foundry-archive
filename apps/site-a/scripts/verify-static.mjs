import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(appRoot, "out");
const articleSlug = "government24-resident-registration-guide";
const articleRelativePath = `article/${articleSlug}.html`;

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

const home = readArtifact("index.html");
const article = readArtifact(articleRelativePath);
const notFound = readArtifact("404.html");
const identity = JSON.parse(readArtifact("_release.json"));

assert.match(home, /<h1 id="home-title">생활메모<\/h1>/);
assert.match(article, /<h1>정부24 주민등록등본 발급 방법<\/h1>/);
assert.match(notFound, /페이지를 찾을 수 없습니다/);
assert.match(notFound, /href="\/">생활메모 홈으로 돌아가기<\/a>/);
assert.match(home, /<meta name="robots" content="noindex, nofollow"/);
assert.match(article, /<meta name="robots" content="noindex, nofollow"/);
assertCanonical(home, "https://example.com");
assertCanonical(
  article,
  `https://example.com/article/${articleSlug}`,
);

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
}

const articleArtifacts = readdirSync(join(outRoot, "article"))
  .filter((name) => name.endsWith(".html"))
  .sort();
assert.deepEqual(articleArtifacts, [`${articleSlug}.html`]);
assert.ok(!existsSync(join(outRoot, "article", "missing-article.html")));

assert.match(home, /property="og:image" content="https:\/\/example\.com\/og\.png"/);
assert.doesNotMatch(article, /(?:og:image|twitter:image|og\.png)/);
console.log("Site A static export verified.");
