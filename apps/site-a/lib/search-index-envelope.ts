import type { ReleaseIdentity } from "./release-identity";

export const MAX_SEARCH_INDEX_ENTRIES = 5_000;

export interface SearchIndexEnvelope {
  readonly schemaVersion: "1.0.0";
  readonly release: ReleaseIdentity;
  readonly locale: string;
  readonly entries: readonly unknown[];
}

export class SearchIndexValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchIndexValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSearchIndexEnvelope(
  value: unknown,
  expectedRelease: ReleaseIdentity,
  expectedLocale: string,
): SearchIndexEnvelope {
  if (!isRecord(value) || value.schemaVersion !== "1.0.0") {
    throw new SearchIndexValidationError("Unsupported search index schema");
  }
  if (value.locale !== expectedLocale) {
    throw new SearchIndexValidationError("Search index locale mismatch");
  }
  if (!isRecord(value.release)) {
    throw new SearchIndexValidationError("Search index release is missing");
  }
  for (const field of [
    "releaseId",
    "siteId",
    "contractVersion",
    "bundleChecksum",
  ] as const) {
    if (value.release[field] !== expectedRelease[field]) {
      throw new SearchIndexValidationError(
        `Search index release mismatch: ${field}`,
      );
    }
  }
  if (
    !Array.isArray(value.entries) ||
    value.entries.length > MAX_SEARCH_INDEX_ENTRIES
  ) {
    throw new SearchIndexValidationError("Search index entry count is invalid");
  }

  return value as unknown as SearchIndexEnvelope;
}
