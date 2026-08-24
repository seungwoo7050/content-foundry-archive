import {
  createReleaseIdentity,
  type ReleaseIdentity,
  type ReleaseIdentitySource,
} from "./release-identity";
import {
  createSearchIndexEntry,
  type SearchIndexArticleRecord,
  type SearchIndexEntry,
  type SearchIndexTaxonomy,
} from "./search-index-entry";

export interface SearchIndexArtifactSource extends ReleaseIdentitySource {
  readonly site: { readonly locale: string };
  readonly articles: readonly SearchIndexArticleRecord[];
  readonly taxonomy: SearchIndexTaxonomy;
}

export interface SearchIndexArtifact {
  readonly schemaVersion: "1.0.0";
  readonly release: ReleaseIdentity;
  readonly locale: string;
  readonly entries: readonly SearchIndexEntry[];
}

function compareEntryPath(left: SearchIndexEntry, right: SearchIndexEntry) {
  if (left.path < right.path) return -1;
  if (left.path > right.path) return 1;
  return 0;
}

export function createSearchIndexArtifact(
  bundle: SearchIndexArtifactSource,
): SearchIndexArtifact {
  const entries = bundle.articles
    .flatMap((article, index) =>
      article.seo.index
        ? [createSearchIndexEntry(article, index, bundle.taxonomy, bundle.site.locale)]
        : [],
    )
    .sort(compareEntryPath);

  return {
    schemaVersion: "1.0.0",
    release: createReleaseIdentity(bundle),
    locale: bundle.site.locale,
    entries,
  };
}
