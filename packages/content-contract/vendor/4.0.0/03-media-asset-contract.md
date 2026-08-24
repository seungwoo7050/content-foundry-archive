# 03. Media Asset Contract

## 1. Purpose

Media is referenced by stable media IDs. Article payloads do not depend on arbitrary live third-party image URLs.

Normative schema: `schemas/media-manifest.schema.json`.

## 2. Media manifest

Representative entry:

```json
{
  "id": "MED-000045",
  "kind": "image",
  "source": "bundle",
  "path": "media/MED-000045.webp",
  "sha256": "<64-hex>",
  "mimeType": "image/webp",
  "width": 1280,
  "height": 720,
  "bytes": 154220,
  "alt": "정부24 전입신고 화면",
  "credit": null,
  "license": null
}
```

## 3. Allowed sources

The media manifest allows:

- `bundle`: the binary is transported with the release or staged as part of the immutable release artifact;
- `immutable-object`: the manifest references an immutable content-addressed object key retrievable by the build environment.

A production build must not fetch arbitrary unversioned third-party article media at build time.

## 4. Integrity

Public Sites validates:

- referenced media exists;
- every non-null logo, favicon, and social-image reference in
  `presentation.json` exists;
- hash matches the manifest;
- MIME type matches the consumed file;
- image dimensions are positive;
- a required informative image has alt text containing at least one
  non-whitespace character;
- assets required by a page are available before deployment succeeds.

## 5. Licensing and attribution

When attribution or license text is required, it travels with the media record or a referenced public attribution record. ContentOps remains responsible for deciding whether an asset is publishable.

## 6. Transformations

Public Sites may generate optimized derivatives, but the source media ID remains stable. Generated derivatives are build artifacts, not new editorial media records.

A derivative cache key should include at least source hash plus transformation parameters.

## 7. Deletion

Removing an article does not imply immediate physical deletion of an immutable media object if that object is required for rollback. Retention is an operational policy outside the public rendering contract.
