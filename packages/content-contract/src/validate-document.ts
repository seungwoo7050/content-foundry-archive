import { readFileSync } from "node:fs";

import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import * as formatsModule from "ajv-formats";
import type { FormatsPlugin } from "ajv-formats";

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

const schemaRoot = new URL("../vendor/2.0.0/schemas/", import.meta.url);
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

const validators = new Map<ContractDocumentKind, ValidateFunction>();

for (const name of schemaNames) {
  const schema = JSON.parse(
    readFileSync(new URL(`${name}.schema.json`, schemaRoot), "utf8"),
  ) as object;
  ajv.addSchema(schema, name);
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
