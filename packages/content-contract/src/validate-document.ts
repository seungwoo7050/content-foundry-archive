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

import {
  resolveSupportedContractVersion,
  SUPPORTED_CONTRACT_VERSION,
} from "./contract-version.js";
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

export { SUPPORTED_CONTRACT_VERSION };

interface ContractDocumentsV2 {
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

interface ContractDocumentsBySchemaVersion {
  "2.0.0": ContractDocumentsV2;
}

export type ContractDocumentKind = keyof ContractDocumentsV2;
export type RegisteredContractSchemaVersion =
  keyof ContractDocumentsBySchemaVersion;

type ContractDocumentKindFor<V extends RegisteredContractSchemaVersion> =
  Extract<keyof ContractDocumentsBySchemaVersion[V], string>;
type ContractDocumentFor<
  V extends RegisteredContractSchemaVersion,
  K extends ContractDocumentKindFor<V>,
> = ContractDocumentsBySchemaVersion[V][K];

interface ContractSchemaPack {
  readonly dependencies: readonly object[];
  readonly names: readonly string[];
  readonly documents: Readonly<Record<string, object>>;
}

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

const schemaPacks = {
  "2.0.0": {
    dependencies: [],
    names: schemaNames,
    documents: schemas,
  },
} satisfies Record<RegisteredContractSchemaVersion, ContractSchemaPack>;

function compileSchemaPack(pack: ContractSchemaPack) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const addFormats = formatsModule.default as unknown as FormatsPlugin;
  addFormats(ajv);
  for (const dependency of pack.dependencies) ajv.addSchema(dependency);

  for (const name of pack.names) {
    const schema = pack.documents[name];
    if (!schema) throw new Error(`Contract schema is missing: ${name}`);
    ajv.addSchema(schema, name);
  }

  const validators = new Map<string, ValidateFunction>();
  for (const name of pack.names) {
    const validator = ajv.getSchema(name);
    if (!validator) {
      throw new Error(`Contract schema was not registered: ${name}`);
    }
    validators.set(name, validator);
  }
  return validators;
}

const validatorsByVersion = {
  "2.0.0": compileSchemaPack(schemaPacks["2.0.0"]),
} satisfies Record<
  RegisteredContractSchemaVersion,
  ReadonlyMap<string, ValidateFunction>
>;

function toIssues(errors: ErrorObject[] | null | undefined) {
  return (errors ?? []).map((error) => ({
    path: error.instancePath || "/",
    message: error.message ?? error.keyword,
  }));
}

export function validateContractDocumentForVersion<
  V extends RegisteredContractSchemaVersion,
  K extends ContractDocumentKindFor<V>,
>(
  version: V,
  kind: K,
  value: unknown,
): ContractDocumentFor<V, K> {
  const validator = validatorsByVersion[version].get(kind);
  if (!validator?.(value)) {
    throw new ContractError(
      "CONTRACT_INVALID",
      `Invalid ${kind} contract document for ${version}`,
      toIssues(validator?.errors),
    );
  }

  return value as ContractDocumentFor<V, K>;
}

export function validateContractDocument<K extends ContractDocumentKind>(
  kind: K,
  value: unknown,
): ContractDocumentsV2[K] {
  let version = SUPPORTED_CONTRACT_VERSION;
  if (
    kind === "release" &&
    typeof value === "object" &&
    value !== null &&
    "contractVersion" in value
  ) {
    version = resolveSupportedContractVersion(value.contractVersion);
  }

  return validateContractDocumentForVersion(version, kind, value);
}
