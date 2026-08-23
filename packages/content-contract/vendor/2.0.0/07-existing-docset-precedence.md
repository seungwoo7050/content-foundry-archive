# 07. Existing Documentation Set Precedence

## 1. Can the previously generated 01, 02, and 03 sets remain unchanged?

Yes for the frozen `v1.0.0` baseline, with one explicit interpretation rule: this shared contract package is normative for the ContentOps ↔ Public Sites boundary.

No existing file needs to be rewritten before implementation merely because this package was added.

## 2. Set 01 — ContentOps

The existing `01-contentops` set remains valid for:

- Django architecture and application boundaries;
- internal data model and workflow state machine;
- evidence, LLM workbench, QA, review, versioning, analytics, economics;
- publisher/export adapters;
- jobs, security, tests, deployment, implementation roadmap.

Where `01-contentops` describes the static-public-site release bundle or public-site handoff, interpret that description as a summary of this package. If wording later diverges, this package wins.

## 3. Set 02 — Public Sites

The existing `02-public-sites` set remains valid for:

- Next.js architecture and static export;
- multisite structure;
- routing/view models and rendering;
- SEO, advertising, analytics, media consumption;
- five themes and skin architecture;
- Site A information architecture and launch configuration;
- tests, deployment, and site expansion.

`02-public-sites/03-contentops-publication-contract.md` becomes a descriptive local summary of the shared contract, not an independently editable source of truth. The shared package controls conflicts and future version changes.

## 4. Set 03 — Platform / Operations

The existing Korean `03-platform` set can remain unchanged. It is an operational guide rather than the machine/data integration authority.

Its WordPress, Blogger, Naver, Tistory, AdSense, DNS/CDN, analytics, backup, and daily-operation procedures remain applicable.

When operational steps refer to release IDs, site IDs, publication states, or ContentOps ↔ Public Sites handoff semantics, this shared package defines the exact meaning.

## 5. Required developer read set

Before parallel implementation:

```text
ContentOps developer:
  contract/*
  01-contentops/*
  relevant 03-platform operational docs as needed

Public Sites developer:
  contract/*
  02-public-sites/*
  relevant 03-platform deployment/advertising docs as needed
```

Neither developer needs to learn the other project's internal framework implementation.

## 6. Future maintenance rule

Do not maintain two normative copies of the shared contract.

Future contract changes happen here first. Project-specific documents may be refreshed later for readability, but they must not redefine incompatible boundary semantics.
