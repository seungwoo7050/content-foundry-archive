export const MAX_SEARCH_QUERY_CODE_POINTS = 120;
export const MAX_SEARCH_QUERY_TOKENS = 12;

export function normalizeSearchText(value: string, locale: string): string {
  return value.normalize("NFKC").toLocaleLowerCase(locale).replace(/\s+/gu, " ").trim();
}

export function tokenizeSearchQuery(value: string, locale: string): string[] {
  const boundedValue = [...value]
    .slice(0, MAX_SEARCH_QUERY_CODE_POINTS)
    .join("");
  const tokens = normalizeSearchText(boundedValue, locale)
    .split(/[\p{White_Space}\p{Punctuation}\p{Symbol}]+/u)
    .filter(Boolean);

  return [...new Set(tokens)].slice(0, MAX_SEARCH_QUERY_TOKENS);
}
