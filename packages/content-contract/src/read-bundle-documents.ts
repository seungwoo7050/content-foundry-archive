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
  validateContractDocument,
} from "./validate-document.js";
import { verifyReleaseIntegrity } from "./verify-integrity.js";

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
  root: string,
  path: string,
  kind: K,
) {
  return validateContractDocument(kind, readJson(root, path));
}

function readRecords<K extends "article" | "page">(
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
      return readDocument(root, `${directory}/${name}`, kind);
    });
}

export function readReleaseBundleDocuments(root: string): ReleaseBundleDocuments {
  const release = verifyReleaseIntegrity(root);
  return {
    release,
    site: readDocument(root, "site.json", "site"),
    navigation: readDocument(root, "navigation.json", "navigation"),
    taxonomy: readDocument(root, "taxonomy.json", "taxonomy"),
    mediaManifest: readDocument(
      root,
      "media/media-manifest.json",
      "media-manifest",
    ),
    redirects: readDocument(root, "redirects.json", "redirects"),
    articles: readRecords(root, "articles", "article"),
    pages: readRecords(root, "pages", "page"),
  };
}
