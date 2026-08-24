import type { SearchIndexEntry } from "./search-index-entry";
import {
  createLexicalSearchQuery,
  scoreSearchEntry,
} from "./search-score";

export const MAX_SEARCH_RESULTS = 20;

export interface SearchResult {
  readonly entry: SearchIndexEntry;
  readonly score: number;
}

function compareResults(left: SearchResult, right: SearchResult): number {
  if (left.score !== right.score) return right.score - left.score;
  const updatedDifference =
    Date.parse(right.entry.updatedAt) - Date.parse(left.entry.updatedAt);
  if (updatedDifference !== 0) return updatedDifference;
  if (left.entry.path < right.entry.path) return -1;
  if (left.entry.path > right.entry.path) return 1;
  return 0;
}

export function searchIndexEntries(
  entries: readonly SearchIndexEntry[],
  rawQuery: string,
  locale: string,
): SearchResult[] {
  const query = createLexicalSearchQuery(rawQuery, locale);
  return entries
    .flatMap((entry) => {
      const score = scoreSearchEntry(entry, query, locale);
      return score === null ? [] : [{ entry, score }];
    })
    .sort(compareResults)
    .slice(0, MAX_SEARCH_RESULTS);
}
