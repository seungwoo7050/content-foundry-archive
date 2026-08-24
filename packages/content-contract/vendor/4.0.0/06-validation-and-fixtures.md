# 06. Validation and Fixtures

## 1. Validation layers

Both systems must validate the shared boundary independently.

ContentOps validates before producing a release. Public Sites validates again before rendering.

Validation layers:

1. JSON/schema shape validation;
2. identifier and reference validation;
3. semantic invariants;
4. checksum/media integrity;
5. route/canonical/redirect invariants;
6. build-level rendering validation.

This list defines required validation coverage, not bundle processing order.
For transported bundles, the version and integrity-first order in
[`08-bundle-integrity.md`](08-bundle-integrity.md) is normative.

## 2. Contract tests

ContentOps must prove that its exporter can produce the valid fixtures' logical shape and rejects known-invalid internal data before release creation.

Public Sites must prove that:

- valid fixtures build or pass the contract parser;
- invalid fixtures fail for the intended reason;
- contract-version rejection happens before rendering;
- theme choice does not change the public content semantics represented by the contract.

## 3. Shared fixtures

`fixtures/valid/` contains the minimal valid baseline:

- `release.json`
- `site.json`
- `article.json`
- `media-manifest.json`
- `content.json`
- `navigation.json`
- `taxonomy.json`
- `page-about.json`
- `redirects.json`
- `presentation-template.json`
- `presentation-populated.json`

`fixtures/bundles/valid/site-a-minimal/` is the complete cross-record and
integrity fixture. `fixtures/bundles/invalid/` contains documented mutations
that must fail without duplicating the full immutable bundle.

`fixtures/invalid/` contains intentionally invalid schema and semantic examples
used to prove validation behavior. They are never production data.

Contract `3.0.0` adds these focused structured-content fixtures:

- gallery: `fixtures/valid/gallery-block.json` and
  `fixtures/invalid/gallery-single-item.json`;
- code and command: `fixtures/valid/code-block.json`,
  `fixtures/valid/command-block.json`, and
  `fixtures/invalid/command-execution-request.json`;
- action link: `fixtures/valid/action-link-internal.json`,
  `fixtures/valid/action-link-official.json`, and
  `fixtures/invalid/action-link-unsafe-scheme.json`;
- niche component: `fixtures/valid/niche-component-block.json` and
  `fixtures/invalid/niche-component-backend-request.json`.

`fixtures/valid/content.json`, `fixtures/valid/article.json`, and
`fixtures/valid/page-about.json` prove aggregate adoption.
`fixtures/valid/release.json` and
`fixtures/invalid/release-unsupported-version.json` prove the major-version
boundary.

Contract `4.0.0` adds the required presentation schema, populated and
template/QA valid fixtures, focused cardinality fixtures, and complete-bundle
home, category, brand-media, noindex, and production-readiness mutations.
Presentation semantics and exact mutation recipes are defined in
[`10-presentation-projection.md`](10-presentation-projection.md).

## 4. Invalid bundle mutation convention

Descriptors under `fixtures/bundles/invalid/` apply to the neighboring
`fixtures/bundles/valid/site-a-minimal/` bundle. Each `operation` name is an
exact scenario recipe documented in this section, not a general patch language.
Single-record operations use `overlayPath`. Multi-record operations use the
ordered `overlayPaths` array and apply their changes in that listed order.

`integrityMode: preserve` leaves the payload checksum and
`release.json.bundleChecksum` unchanged after the mutation.
`integrityMode: recompute` regenerates the changed payload checksum, sorted
`checksums.txt`, and RFC 8785 bundle checksum so that later validation layers
can be reached. `expectedError` names the first failure after applying the
declared integrity mode.

`replace-title-with-tampered-value` replaces JSON Pointer `/title` in the
descriptor's `overlayPath` with the string `변조된 제목`. Its `preserve` mode
proves that payload tampering fails integrity validation before schema or
reference validation, with first failure `INTEGRITY_FAILED`.

`replace-second-gallery-media-id-with-missing-value` replaces JSON Pointer
`/content/2/items/1/mediaId` in the descriptor's `overlayPath` with the string
`MED-MISSING`. After recomputing integrity, the bundle remains schema-valid but
the gallery media ID does not resolve in the media manifest, so its first
failure is `REFERENCE_INVALID`.

`replace-first-gallery-media-alt-with-whitespace` replaces JSON Pointer
`/items/0/alt` in the descriptor's `overlayPath` with exactly three ASCII space
characters (`U+0020 U+0020 U+0020`). After recomputing integrity, the bundle
remains schema-valid but violates the non-whitespace alt-text invariant for an
informative gallery image, so its first failure is `CONTRACT_INVALID`.

`replace-internal-action-path-with-missing-route` replaces JSON Pointer
`/content/3/path` in the descriptor's `overlayPath` with the string
`/missing-route`. After recomputing integrity, the bundle remains schema-valid
but no generated, non-gone direct route resolves that destination, so its first
failure is `REFERENCE_INVALID`.

`point-internal-action-at-redirect-source` uses the first `overlayPaths` entry
to replace JSON Pointer `/content/3/path` with `/old-about`, then replaces JSON
Pointer `/items` in the second entry with exactly one route disposition:
`{"type":"redirect","fromPath":"/old-about","toPath":"/about","status":308}`.

`point-internal-action-at-gone-route` uses the first `overlayPaths` entry to
replace JSON Pointer `/content/3/path` with `/expired-about`, then replaces JSON
Pointer `/items` in the second entry with exactly one route disposition:
`{"type":"gone","path":"/expired-about","status":410,"replacementPath":null}`.

After recomputing integrity, both bundles remain schema-valid and satisfy route
disposition invariants. In each case the action target is not a direct
generated, non-gone route, so its first failure is `REFERENCE_INVALID`.

`validationContext` is test-only external source-controlled context. It is never
transported in the release bundle or included in `checksums.txt` or the bundle
checksum. Producer policy and consumer registry validation each check the exact
`(siteId, componentId)` pair independently.

`append-producer-disabled-niche-component` and
`append-wrong-site-registered-niche-component` both append the complete JSON
value from `fixtures/valid/niche-component-block.json` at JSON Pointer
`/content/-` in the descriptor's `overlayPath`. The appended block has
`componentId` `date-gap-calculator`, label `두 날짜 사이 일수 계산기`, and
fallback text `시작일과 종료일을 달력에 표시하고, 본문이 정한 포함 기준에 따라 날짜
수를 세세요.\n공식 마감일은 본문과 연결된 안내에서 다시 확인하세요.`.

After recomputing integrity, both bundles remain schema-valid. The
producer-disabled case fails because producer policy does not enable
`(site-a, date-gap-calculator)`. The wrong-site case fails because a registry
entry for `(site-b, date-gap-calculator)` does not register
`(site-a, date-gap-calculator)`. Each case first fails with
`REFERENCE_INVALID`.

`replace-internal-action-with-same-origin-official-link` replaces JSON Pointer
`/content/3` in the descriptor's `overlayPath` with this exact value:

```json
{"type":"action-link","kind":"official","label":"운영자 소개를 사이트에서 읽기","url":"https://example.com/about"}
```

`replace-internal-action-with-credentialed-official-link` replaces JSON Pointer
`/content/3` in the descriptor's `overlayPath` with this exact value:

```json
{"type":"action-link","kind":"official","label":"공식 신청 안내 읽기","url":"https://reader:placeholder@official.example/guide"}
```

After recomputing integrity, both bundles remain strict-schema-valid and both
URLs remain HTTPS URIs. The first URL has the same origin as `site.json.origin`
and therefore must use an `internal` action. The second has non-empty URL
username and password components. Each case first fails with `CONTRACT_INVALID`.

## 5. Change rule

Whenever the contract changes:

- update the Markdown definition;
- update affected JSON Schema files;
- update or add fixtures;
- update `CHANGELOG.md`;
- run schema validation on fixtures;
- record whether the change is patch/minor/major.

## 6. Integration smoke case

The minimum cross-project smoke case is:

```text
ContentOps fixture/export
  -> immutable release bundle
  -> Public Sites contract validation
  -> static build
  -> expected article route
  -> release identity/checksum verification
```

The smoke case does not require ContentOps and Public Sites to run in one process or repository.

## 7. Commit-size rule for contract work

Shared contract changes follow the same small-commit principle as implementation work.

Prefer one review question per commit. A schema, its minimal fixture changes, and the exact contract text required to describe that schema change may remain together because they are one public-contract responsibility and must be reverted together.
