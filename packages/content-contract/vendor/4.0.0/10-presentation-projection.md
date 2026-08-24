# 10. Presentation Projection

## 1. Purpose and boundary

Contract `4.0.0` adds one required, checksummed `presentation.json` record. It
transports explicit public editorial placements and optional brand-media
references without exposing internal scores or allowing consumers to invent
ranking, verification, expiration, or provider policy.

The record is public data, not theme implementation. Themes may vary layout but
must preserve the selected groups, source order, labels, and factual meaning.

Normative schema: `schemas/presentation.schema.json`.

## 2. Record shape

```json
{
  "home": {
    "featuredArticleIds": [],
    "currentArticleIds": [],
    "evergreenArticleIds": []
  },
  "categoryHighlights": [
    {"categoryId": "daily-admin", "articleIds": []}
  ],
  "brand": {
    "logoMediaId": null,
    "faviconMediaId": null,
    "socialImageMediaId": null
  }
}
```

The object and its three child objects are closed shapes. Every listed ID is a
public reference into the same immutable release.

## 3. Home placements

- `featuredArticleIds` contains at most three IDs.
- `currentArticleIds` contains at most six IDs.
- `evergreenArticleIds` contains at most eight IDs.
- Each array is unique and preserves producer editorial source order.
- An article cannot occur in more than one home array.
- Every ID resolves to a published article in the same release.

`current` means only that the producer explicitly selected the article for the
current-information surface. A consumer may display its `updatedAt` date. It
must not call the selection verified, still valid, unexpired, official, popular,
trending, or automatically ranked.

Unselected articles remain ordinary published content. A consumer may derive a
factual latest-updated list, excluding articles already placed in a home group,
without changing or supplementing the editorial classifications.

## 4. Category highlights

Each `categoryHighlights` entry contains one category ID and at most three
unique article IDs in producer editorial source order.

- each category ID occurs in at most one entry and resolves through
  `taxonomy.json`;
- each article ID resolves in the same release;
- each selected article's `categoryId` equals the entry's `categoryId`.

An article may appear in one home group and in the highlight for its own
category. A category highlight does not assert popularity, ranking, official
status, or verification.

## 5. Brand media

`logoMediaId`, `faviconMediaId`, and `socialImageMediaId` are independently
nullable. Every non-null ID resolves through `media/media-manifest.json` and
retains the selected media record's integrity, accessibility, attribution, and
license obligations.

A null logo uses the public text brand from `site.json` as a complete fallback.
Consumers must not invent a logo or substitute unrelated fixture, provider, or
site media for any null field.

## 6. Revision and readiness

Changing `presentation.json` changes public build output. It requires a new
immutable release and increments `siteConfigRevision`; a simultaneous
publishable document change also follows the existing `contentRevision` rule.

Shape validity is independent of deployment readiness. The build environment,
not a producer-controlled presentation field, supplies the release mode.

A production candidate requires:

- at least one featured or current article;
- at least one evergreen article;
- one non-empty highlight for every category exposed by `taxonomy.json`;
- non-null favicon and social-image references.

The logo remains optional because the text brand is a complete fallback.

Template, QA, and preview releases may contain empty placement arrays and null
brand references. Every article and page in those releases must have
`seo.index` false, and consumers must emit a site-wide `noindex` result. They
cannot satisfy production readiness or supply real content, legal, origin,
brand, or provider approval.

## 7. Validation and failures

Validation follows the integrity-first order in
[`08-bundle-integrity.md`](08-bundle-integrity.md).

- closed shape, cardinality, within-list uniqueness, cross-home duplication,
  duplicate category selection, QA indexability, and production readiness fail
  with `CONTRACT_INVALID`;
- unresolved article, category, or non-null brand-media references and category
  membership mismatches fail with `REFERENCE_INVALID`;
- missing, unlisted, or mismatched `presentation.json` bytes fail with
  `INTEGRITY_FAILED` before schema or reference validation.

## 8. Fixture mutation recipes

Descriptors under `fixtures/bundles/invalid/` apply to the neighboring complete
bundle. `integrityMode: recompute` regenerates changed payload hashes, sorted
`checksums.txt`, and the RFC 8785 bundle checksum. `integrityMode: preserve`
keeps valid unmodified integrity records. External `validationContext` is not
transported or checksummed.

Home operations:

- `append-featured-article-to-current` appends `ART-000123` to
  `/home/currentArticleIds/-`; the duplicate first fails `CONTRACT_INVALID`.
- `replace-featured-article-with-missing-value` replaces
  `/home/featuredArticleIds/0` with `ART-MISSING`; the missing reference first
  fails `REFERENCE_INVALID`.

Category operations:

- `append-duplicate-category-highlight` appends
  `{"categoryId":"daily-admin","articleIds":[]}` to `/categoryHighlights/-`;
  the duplicate first fails `CONTRACT_INVALID`.
- `replace-highlight-category-with-missing-value` sets
  `/categoryHighlights/0/categoryId` to `missing-category` and first fails
  `REFERENCE_INVALID`.
- `replace-highlight-article-with-missing-value` sets
  `/categoryHighlights/0/articleIds/0` to `ART-MISSING` and first fails
  `REFERENCE_INVALID`.
- `retarget-highlight-to-other-existing-category` first appends
  `{"id":"digital","slug":"digital","label":"디지털","description":"디지털 서비스 안내"}`
  to `/categories/-` in `taxonomy.json`, then sets
  `/categoryHighlights/0/categoryId` to `digital`. All IDs resolve, but the
  article still belongs to `daily-admin`, so it first fails
  `REFERENCE_INVALID`.

Brand operations independently replace `/brand/logoMediaId`,
`/brand/faviconMediaId`, or `/brand/socialImageMediaId` with
`MED-MISSING-LOGO`, `MED-MISSING-FAVICON`, or `MED-MISSING-SOCIAL` through:

- `replace-null-logo-with-missing-media`;
- `replace-null-favicon-with-missing-media`;
- `replace-null-social-image-with-missing-media`.

Each mutation remains schema-valid and first fails `REFERENCE_INVALID`.

Readiness operations:

- `set-qa-article-index-true` sets `/seo/index` in
  `articles/ART-000123.json` to `true` with external release mode `qa`; it first
  fails `CONTRACT_INVALID`.
- `validate-qa-bundle-as-production` changes no transported bytes and evaluates
  the complete fixture with external release mode `production`; its missing
  evergreen and approved brand selections first fail `CONTRACT_INVALID`.

These recipes are test evidence only. They do not authorize filling deferred
editorial, legal, origin, brand, or provider values.
