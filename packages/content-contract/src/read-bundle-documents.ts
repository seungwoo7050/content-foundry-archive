import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { TextDecoder } from "node:util";

import { ContractError, type ContractIssue } from "./errors.js";
import type { SupportedContractVersion } from "./contract-version.js";
import type { PublishedArticleProjection } from "./generated/article.js";
import type { MediaManifest } from "./generated/media-manifest.js";
import type { PublicSiteNavigation } from "./generated/navigation.js";
import type { PublishedStaticPageProjection } from "./generated/page.js";
import type { PublicRouteDispositions } from "./generated/redirects.js";
import type { PublicSiteReleaseManifest } from "./generated/release.js";
import type { PublicSiteConfiguration } from "./generated/site.js";
import type { PublicSiteTaxonomy } from "./generated/taxonomy.js";
import {
  type ContractDocumentFor,
  type ContractDocumentKindFor,
  validateContractDocumentForVersion,
} from "./validate-document.js";
import {
  verifyReleaseIntegrity,
  verifyReleaseIntegrityForVersion,
  verifySupportedReleaseIntegrity,
} from "./verify-integrity.js";

type ContractDocumentV3<K extends ContractDocumentKindFor<"3.0.0">> =
  ContractDocumentFor<"3.0.0", K>;
type ContractDocumentV4<K extends ContractDocumentKindFor<"4.0.0">> =
  ContractDocumentFor<"4.0.0", K>;

const JSON_DECODER = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true,
});

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

export interface ReleaseBundleDocumentsV4 {
  readonly release: ContractDocumentV4<"release">;
  readonly site: ContractDocumentV4<"site">;
  readonly navigation: ContractDocumentV4<"navigation">;
  readonly taxonomy: ContractDocumentV4<"taxonomy">;
  readonly mediaManifest: ContractDocumentV4<"media-manifest">;
  readonly presentation: ContractDocumentV4<"presentation">;
  readonly redirects: ContractDocumentV4<"redirects">;
  readonly articles: readonly ContractDocumentV4<"article">[];
  readonly pages: readonly ContractDocumentV4<"page">[];
}

export interface ReleaseBundleDocumentsByVersion {
  "2.0.0": ReleaseBundleDocuments;
  "3.0.0": ReleaseBundleDocumentsV3;
  "4.0.0": ReleaseBundleDocumentsV4;
}

export type SupportedReleaseBundleDocuments =
  ReleaseBundleDocumentsByVersion[SupportedContractVersion];

function readJson(root: string, path: string): unknown {
  let bytes: Buffer;
  try {
    bytes = readFileSync(join(root, path));
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", `Cannot parse ${path}`, [
      { path: `/${path}`, message: String(error) },
    ]);
  }

  let source: string;
  try {
    source = JSON_DECODER.decode(bytes);
  } catch {
    throw new ContractError("CONTRACT_INVALID", `Cannot parse ${path}`, [
      { path: `/${path}`, message: "JSON document must be valid UTF-8" },
    ]);
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", `Cannot parse ${path}`, [
      { path: `/${path}`, message: String(error) },
    ]);
  }
}

function readDocumentV2<K extends ContractDocumentKindFor<"2.0.0">>(
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion("2.0.0", kind, readJson(root, path));
}

function readDocumentV3<K extends ContractDocumentKindFor<"3.0.0">>(
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion("3.0.0", kind, readJson(root, path));
}

function readDocumentV4<K extends ContractDocumentKindFor<"4.0.0">>(
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion("4.0.0", kind, readJson(root, path));
}

interface RecordEntry<T> {
  readonly path: string;
  readonly record: T;
}

interface RecordGroup<T> {
  readonly directoryMissing: boolean;
  readonly entries: readonly RecordEntry<T>[];
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
      return { directoryMissing: true, entries: [] };
    }
    throw new ContractError(
      "CONTRACT_INVALID",
      `Cannot read ${directory} records`,
      [{ path: `/${directory}`, message: "Cannot inspect record directory" }],
    );
  }

  const entries = names
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)))
    .map((name) => {
      if (!name.endsWith(".json")) {
        throw new ContractError(
          "CONTRACT_INVALID",
          `Unexpected ${directory} entry: ${name}`,
        );
      }
      const path = `${directory}/${name}`;
      return { path, record: readRecord(path) };
    });
  return { directoryMissing: false, entries };
}

function appendIdentityIssues<T extends { readonly id: string }>(
  issues: ContractIssue[],
  entries: readonly RecordEntry<T>[],
) {
  for (const { path, record } of entries) {
    const expected = path.slice(path.lastIndexOf("/") + 1, -".json".length);
    if (record.id !== expected) {
      issues.push({
        path: `/${path}/id`,
        message: `expected ${expected}, got ${record.id}`,
      });
    }
  }
}

function readReleaseRecords<
  Article extends { readonly id: string },
  Page extends { readonly id: string },
>(
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
  appendIdentityIssues(issues, articles.entries);
  appendIdentityIssues(issues, pages.entries);
  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Release identity is inconsistent",
      issues,
    );
  }

  return {
    articles: articles.entries.map(({ record }) => record),
    pages: pages.entries.map(({ record }) => record),
  };
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

function assembleReleaseBundleDocumentsV4(
  root: string,
  release: ContractDocumentV4<"release">,
): ReleaseBundleDocumentsV4 {
  const roots = {
    site: readDocumentV4(root, "site.json", "site"),
    navigation: readDocumentV4(root, "navigation.json", "navigation"),
    taxonomy: readDocumentV4(root, "taxonomy.json", "taxonomy"),
    mediaManifest: readDocumentV4(
      root,
      "media/media-manifest.json",
      "media-manifest",
    ),
    presentation: readDocumentV4(
      root,
      "presentation.json",
      "presentation",
    ),
    redirects: readDocumentV4(root, "redirects.json", "redirects"),
  };
  const records = readReleaseRecords(
    root,
    release,
    (path) => readDocumentV4(root, path, "article"),
    (path) => readDocumentV4(root, path, "page"),
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
  version: "4.0.0",
  root: string,
): ReleaseBundleDocumentsByVersion["4.0.0"];
export function readReleaseBundleDocumentsForVersion(
  version: keyof ReleaseBundleDocumentsByVersion,
  root: string,
): ReleaseBundleDocumentsByVersion[keyof ReleaseBundleDocumentsByVersion] {
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
  if (version === "4.0.0") {
    return assembleReleaseBundleDocumentsV4(
      root,
      verifyReleaseIntegrityForVersion("4.0.0", root),
    );
  }

  const unhandledVersion: never = version;
  throw new Error(`Unhandled registered contract version: ${unhandledVersion}`);
}

export function readReleaseBundleDocuments(root: string): ReleaseBundleDocuments {
  return assembleReleaseBundleDocumentsV2(root, verifyReleaseIntegrity(root));
}

export function readSupportedReleaseBundleDocuments(
  root: string,
): SupportedReleaseBundleDocuments {
  const release = verifySupportedReleaseIntegrity(root) as
    | PublicSiteReleaseManifest
    | ContractDocumentV3<"release">
    | ContractDocumentV4<"release">;
  if (release.contractVersion === "2.0.0") {
    return assembleReleaseBundleDocumentsV2(
      root,
      release,
    ) as SupportedReleaseBundleDocuments;
  }
  if (release.contractVersion === "3.0.0") {
    // The runtime support gate above opens this branch only when the tuple does.
    return assembleReleaseBundleDocumentsV3(
      root,
      release,
    ) as unknown as SupportedReleaseBundleDocuments;
  }
  if (release.contractVersion === "4.0.0") {
    return assembleReleaseBundleDocumentsV4(
      root,
      release,
    ) as unknown as SupportedReleaseBundleDocuments;
  }

  const unhandledVersion: never = release;
  throw new Error(`Unhandled supported release: ${String(unhandledVersion)}`);
}
