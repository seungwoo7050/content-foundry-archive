# Shared Contract Pack

> Contract baseline: `3.0.0`
> Frozen: `2026-08-24`
> Language: English  
> Consumers: `01-contentops` and `02-public-sites`

## Purpose

This package is the normative boundary between ContentOps and Public Sites. The two systems are developed, tested, and deployed independently. They must not depend on each other's internal database schema, framework structure, or private runtime state.

The only required cross-system knowledge is the shared contract defined here: release bundles, site configuration, article/publication data, media references, publication lifecycle semantics, version compatibility, and validation behavior.

## Read order

Both development tracks must read these files before implementation:

1. `01-publication-contract.md`
2. `02-site-configuration-contract.md`
3. `03-media-asset-contract.md`
4. `04-publication-lifecycle-contract.md`
5. `05-error-versioning-compatibility-contract.md`
6. `06-validation-and-fixtures.md`
7. `07-existing-docset-precedence.md`
8. `08-bundle-integrity.md`
9. `09-structured-content-blocks.md`

Machine-readable schemas and fixtures under `schemas/` and `fixtures/` are part of the contract.

## Normative rule

When this package conflicts with descriptive text in `01-contentops`, `02-public-sites`, or `03-platform`, this package wins for the ContentOps ↔ Public Sites integration boundary.

The existing documentation sets remain authoritative for their own internal design and operations unless this package explicitly defines the same cross-system contract.

## Non-goals

This package does not define:

- Django model layout or application boundaries;
- Next.js component, route-file, or theme implementation details;
- WordPress or Blogger REST payloads;
- Naver or Tistory manual package presentation details;
- LLM workbench internal result contracts;
- analytics vendor credentials;
- secrets or deployment-provider-specific credentials.

## Contract version

`contractVersion` uses semantic versioning.

- Patch: clarification or validation change that does not change accepted valid payloads.
- Minor: backward-compatible additive optional fields or enum values with documented fallback behavior.
- Major: required-field, type, identifier, or semantic changes that require coordinated consumer changes.

`3.0.0` adds the closed gallery, code, command, action-link, and niche-component
block families with their static fallback, reference, and security rules. The
frozen `2.0.0` baseline remains available in Git history for immutable rollback
releases. Contract promotion does not by itself declare producer or consumer
implementation support.
