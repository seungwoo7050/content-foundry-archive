import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import * as formatsModule from "ajv-formats";
import type { FormatsPlugin } from "ajv-formats";

import articleSchema from "../vendor/2.0.0/schemas/article.schema.json" with { type: "json" };
import contentBlockSchema from "../vendor/2.0.0/schemas/content-block.schema.json" with { type: "json" };
import contentSchema from "../vendor/2.0.0/schemas/content.schema.json" with { type: "json" };
import mediaManifestSchema from "../vendor/2.0.0/schemas/media-manifest.schema.json" with { type: "json" };
import navigationSchema from "../vendor/2.0.0/schemas/navigation.schema.json" with { type: "json" };
import pageSchema from "../vendor/2.0.0/schemas/page.schema.json" with { type: "json" };
import redirectsSchema from "../vendor/2.0.0/schemas/redirects.schema.json" with { type: "json" };
import releaseSchema from "../vendor/2.0.0/schemas/release.schema.json" with { type: "json" };
import siteSchema from "../vendor/2.0.0/schemas/site.schema.json" with { type: "json" };
import taxonomySchema from "../vendor/2.0.0/schemas/taxonomy.schema.json" with { type: "json" };

import { ContractError } from "./errors.js";
import type {
  MediaManifest,
  PublicRouteDispositions,
  PublicSiteConfiguration,
  PublicSiteNavigation,
  PublicSiteReleaseManifest,
  PublicSiteTaxonomy,
  PublishedArticleProjection,
  PublishedContentBlock,
  PublishedStaticPageProjection,
  PublishedStructuredContent,
} from "./index.js";

export const SUPPORTED_CONTRACT_VERSION = "2.0.0" as const;

interface ContractDocuments {
  article: PublishedArticleProjection;
  "content-block": PublishedContentBlock;
  content: PublishedStructuredContent;
  "media-manifest": MediaManifest;
  navigation: PublicSiteNavigation;
  page: PublishedStaticPageProjection;
  redirects: PublicRouteDispositions;
  release: PublicSiteReleaseManifest;
  site: PublicSiteConfiguration;
  taxonomy: PublicSiteTaxonomy;
}

export type ContractDocumentKind = keyof ContractDocuments;

const ajv = new Ajv2020({ allErrors: true, strict: true });
const addFormats = formatsModule.default as unknown as FormatsPlugin;
addFormats(ajv);

const schemaNames = [
  "content-block",
  "content",
  "article",
  "media-manifest",
  "navigation",
  "page",
  "redirects",
  "release",
  "site",
  "taxonomy",
] as const satisfies readonly ContractDocumentKind[];

const schemas: Record<ContractDocumentKind, object> = {
  article: articleSchema,
  "content-block": contentBlockSchema,
  content: contentSchema,
  "media-manifest": mediaManifestSchema,
  navigation: navigationSchema,
  page: pageSchema,
  redirects: redirectsSchema,
  release: releaseSchema,
  site: siteSchema,
  taxonomy: taxonomySchema,
};

const validators = new Map<ContractDocumentKind, ValidateFunction>();

for (const name of schemaNames) {
  ajv.addSchema(schemas[name], name);
}

for (const name of schemaNames) {
  const validator = ajv.getSchema(name);
  if (!validator) throw new Error(`Contract schema was not registered: ${name}`);
  validators.set(name, validator);
}

function toIssues(errors: ErrorObject[] | null | undefined) {
  return (errors ?? []).map((error) => ({
    path: error.instancePath || "/",
    message: error.message ?? error.keyword,
  }));
}

export function validateContractDocument<K extends ContractDocumentKind>(
  kind: K,
  value: unknown,
): ContractDocuments[K] {
  if (
    kind === "release" &&
    typeof value === "object" &&
    value !== null &&
    "contractVersion" in value &&
    value.contractVersion !== SUPPORTED_CONTRACT_VERSION
  ) {
    throw new ContractError(
      "CONTRACT_UNSUPPORTED",
      `Unsupported contract version: ${String(value.contractVersion)}`,
      [{ path: "/contractVersion", message: `expected ${SUPPORTED_CONTRACT_VERSION}` }],
    );
  }

  const validator = validators.get(kind);
  if (!validator?.(value)) {
    throw new ContractError(
      "CONTRACT_INVALID",
      `Invalid ${kind} contract document`,
      toIssues(validator?.errors),
    );
  }

  return value as ContractDocuments[K];
}
