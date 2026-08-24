import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { ContractError } from "./errors.js";
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
  validateContractDocumentForVersion,
} from "./validate-document.js";
import { verifyReleaseIntegrity } from "./verify-integrity.js";

type ReleaseContractVersion = PublicSiteReleaseManifest["contractVersion"];

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

function readJson(root: string, path: string): unknown {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", `Cannot parse ${path}`, [
      { path: `/${path}`, message: String(error) },
    ]);
  }
}

function readDocument<K extends ContractDocumentKind>(
  version: ReleaseContractVersion,
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocumentForVersion(
    version,
    kind,
    readJson(root, path),
  );
}

function readRecords<K extends "article" | "page">(
  version: ReleaseContractVersion,
  root: string,
  directory: string,
  kind: K,
) {
  return readdirSync(join(root, directory))
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)))
    .map((name) => {
      if (!name.endsWith(".json")) {
        throw new ContractError(
          "CONTRACT_INVALID",
          `Unexpected ${directory} entry: ${name}`,
        );
      }
      return readDocument(version, root, `${directory}/${name}`, kind);
    });
}

export function readReleaseBundleDocuments(root: string): ReleaseBundleDocuments {
  const release = verifyReleaseIntegrity(root);
  const version = release.contractVersion;
  return {
    release,
    site: readDocument(version, root, "site.json", "site"),
    navigation: readDocument(version, root, "navigation.json", "navigation"),
    taxonomy: readDocument(version, root, "taxonomy.json", "taxonomy"),
    mediaManifest: readDocument(
      version,
      root,
      "media/media-manifest.json",
      "media-manifest",
    ),
    redirects: readDocument(version, root, "redirects.json", "redirects"),
    articles: readRecords(version, root, "articles", "article"),
    pages: readRecords(version, root, "pages", "page"),
  };
}
