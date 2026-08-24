import type { SearchIndexEntry } from "./search-index-entry";
import {
  SearchIndexValidationError,
  type SearchIndexEnvelope,
} from "./search-index-envelope";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTaxon(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.label === "string"
  );
}

function isHeading(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string"
  );
}

function isSearchIndexEntry(value: unknown): value is SearchIndexEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.path === "string" &&
    /^\/article\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.path) &&
    typeof value.updatedAt === "string" &&
    Number.isFinite(Date.parse(value.updatedAt)) &&
    isTaxon(value.category) &&
    Array.isArray(value.tags) &&
    value.tags.every(isTaxon) &&
    Array.isArray(value.headings) &&
    value.headings.every(isHeading) &&
    Array.isArray(value.keywords) &&
    value.keywords.every((keyword) => typeof keyword === "string")
  );
}

export function validateSearchIndexEntries(
  envelope: SearchIndexEnvelope,
): readonly SearchIndexEntry[] {
  if (!envelope.entries.every(isSearchIndexEntry)) {
    throw new SearchIndexValidationError("Search index entry shape is invalid");
  }

  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const entry of envelope.entries) {
    if (ids.has(entry.id) || paths.has(entry.path)) {
      throw new SearchIndexValidationError("Search index entries are duplicated");
    }
    ids.add(entry.id);
    paths.add(entry.path);
  }
  return envelope.entries;
}
