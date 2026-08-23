import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocuments } from "./read-bundle-documents.js";

interface PublicKey {
  readonly path: string;
  readonly value: string;
}

function addDuplicates(
  issues: ContractIssue[],
  entries: readonly PublicKey[],
  label: string,
) {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const firstPath = seen.get(entry.value);
    if (firstPath) {
      issues.push({
        path: entry.path,
        message: `duplicate ${label} ${entry.value}; first declared at ${firstPath}`,
      });
    } else {
      seen.set(entry.value, entry.path);
    }
  }
}

function keys<T>(
  items: readonly T[],
  base: string,
  key: keyof T,
): readonly PublicKey[] {
  return items.map((item, index) => ({
    path: `${base}/${index}/${String(key)}`,
    value: String(item[key]),
  }));
}

export function validatePublicKeys(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];
  const collections = [
    [keys(bundle.articles, "/articles", "id"), "article ID"],
    [keys(bundle.articles, "/articles", "slug"), "article slug"],
    [keys(bundle.pages, "/pages", "id"), "page ID"],
    [keys(bundle.pages, "/pages", "path"), "page path"],
    [keys(bundle.taxonomy.categories, "/taxonomy/categories", "id"), "category ID"],
    [keys(bundle.taxonomy.categories, "/taxonomy/categories", "slug"), "category slug"],
    [keys(bundle.taxonomy.tags, "/taxonomy/tags", "id"), "tag ID"],
    [keys(bundle.taxonomy.tags, "/taxonomy/tags", "slug"), "tag slug"],
    [keys(bundle.mediaManifest.items, "/media/items", "id"), "media ID"],
  ] as const;

  for (const [entries, label] of collections) {
    addDuplicates(issues, entries, label);
  }

  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Public keys are not unique", issues);
  }
  return bundle;
}
