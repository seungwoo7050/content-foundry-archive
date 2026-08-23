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

`fixtures/bundles/valid/site-a-minimal/` is the complete cross-record and
integrity fixture. `fixtures/bundles/invalid/` contains documented mutations
that must fail without duplicating the full immutable bundle.

`fixtures/invalid/` contains intentionally invalid schema and semantic examples
used to prove validation behavior. They are never production data.

## 4. Change rule

Whenever the contract changes:

- update the Markdown definition;
- update affected JSON Schema files;
- update or add fixtures;
- update `CHANGELOG.md`;
- run schema validation on fixtures;
- record whether the change is patch/minor/major.

## 5. Integration smoke case

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

## 6. Commit-size rule for contract work

Shared contract changes follow the same small-commit principle as implementation work.

Prefer one review question per commit. A schema, its minimal fixture changes, and the exact contract text required to describe that schema change may remain together because they are one public-contract responsibility and must be reverted together.
