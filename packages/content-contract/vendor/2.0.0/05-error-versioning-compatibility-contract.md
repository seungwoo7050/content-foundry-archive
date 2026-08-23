# 05. Error, Versioning, and Compatibility Contract

## 1. Error classes

Cross-system failures use these classes conceptually even if transport-specific codes differ:

- `CONTRACT_UNSUPPORTED`: consumer does not support `contractVersion`;
- `CONTRACT_INVALID`: payload violates schema or semantic invariants;
- `REFERENCE_INVALID`: ID/slug/media/taxonomy reference does not resolve;
- `INTEGRITY_FAILED`: checksum or immutable-asset verification failed;
- `BUILD_FAILED`: public-site build failed after contract acceptance;
- `DEPLOY_FAILED`: build succeeded but deployment/promotion failed;
- `VERIFY_FAILED`: deployed output does not match the expected release;
- `CONFLICT`: a concurrent or newer logical release makes the requested operation stale;
- `TEMPORARY`: retryable external/infrastructure failure;
- `PERMANENT`: non-retryable failure until inputs/configuration change.

Errors returned across the boundary must include a stable code, human-readable message, release/site identifiers when known, and retryability.

## 2. Contract semantic versioning

The version is `MAJOR.MINOR.PATCH`.

### Patch

Examples:

- clarify wording;
- tighten an already-required validation without changing the accepted valid set;
- add examples or fixtures.

### Minor

Allowed only when an older consumer can safely process the payload.

Examples:

- new optional field with a default/fallback;
- new optional top-level record ignored by old consumers;
- new enum value only when fallback semantics are explicitly defined.

### Major

Required for:

- new required field;
- type change;
- identifier semantics change;
- field removal;
- changed meaning of publish/update/delete;
- block type that older consumers cannot safely ignore;
- changed route/canonical semantics.

## 3. Consumer declarations

Public Sites declares its supported contract range in source control and build metadata. ContentOps must not send a release outside that range.

A build must fail early on an unsupported major version rather than partially rendering content.

## 4. Forward and backward compatibility

- Producers must not depend on consumers silently accepting unknown required fields.
- Consumers may ignore unknown optional metadata only where the contract explicitly marks it ignorable.
- Removed or renamed fields require a major version.
- Old immutable release bundles remain valid rollback inputs while a deployed build supports their version.

## 5. Contract changes during parallel development

A shared contract change is planned as its own commit atom before implementation changes in either project.

Recommended order:

```text
1. contract: change shared contract/schema/fixtures
2. contentops: produce the new/compatible representation
3. public-sites: consume/validate the new representation
4. integration: prove the round trip if separate integration evidence is needed
```

Do not hide a public contract change inside a large ContentOps or Public Sites feature commit.

## 6. Rollback

A release rollback selects a previously verified immutable release whose contract version is supported by the deployed Public Sites build.

If application code and contract versions must roll back together, that dependency is recorded before promotion.
