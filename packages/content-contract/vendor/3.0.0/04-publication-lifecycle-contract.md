# 04. Publication Lifecycle Contract

## 1. Separation of editorial and deployment states

ContentOps has a richer internal editorial state machine. Public Sites does not need to know it.

The shared boundary exposes only release/deployment states.

## 2. Shared publication actions

The shared semantic actions are:

- `publish`: make a newly approved public revision available at its canonical URL;
- `update`: replace the public representation at the same logical URL with a newer approved revision;
- `unpublish`: remove public discoverability/serving while preserving the ability to restore;
- `delete`: remove the logical publication according to target policy; rollback retention may still preserve old immutable artifacts;
- `redirect`: preserve old URL behavior when slug/path changes or content is merged;
- `reconcile`: compare ContentOps' expected public state with observed deployed state.

## 3. Release states

A ContentOps-created public-site release may move through:

```text
prepared
  -> building
  -> preview_ready
  -> approved_for_promotion
  -> deploying
  -> deployed
  -> verified
```

Failure can occur from any active step:

```text
build_failed
deploy_failed
verification_failed
```

A failed release never silently becomes `verified` because a later unrelated deployment happened to succeed.

## 4. Success boundary

For Public Sites, publication success requires all of:

1. bundle validates against the supported contract version;
2. build succeeds;
3. expected preview/release checks succeed;
4. production deployment/promotion succeeds;
5. expected production origin serves the intended release identity/checksum;
6. critical route smoke checks succeed.

ContentOps records the returned build/deploy identity.

## 5. Idempotency

Every external publication/deployment operation initiated by ContentOps uses a stable idempotency key derived from the logical operation, not a random retry attempt.

A timeout is an unknown outcome. Retry logic first checks observed state when the target supports reconciliation.

## 6. Update behavior

An article update:

- increments the article public `revision`;
- normally preserves stable article `id` and canonical path;
- creates a new immutable release;
- does not mutate a previously archived release bundle.

A slug/path change must produce an explicit redirect entry unless the old URL is intentionally retired with a documented status.

## 7. Unpublish and delete

`unpublish` and `delete` are distinct semantics. Public Sites must not infer one from the other.

The release bundle expresses the desired route set plus redirects/tombstone policy. ContentOps keeps the authoritative operational audit trail.

## 8. Reconciliation

Reconciliation compares at least:

- expected `releaseId`;
- expected `bundleChecksum`;
- deployed `siteId`/origin;
- critical URL availability;
- known route count or route manifest where available.

Drift produces a warning or failure record; it is not overwritten silently.
