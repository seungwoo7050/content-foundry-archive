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

const home = readArtifact("index.html");
const article = readArtifact(articleRelativePath);
const notFound = readArtifact("404.html");
JSON.parse(readArtifact("_release.json"));

assert.match(home, /<h1 id="home-title">생활메모<\/h1>/);
assert.match(article, /<h1>정부24 주민등록등본 발급 방법<\/h1>/);
assert.match(notFound, /페이지를 찾을 수 없습니다/);
assert.match(notFound, /href="\/">생활메모 홈으로 돌아가기<\/a>/);
const articleArtifacts = readdirSync(join(outRoot, "article"))
  .filter((name) => name.endsWith(".html"))
  .sort();
assert.deepEqual(articleArtifacts, [`${articleSlug}.html`]);
assert.ok(!existsSync(join(outRoot, "article", "missing-article.html")));

console.log("Site A static export verified.");
