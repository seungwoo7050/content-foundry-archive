# 01. Publication Contract

## 1. Responsibility boundary

ContentOps owns editorial state, review history, source/evidence records, LLM artifacts, economics, and publication decisions.

Public Sites owns deterministic validation and rendering of an approved release bundle into a deployable site artifact.

Public Sites must never read the ContentOps database directly. ContentOps must never depend on Public Sites' internal component or route-file layout.

The handoff is an immutable release bundle.

## 2. Release bundle

Canonical layout:

```text
release.json
site.json
navigation.json
taxonomy.json
presentation.json
articles/
  <article-id>.json
pages/
  <page-id>.json
media/
  media-manifest.json
redirects.json
checksums.txt
```

A deployment may transport the bundle as a directory, ZIP, object-storage prefix, or equivalent immutable artifact. Transport must not change the logical contents or checksums. `08-bundle-integrity.md` defines the normative file and bundle checksum algorithm.

## 3. Release manifest

Required fields:

```json
{
  "contractVersion": "4.0.0",
  "releaseId": "REL-2026-000044",
  "siteId": "site-a",
  "createdAt": "2026-08-25T03:00:00Z",
  "contentRevision": 44,
  "siteConfigRevision": 8,
  "articleCount": 1,
  "pageCount": 1,
  "defaultTheme": "minimal-knowledge-base",
  "defaultSkin": "calm-blue",
  "bundleChecksum": "sha256:b4b05f24b333618344362580bc96991876394f50da4f5532291467f60954d1c4"
}
```

Rules:

- `releaseId` is immutable and globally unique within ContentOps.
- `siteId` is stable for the lifetime of a logical public site.
- `contentRevision` increases when publishable content changes.
- `siteConfigRevision` increases when public configuration affecting build output changes.
- `bundleChecksum` identifies the complete logical bundle by the exact
  release-canonicalization and `checksums.txt` algorithm in
  [`08-bundle-integrity.md`](08-bundle-integrity.md); that algorithm replaces
  this field with its defined zero digest in memory to avoid self-reference.
- a retry of the same logical release reuses `releaseId`; a changed bundle requires a new release.

## 4. Article contract

A published article is a public projection, not the internal ContentOps Article model.

Minimum shape:

```json
{
  "id": "ART-000123",
  "revision": 9,
  "slug": "government24-resident-registration-guide",
  "title": "...",
  "summary": "...",
  "status": "published",
  "categoryId": "life-admin",
  "tagIds": ["government24", "documents"],
  "author": {
    "displayName": "생활메모",
    "profileId": "owner"
  },
  "publishedAt": "2026-08-20T01:00:00Z",
  "updatedAt": "2026-08-22T03:00:00Z",
  "content": [
    {"type": "heading", "id": "prepare", "level": 2, "text": "..."},
    {"type": "paragraph", "markdown": "..."}
  ],
  "toc": [],
  "faq": [],
  "sourceDisclosures": [],
  "relatedArticleIds": [],
  "heroMediaId": null,
  "seo": {
    "title": "...",
    "description": "...",
    "canonicalPath": "/article/government24-resident-registration-guide",
    "index": true,
    "follow": true
  },
  "advertising": {
    "enabled": true
  },
  "updateTriggers": []
}
```

The normative machine-readable shapes are:

- `schemas/content-block.schema.json` and `schemas/content.schema.json`;
- `schemas/gallery-block.schema.json`, `schemas/code-command-block.schema.json`,
  `schemas/action-link-block.schema.json`, and
  `schemas/niche-component-block.schema.json`;
- `schemas/article.schema.json` and `schemas/page.schema.json`;
- `schemas/navigation.schema.json` and `schemas/taxonomy.schema.json`;
- `schemas/redirects.schema.json`;
- `schemas/release.schema.json`, `schemas/site.schema.json`, and
  `schemas/media-manifest.schema.json`;
- `schemas/presentation.schema.json`.

## 5. Public-only projection

The release bundle must not contain:

- raw LLM prompts or responses;
- operator identities or internal reviewer comments;
- unpublished evidence excerpts that are not intended for public display;
- credentials, tokens, private object-store URLs, or secrets;
- internal scoring weights or economics;
- rejected revisions;
- private source annotations;
- internal task IDs except stable public-safe trace identifiers explicitly defined by this contract.

## 6. Content blocks

Contract `3.0.0` introduced the closed 13-discriminator block vocabulary that
`4.0.0` carries forward unchanged:

- `heading`
- `paragraph`
- `list`
- `quote`
- `callout`
- `image`
- `table`
- `embed`
- `gallery`
- `code`
- `command`
- `action-link`
- `niche-component`

The five v3 block families and their static, reference, and security semantics
are defined in
[`09-structured-content-blocks.md`](09-structured-content-blocks.md). Consumers
must reject unknown block types. Because this discriminator union is closed,
adding any block discriminator requires a major version. Minor additions are
limited to fields or metadata whose ignorable fallback is explicitly defined;
they cannot add union branches.

Markdown fields are content, not executable HTML. Producer-supplied raw HTML is
not accepted as renderable article markup. Literal markup may appear only as an
escaped, inert value in a field such as the v3 `code` block's `code` value.

## 7. Reference integrity

Before build:

- every article ID is unique;
- every slug is unique within its route namespace;
- `categoryId` and every `tagId` exist;
- every `relatedArticleId` resolves to a publishable article in the same site release unless an external relation is explicitly represented as a URL;
- every image and gallery media ID resolves through `media-manifest.json`, and
  every informative gallery image has non-whitespace alt text;
- every internal action resolves directly to a generated, non-gone route;
- external actions use credential-free HTTPS URLs and do not duplicate the
  site's own origin;
- every niche component is enabled by producer policy and registered for the
  same exact `(siteId, componentId)` pair by the consumer;
- every presentation article, category, and non-null brand-media reference
  resolves and satisfies the membership rules in
  [`10-presentation-projection.md`](10-presentation-projection.md);
- `updatedAt >= publishedAt`;
- an article canonical path equals `/article/<slug>` and a static page canonical equals its `path`;
- canonical paths are internal to the release's `siteId` unless an explicit syndication rule exists;
- `index=true` is forbidden for template, QA, or preview releases.

## 8. Build result report

Public Sites returns a build/deploy report to ContentOps after consuming a release:

```json
{
  "releaseId": "REL-2026-000044",
  "siteId": "site-a",
  "contractVersion": "4.0.0",
  "bundleChecksum": "sha256:b4b05f24b333618344362580bc96991876394f50da4f5532291467f60954d1c4",
  "buildId": "BUILD-...",
  "deployId": "DEPLOY-...",
  "status": "succeeded",
  "routeCount": 5,
  "deployedAt": "2026-08-25T03:08:00Z",
  "origin": "https://example.com"
}
```

A ContentOps publication is not considered successfully deployed until the expected build report and production verification succeed.
