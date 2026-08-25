# Public Sites quality completion handoff

Date: 2026-08-25 KST

This checkpoint closes the provider-free Public Sites quality track. It is a non-operational QA release, not approval to deploy or substitute synthetic content, origins, branding, policy copy, or provider identifiers for real ones.

## Final local closure addendum

This addendum supersedes the pre-publication checkpoint values below while preserving that checkpoint as an audit record. Remote CI status belongs to the post-push report because recording it here would require another commit and another circular CI run.

- Archive remains clean and equal to `origin/main` at `a7e748a753ddd4d0751f5a4b84b27ec5c5a12b5e`.
- The final Public implementation checkpoint before this documentation atom is `1cec71d68d6fc8e6ec716f8fa6ca74a1d90598a5`.
- The fetched `public-sites` remote remained `0d61f1dd7d9096c28f519e9097ea039b71774bfb`; Public was clean, six commits ahead, and zero behind.
- The six closure atoms inline the 2,012 B render-blocking CSS, select the 16,550 B favicon derivative instead of the 188,872 B source, preserve Lighthouse failure evidence, exclude inline CSS from legacy visitor-marker checks, cap residual home latest discovery at six, and approve only the 14 affected home baselines.
- Home latest remains an updated-date fallback, not an invented editorial classification. The full corpus remains available through archive, category, search, and 12-item static pagination.

### Final local evidence

- Uncached workspace graph: 28/28 tasks, zero cached, 1,260 tests, with lint, TypeScript, generated checks, Contract build, and Next static build passing.
- Real v4/v3/v2 paired Next builds and the same static verifier passed. The standalone v2 consumer CLI reproduced checksum `sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27`.
- QA generation rebuilt all 15 provider-free variants at 40 route artifacts each.
- Browser matrix: 1,348 passed, 626 intentional project-scope skips, zero failed.
- Visual regression: 28/28 exact matches. The 14 article baselines remained byte-identical; the reviewed home heights changed from 7,974–9,940 px to 6,243–7,560 px on desktop and from 12,042–14,502 px to 8,876–10,716 px on mobile.
- Lighthouse inventory: 15 variants, 45 variant-route groups, three runs per group, 135 JSON reports, 135 HTML reports, 15 manifests, and 585 median assertions; every assertion passed.
- Worst three-run medians were Performance 0.98, Accessibility 1.00, Best Practices 1.00, FCP 839.27 ms, LCP 2,486.46 ms, CLS 0, TBT 13.5 ms, and Interactive 2,531.46 ms.
- Maximum median budgets were script 142,778 B, CSS 0 B after inlining, font 0 B, image 126,994 B, and third-party requests 0.

### Visual baseline reproduction

Generate fresh ignored QA inputs first:

```sh
fnm exec --using=24.19.0 -- pnpm quality:release
fnm exec --using=24.19.0 -- pnpm quality:sites
```

For each approved variant below, serve its static directory in one terminal and run the pinned Playwright comparison in another. Add `--update-snapshots` only after reviewing the product change; omit it for the required zero-diff confirmation.

```sh
QA_BASELINE_VARIANT=friendly-mobile-utility--calm-blue
fnm exec --using=24.19.0 -- pnpm exec serve "output/quality-release/sites/${QA_BASELINE_VARIANT}" --config serve.json --listen tcp://127.0.0.1:4174 --no-clipboard

QA_BASELINE_VARIANT=friendly-mobile-utility--calm-blue
QUALITY_BASE_URL=http://127.0.0.1:4174 QUALITY_VARIANT_ID="${QA_BASELINE_VARIANT}" fnm exec --using=24.19.0 -- pnpm exec playwright test apps/site-a/e2e/qa-visual.spec.ts --project=chromium-desktop --project=chromium-mobile --update-snapshots
```

Approved variants are `friendly-mobile-utility--calm-blue`, `friendly-mobile-utility--forest-green`, `friendly-mobile-utility--warm-neutral`, `editorial-utility--calm-blue`, `clean-personal-blog--calm-blue`, `information-portal--calm-blue`, and `minimal-knowledge-base--calm-blue`.

### Additional rules audit notes

- Current HEAD has no security or correctness blocker, but perfect atom independence is not claimed.
- `3ad5900` exposed a v2 verifier false positive repaired by `953f7eb`; reverting only the repair reintroduces that failure while inline CSS remains.
- `ed86691` and baseline atom `1cec71d` are deliberately split product/test responsibilities, but reverting only one makes visual expectations disagree with product output.
- The first-paint and home-height performance measurements are preserved across their paired implementation/evidence commits rather than entirely in each implementation body. No history was rewritten to conceal these exceptions.
- The baseline regeneration command, previously missing from the repository, is recorded above. The generated reports and sites remain ignored; only reviewed lossless WebP evidence is tracked.

## Immutable checkpoints

- Archive Contract 4 commit: `a7e748a753ddd4d0751f5a4b84b27ec5c5a12b5e`.
- Contract 4 bundle checksum: `sha256:b4b05f24b333618344362580bc96991876394f50da4f5532291467f60954d1c4`.
- Public implementation checkpoint before this handoff atom: `d0b2be80fcf82dac37e102034c3589c02da15022`.
- Public implementation tree: `fe93e40331304d44534f3489d9d3aea58c1ca8a0`.
- Public branch delta from the previous remote checkpoint: 201 commits; remote `public-sites` remained at `2b2d5982808435c9821b5eb8400aa5d3bb63fac0` during the final pre-handoff fetch.
- Archive was clean and equal to `origin/main`; Public was clean and 0 behind.

## Plan completion

1. Contract 4 publication is complete in Archive with immutable v2/v3 history.
2. Public exact-dispatch consumption for v4/v3/v2 is complete, including v4 presentation references/readiness and retained legacy fallbacks.
3. Common presentation work is complete: editorial home groups, correct date meaning, reading time, responsive intrinsic artwork, hero priority, search, current navigation, brand metadata, social metadata, and structured data.
4. Archive/category pagination is complete through view models, routes, metadata, collision claims, sitemap, and static verification.
5. The QA release, neutral assets, 15-variant generator, inert preview gallery, browser tooling, Lighthouse tooling, and deterministic CI are complete.
6. All five themes have completed shell, home, article, structured-content, responsive, print, and approved visual-baseline atoms.
7. Local closure gates are complete. Normal fast-forward publication and the first remote `macos-26` workflow run follow this handoff commit.

ContentOps was not changed. Its Contract 4 producer support remains a separate follow-up; its pre-existing local/remote state was not touched.

## QA release facts

- The corpus has five categories and 17 synthetic articles, including a 13-article category, short and long cases, tables, code, commands, gallery, FAQ, sources, updates, related content, CTA, policy paths, 404, and gone path.
- Exactly 15 theme-by-skin releases round-trip through the actual Contract 4 loader with reserved example origins, provider-off configuration, QA marks, and forced `noindex`.
- Each variant produced 40 route artifacts: 34 HTML documents including 404 plus six feed/metadata endpoints. The 15 sites contain 510 HTML documents.
- The preview gallery contains 15 inert cards and 15 loopback commands with update checks disabled; it has no links, scripts, frames, external resources, or runtime query theme override.
- Five QA-only WebP assets are abstract, text-free, person-free, and logo-free; provenance, licenses, dimensions, MIME checks, and checksums are tracked.
- Generated sites, reports, and runner scratch are ignored. Only 28 reviewed, lossless Chromium WebP baselines are tracked.

## Automated quality evidence

- Final uncached workspace gate at `d0b2be8`: 28/28 Turbo tasks, 0 cached, 1,259 tests, plus all typechecks, lints, generated checks, and builds passed.
- Standalone vendored v2 CLI validation passed for `REL-2026-000042`.
- The paired runner completed real v4, v3, and v2 Next.js builds and the same static verifier for each version.
- Browser matrix after the final visual fixes: 1,348 passed, 626 intentional skips, 0 failures across 15 variants.
- Covered Chromium desktop 1440x1000, mobile 390x844, reflow 320x800, JavaScript-off, Firefox desktop, and WebKit mobile, including Axe, keyboard flows, interactions, errors, local requests, favicon, and overflow checks.
- Visual coverage is five calm-blue themes at home/article desktop/mobile plus both remaining Friendly skins at the same four surfaces: 28/28 zero-diff.
- Full 15-variant Lighthouse matrix produced 135 reports. After the Portal and Knowledge Base density fixes, both affected calm-blue variants were rerun for 18 fresh reports.
- Three-run medians passed every budget: Performance at least 0.98, Accessibility 1.00, Best Practices 1.00, FCP at most 0.91 s, LCP at most 2.41 s, CLS 0, TBT at most 32 ms, and Interactive at most 2.84 s.
- Maximum measured transfer budgets were script 142,778 B, CSS 2,012 B, font 0 B, image 126,994 B, and third-party requests 0.

## Visitor-facing quality assessment

- Friendly Blog is approachable without becoming generic: strong search, distinct editorial groups, readable article opening, structured blocks, reader actions, mobile care, and print flow.
- Editorial Magazine has a deliberate masthead, media-led hierarchy, evidence and TOC rail, dense tables/quotes/sources, and credible editorial rhythm.
- Personal Column uses an author-led home, generous canvas, narrow reading measure, warm trust/summary blocks, and restrained reader actions.
- News Portal has the intended high-density header and current/category/latest hierarchy while single category panels now use the available width cleanly.
- Minimal Knowledge Base retains the strongest search/navigation and mature body system; across both density passes the desktop QA home fell from 13,404 px to 7,313 px (-45.4%) without crop, overflow, mobile regression, or print-flow regression.

The synthetic QA scope is visually polished enough to justify a WordPress replacement direction. It is not yet an operational WordPress replacement until approved content, identity, legal, origin, and provider inputs are added.

## DEVELOPMENT-RULES audit

No rewrite, rebase, reset, force-push, or merge was used. Post-audit closure atoms are single-responsibility and explicitly tested; the final addendum records the strict rollback/validation couplings that prevent a claim of perfect independence. Archive and Public changes are separated; ContentOps and external policies were not inferred.

Perfect historical compliance is not claimed. The original handoff section 8 remains the audit ledger for inherited published exceptions. Additional track exceptions preserved without rewrite are: `3294ceb` literal escaped newlines; `a9b6eed` coupled helper/reading-time repair; `5b5f7ad` incorrect body line count; `fa162e1` noisy/contradictory validation; `e47c30c` full test listing; `149ca03` stale deferred wording; `f6556ab` non-strict fix headings; `126f958` 141 additions without the required size rationale; and the first 23 new Public commits lacking every exact pre-plan field. Later atoms use the strict fields, staged-diff checks, secret scans, focused validation, and explicit rollback.

## Open gates

- Real content, domains, brand assets, legal copy, advertising, analytics, consent, comments, provider IDs/secrets, deployment, and DNS need approval.
- Actual Safari manual review, VoiceOver core flow, 200% zoom, and OS print preview remain manual acceptance evidence. Automated WebKit mobile, Axe, reduced motion, JavaScript-off, reflow, and print layout checks did pass.
- The first remote deterministic workflow run must pass after fast-forward push.
- On 2026-08-25 the date condition for checking Next.js 16.3.3 had not been reached. On or after 2026-08-26, verify official publication and, if released, perform the isolated dependency/security atom and rerun every final gate.
- Production readiness must not be reported until these gates close.
