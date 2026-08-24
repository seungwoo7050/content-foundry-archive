import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { ContractError, type ContractIssue } from "./errors.js";
import type { PublishedArticleProjection } from "./generated/article.js";
import type { MediaManifest } from "./generated/media-manifest.js";
import type { PublicSiteNavigation } from "./generated/navigation.js";
import type { PublishedStaticPageProjection } from "./generated/page.js";
import type { PublicRouteDispositions } from "./generated/redirects.js";
import type { PublicSiteReleaseManifest } from "./generated/release.js";
import type { PublicSiteConfiguration } from "./generated/site.js";
import type { PublicSiteTaxonomy } from "./generated/taxonomy.js";
import {
  type ContractDocumentKind,
  type RegisteredContractSchemaVersion,
  validateContractDocumentForVersion,
} from "./validate-document.js";
import {
  verifyReleaseIntegrity,
  verifyReleaseIntegrityForVersion,
} from "./verify-integrity.js";

type ContractDocumentV3<K extends ContractDocumentKind> = ReturnType<
  typeof validateContractDocumentForVersion<"3.0.0", K>
>;

export interface ReleaseBundleDocuments {
  readonly release: PublicSiteReleaseManifest;
  readonly site: PublicSiteConfiguration;
  readonly navigation: PublicSiteNavigation;
  readonly taxonomy: PublicSiteTaxonomy;
  readonly mediaManifest: MediaManifest;
  readonly redirects: PublicRouteDispositions;
  readonly articles: readonly PublishedArticleProjection[];
  readonly pages: readonly PublishedStaticPageProjection[];
}

export interface ReleaseBundleDocumentsV3 {
  readonly release: ContractDocumentV3<"release">;
  readonly site: ContractDocumentV3<"site">;
  readonly navigation: ContractDocumentV3<"navigation">;
  readonly taxonomy: ContractDocumentV3<"taxonomy">;
  readonly mediaManifest: ContractDocumentV3<"media-manifest">;
  readonly redirects: ContractDocumentV3<"redirects">;
  readonly articles: readonly ContractDocumentV3<"article">[];
  readonly pages: readonly ContractDocumentV3<"page">[];
}

export interface ReleaseBundleDocumentsByVersion {
  "2.0.0": ReleaseBundleDocuments;
  "3.0.0": ReleaseBundleDocumentsV3;
}

function readJson(root: string, path: string): unknown {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", `Cannot parse ${path}`, [
      { path: `/${path}`, message: String(error) },
    ]);
  }
}

function readDocumentV2<K extends ContractDocumentKind>(
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion("2.0.0", kind, readJson(root, path));
}

function readDocumentV3<K extends ContractDocumentKind>(
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion("3.0.0", kind, readJson(root, path));
}

interface RecordGroup<T> {
  readonly directoryMissing: boolean;
  readonly records: readonly T[];
}

function readRecords<T>(
  root: string,
  directory: string,
  readRecord: (path: string) => T,
): RecordGroup<T> {
  let names: string[];
  try {
    names = readdirSync(join(root, directory));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { directoryMissing: true, records: [] };
    }
    throw new ContractError(
      "CONTRACT_INVALID",
      `Cannot read ${directory} records`,
      [{ path: `/${directory}`, message: "Cannot inspect record directory" }],
    );
  }

  const records = names
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)))
    .map((name) => {
      if (!name.endsWith(".json")) {
        throw new ContractError(
          "CONTRACT_INVALID",
          `Unexpected ${directory} entry: ${name}`,
        );
      }
      return readRecord(`${directory}/${name}`);
    });
  return { directoryMissing: false, records };
}

function readReleaseRecords<Article, Page>(
  root: string,
  release: { readonly articleCount: number; readonly pageCount: number },
  readArticle: (path: string) => Article,
  readPage: (path: string) => Page,
) {
  const articles = readRecords(root, "articles", readArticle);
  const pages = readRecords(root, "pages", readPage);
  const issues: ContractIssue[] = [];

  if (articles.directoryMissing && release.articleCount !== 0) {
    issues.push({
      path: "/release/articleCount",
      message: `expected 0, got ${release.articleCount}`,
    });
  }
  if (pages.directoryMissing && release.pageCount !== 0) {
    issues.push({
      path: "/release/pageCount",
      message: `expected 0, got ${release.pageCount}`,
    });
  }
  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Release identity is inconsistent",
      issues,
    );
  }

  return { articles: articles.records, pages: pages.records };
}

function assembleReleaseBundleDocumentsV2(
  root: string,
  release: PublicSiteReleaseManifest,
): ReleaseBundleDocuments {
  const roots = {
    site: readDocumentV2(root, "site.json", "site"),
    navigation: readDocumentV2(root, "navigation.json", "navigation"),
    taxonomy: readDocumentV2(root, "taxonomy.json", "taxonomy"),
    mediaManifest: readDocumentV2(
      root,
      "media/media-manifest.json",
      "media-manifest",
    ),
    redirects: readDocumentV2(root, "redirects.json", "redirects"),
  };
  const records = readReleaseRecords(
    root,
    release,
    (path) => readDocumentV2(root, path, "article"),
    (path) => readDocumentV2(root, path, "page"),
  );
  return {
    release,
    ...roots,
    ...records,
  };
}

function assembleReleaseBundleDocumentsV3(
  root: string,
  release: ContractDocumentV3<"release">,
): ReleaseBundleDocumentsV3 {
  const roots = {
    site: readDocumentV3(root, "site.json", "site"),
    navigation: readDocumentV3(root, "navigation.json", "navigation"),
    taxonomy: readDocumentV3(root, "taxonomy.json", "taxonomy"),
    mediaManifest: readDocumentV3(
      root,
      "media/media-manifest.json",
      "media-manifest",
    ),
    redirects: readDocumentV3(root, "redirects.json", "redirects"),
  };
  const records = readReleaseRecords(
    root,
    release,
    (path) => readDocumentV3(root, path, "article"),
    (path) => readDocumentV3(root, path, "page"),
  );
  return {
    release,
    ...roots,
    ...records,
  };
}

export function readReleaseBundleDocumentsForVersion(
  version: "2.0.0",
  root: string,
): ReleaseBundleDocumentsByVersion["2.0.0"];
export function readReleaseBundleDocumentsForVersion(
  version: "3.0.0",
  root: string,
): ReleaseBundleDocumentsByVersion["3.0.0"];
export function readReleaseBundleDocumentsForVersion(
  version: RegisteredContractSchemaVersion,
  root: string,
): ReleaseBundleDocuments | ReleaseBundleDocumentsV3 {
  if (version === "2.0.0") {
    return assembleReleaseBundleDocumentsV2(
      root,
      verifyReleaseIntegrityForVersion("2.0.0", root),
    );
  }
  if (version === "3.0.0") {
    return assembleReleaseBundleDocumentsV3(
      root,
      verifyReleaseIntegrityForVersion("3.0.0", root),
    );
  }

  const unhandledVersion: never = version;
  throw new Error(`Unhandled registered contract version: ${unhandledVersion}`);
}

export function readReleaseBundleDocuments(root: string): ReleaseBundleDocuments {
  return assembleReleaseBundleDocumentsV2(root, verifyReleaseIntegrity(root));
}
