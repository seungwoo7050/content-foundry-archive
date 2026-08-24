import type { SearchIndexEntry } from "./search-index-entry";
import { validateSearchIndexEntries } from "./search-index-consumer";
import {
  SearchIndexValidationError,
  validateSearchIndexEnvelope,
} from "./search-index-envelope";
import type { ReleaseIdentity } from "./release-identity";

type SearchIndexFetcher = (
  path: string,
  init: RequestInit,
) => Promise<Response>;

export async function loadSearchIndex(
  path: "/search-index.json",
  expectedRelease: ReleaseIdentity,
  expectedLocale: string,
  fetcher: SearchIndexFetcher = (input, init) => fetch(input, init),
): Promise<readonly SearchIndexEntry[]> {
  const response = await fetcher(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new SearchIndexValidationError("Search index request failed");
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new SearchIndexValidationError("Search index response is not JSON");
  }

  const value: unknown = await response.json();
  const envelope = validateSearchIndexEnvelope(
    value,
    expectedRelease,
    expectedLocale,
  );
  return validateSearchIndexEntries(envelope);
}
