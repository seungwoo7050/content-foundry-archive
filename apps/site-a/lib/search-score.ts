import type { SearchIndexEntry } from "./search-index-entry";
import { normalizeSearchText, tokenizeSearchQuery } from "./search-text";

export interface LexicalSearchQuery {
  readonly tokens: readonly string[];
  readonly phrase: string;
}

interface WeightedField {
  readonly value: string;
  readonly weight: number;
}

export function createLexicalSearchQuery(
  value: string,
  locale: string,
): LexicalSearchQuery {
  const tokens = tokenizeSearchQuery(value, locale);
  return { tokens, phrase: tokens.join(" ") };
}

function createWeightedFields(
  entry: SearchIndexEntry,
  locale: string,
): WeightedField[] {
  const normalize = (value: string) => normalizeSearchText(value, locale);
  return [
    { value: normalize(entry.title), weight: 32 },
    { value: normalize(entry.category.label), weight: 16 },
    { value: normalize(entry.category.slug), weight: 16 },
    ...entry.tags.flatMap(({ label, slug }) => [
      { value: normalize(label), weight: 12 },
      { value: normalize(slug), weight: 12 },
    ]),
    ...entry.headings.map(({ text }) => ({
      value: normalize(text),
      weight: 8,
    })),
    { value: normalize(entry.summary), weight: 4 },
    ...entry.keywords.map((keyword) => ({
      value: normalize(keyword),
      weight: 2,
    })),
  ];
}

export function scoreSearchEntry(
  entry: SearchIndexEntry,
  query: LexicalSearchQuery,
  locale: string,
): number | null {
  if (query.tokens.length === 0) return null;
  const fields = createWeightedFields(entry, locale);
  let score = 0;

  for (const token of query.tokens) {
    const tokenScore = Math.max(
      0,
      ...fields.map(({ value, weight }) => (value.includes(token) ? weight : 0)),
    );
    if (tokenScore === 0) return null;
    score += tokenScore;
  }

  const title = normalizeSearchText(entry.title, locale);
  const summary = normalizeSearchText(entry.summary, locale);
  if (title === query.phrase) score += 64;
  else if (title.startsWith(query.phrase)) score += 32;
  else if (title.includes(query.phrase)) score += 16;
  if (summary.includes(query.phrase)) score += 4;

  return score;
}
