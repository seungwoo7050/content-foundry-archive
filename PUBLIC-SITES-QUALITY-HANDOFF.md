# Public Sites quality completion handoff

Date: 2026-08-26 KST

This checkpoint closes the provider-free Public Sites quality track. It is a non-operational QA release, not approval to deploy or substitute synthetic content, origins, branding, policy copy, or provider identifiers for real ones.

## Final cleanup handoff

This documentation atom records the completed remote checkpoint and the disposable local-output cleanup that must run only after this atom's own remote workflow passes. It does not claim that cleanup has already happened or attempt to record its own SHA.

- The pre-handoff Public checkpoint is `e0cff8d00c2833794412a9e542ef543178321d49`; Archive remains `a7e748a753ddd4d0751f5a4b84b27ec5c5a12b5e`. The final pre-edit fetch found both worktrees clean and exactly equal to `origin/public-sites` and `origin/main`.
- Run [`32880631479`](https://github.com/seungwoo7050/content-foundry-archive/actions/runs/32880631479) at `e0cff8d` passed quality job `97908963407` in 16m55s and Lighthouse job `97914414629` in 30m25s. Artifact `9577314233` (`public-sites-lighthouse-32880631479-1`) is 44,630,039 B with digest `sha256:c345fc42fff9f5e75b9dd4802c1932046d2fefcbcdeab50f9e09db757d2018cd`.
- The 79-SHA rules-audit universe contained one false positive: `703a354` has all six exact pre-plan fields. The complete-field omission is the 22-commit range `ac4da12..8eb1e35`, not 23 commits.
- There are 67 primary exception or coupling commits: 11 substantive atom/validation exceptions, 53 procedural/body/evidence defects, and three intentional product-to-visual-baseline coupling primaries. The first two groups are 64 historical noncompliances; they are not reclassified as compliant or presented as precedent.
- Nine repair/pair commits are remediation rather than originating violations. The measured but ineffective `a4c1a3e` experiment and the independently compliant `f1e2743` dependency atom are also not originating violations.
- Preserving the 64 defects without rewriting published history is reasonable because later repairs and the complete local/remote matrix close current product risk. The three baseline couplings and nine repair/pairs are reasonable bounded exceptions because product output and reviewed expectations must move or roll back together; one-sided reversal is expected to fail the visual gate.
- After this documentation atom passes its remote quality and Lighthouse jobs, cleanup may remove the 32 exact ignored roots (about 9.28 GiB), two empty generated-route trees, and the frozen 149-entry Public-specific `/private/tmp` manifest (7.623 GiB), plus the identified static server, three named Playwright sessions, three private browser profiles, and 18 project-named daemon-state files.
- Cleanup must preserve this checkout, `.git`, all tracked source and 33 tracked WebP evidence assets, global pnpm/npm/Playwright/MCP caches, ambiguous shared temporary paths, and every ContentOps resource. The Docker audit found zero Public-owned containers, images, volumes, networks, or attributable builder-cache records, so no Docker deletion or prune is authorized.
- The ignored outputs are reproducible with the frozen install and quality commands below. Ad hoc local reports and screenshots are permanently disposable; tracked baselines, source, published commits, and remote workflow evidence remain the durable record.

## Final implementation and remote closure addendum

This addendum supersedes the pre-publication checkpoint values below while preserving that checkpoint as an audit record. This documentation-only atom records the immediately preceding implementation checkpoint and its completed remote runs; it does not attempt to record its own SHA or create a self-referential CI claim.

- Archive remains clean and equal to `origin/main` at `a7e748a753ddd4d0751f5a4b84b27ec5c5a12b5e`.
- The final visitor-facing implementation checkpoint remains `c696a50427aa068d14185aaa24908ec0d40b20da`; its tree is `dc92e183591b7e504341de18c1c6c76e07a36e45`.
- The isolated Next.js 16.3.3 dependency/security checkpoint is `f1e2743140366fbd5ae84c5e617fc4a01bd01070`; its tree is `60ca48b3995c38444334621787af163d5b10af49`.
- The original continuation handoff recorded Public `2b2d5982808435c9821b5eb8400aa5d3bb63fac0` and Archive `5dfb28514ed70b7fa3c1e3e15a06fb68a6eda7a0`. After the intervening published series was audited, the documentation-atom fetch confirmed the current heads above with both worktrees clean and `0 ahead / 0 behind`.
- The final measured sequence preserved the ineffective eager/high experiment at `a4c1a3e`, then used `8cb44aa` for text-first Editorial semantics, `0332aa0` to restore lazy listing policy, `a29cb8e` for the 640w card derivative, `2cbf3da` and `40e895a` for reviewed mobile baselines, and `c696a50` to remove the resulting stale import warning. `f1e2743` later upgraded only the Next.js dependency family and lock/publish-age policy exceptions. No published evidence was rewritten.
- Home latest remains an updated-date fallback, not an invented editorial classification. The full corpus remains available through archive, category, search, and 12-item static pagination.

### Final local evidence at the dependency checkpoint

- Frozen installation resolved `next@16.3.3` and `eslint-config-next@16.3.3`; the installed CLI reported Next.js 16.3.3.
- Uncached workspace graph: 28/28 tasks, zero cached, 1,261 tests, with lint, TypeScript, generated checks, Contract build, and Next static build passing.
- Real v4/v3/v2 paired Next builds and the same static verifier passed. The standalone v2 consumer CLI reproduced checksum `sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27`.
- QA generation rebuilt all 15 provider-free variants at 40 route artifacts each.
- Browser matrix: 1,348 passed, 626 intentional project-scope skips, zero failed.
- Visual regression: 28/28 exact matches. `2cbf3da` approved only the Editorial calm-blue mobile home and `40e895a` approved the other six mobile homes; every desktop and all 14 rich-article baselines remained byte-identical.
- Lighthouse inventory: 15 variants, 45 variant-route groups, three runs per group, 135 JSON reports, 135 HTML reports, 15 manifests, and 585 median assertions; every assertion passed.
- Worst three-run medians were Performance 0.98, Accessibility 1.00, Best Practices 1.00, FCP 847.58185 ms, LCP 2,414.1934 ms, CLS 0, TBT 31 ms, and Interactive 2,436.6934 ms.
- Maximum median budgets were script 142,715 B, CSS 0 B after inlining, font 0 B, image 93,473 B, and third-party requests 0.
- `pnpm audit --prod --audit-level high` found no known production vulnerabilities. The full audit is not reported as clean: the latest pinned `@lhci/cli@0.15.1` retains two high-severity dev-only transitive findings in `tmp` and `extract-zip`, plus two low and one moderate finding. Those upstream tooling constraints are an explicit deferred gate below.

### Remote workflow evidence

- Run `32834133239` at `84efcc3` preserved the first remote failure: quality job `97759121344` passed, while Lighthouse job `97765595774` failed only the Editorial home LCP median at 2,548.348 ms; artifact `9559041140` remains the evidence.
- Run `32842108968` at `a4c1a3e` showed that eager/high did not reproduce a remote gain: quality job `97783692078` passed, while Lighthouse job `97789995349` failed the same median at 2,559.001 ms; artifact `9561970855` remains the evidence.
- The follow-up commits fixed semantic order, loading policy, responsive transfer size, and visual expectations without rewriting either failure. Run `32855232537` at `40e895a` then passed quality job `97825460622` and Lighthouse job `97832636385`; artifact `9567982247` has digest `sha256:bdd7db2aaa9b553af5e91259d9a56d104ceec625e0e12c0f6fc1711bfd10d660`.
- Final implementation run `32860785377` at `c696a50` passed quality job `97843946822` in 21m16s and Lighthouse job `97851420756` in 30m54s. Artifact `9570192346` is 44,975,657 B with digest `sha256:3eb7dfb9543d59329701436f1e4af229e8180640a84d3d446eba67b07e0a934d`.
- Documentation run `32866690644` at `85fd489` passed quality job `97863597618` in 21m30s and Lighthouse job `97870892067` in 31m03s. Artifact `9572431724` is 45,478,134 B with digest `sha256:7363371649aada390d2ee047205f85207c59ddd6455703977e03e27d37b4beec`.
- Dependency/security run [`32874912479`](https://github.com/seungwoo7050/content-foundry-archive/actions/runs/32874912479) at `f1e2743` passed quality job `97890418015` in 24m00s and Lighthouse job `97898220001` in 30m38s. Artifact `9575497238` (`public-sites-lighthouse-32874912479-1`) is 45,244,693 B with digest `sha256:a8c42d982470c3f133f7b7a3ed6e8d40f3d5e266d8685b225796105678f6e6ac`.
- The dependency run has no error or failure annotation. Its two warnings are the acknowledged GitHub Actions Node 20 deprecation notices for `actions/checkout@v4`, `actions/setup-node@v4`, and, in Lighthouse, `actions/upload-artifact@v4`, all forced onto Node 24 by the runner.

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
- Remote runs proved that `a4c1a3e` was measured but ineffective; `8cb44aa` and `0332aa0` superseded it without hiding the published attempt, so its isolated rollback is no longer a meaningful claim for the current tree.
- Product and expectation responsibilities are separate but intentionally coupled at `8cb44aa` ↔ `2cbf3da` and `a29cb8e` ↔ `2cbf3da`/`40e895a`; reverting only one side makes the visual gate fail until its pair is also reverted.
- Workflow actions use mutable major tags rather than immutable commit SHAs, and the remote Node deprecation annotations remain. Pinning those tools is a separate tooling atom, not part of the visitor-facing product closure.
- The registry initially returned 404 at 00:06:29 KST, then officially published [`next@16.3.3`](https://registry.npmjs.org/next/16.3.3) at 00:32:19 KST. The audited [official source range](https://github.com/vercel/next.js/compare/d0ac8828...a9a1cb7859f178f830ad3773b303130c21b19586) contains incremental-cache root-containment/backslash-escaping and AVIF decode/bypass hardening; no public GHSA or CVE currently names 16.3.3 as its patched version, so none is claimed here.
- `f1e2743` is an independently reversible dependency atom. Its twelve exact `minimumReleaseAgeExclude` entries are the lock-consistent exceptions required by the existing pnpm release-age policy because the official packages had just been published; they do not weaken the policy for unlisted versions.
- The remaining LHCI audit findings are not fixed with unsupported overrides: LHCI still declares pre-patch `tmp` ranges, while no patched `extract-zip` release exists. Replacement or an upstream LHCI update belongs in a separate tooling/security atom with the entire Lighthouse matrix rerun.
- Inline CSS will require a hash or nonce only after an approved hosting/CSP policy exists. No CSP policy or provider value was invented in this track.
- The baseline regeneration command, previously missing from the repository, is recorded above. The generated reports and sites remain ignored; only reviewed lossless WebP evidence is tracked.

## Pre-publication immutable checkpoints

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
7. Visitor implementation is complete through `c696a50`; the isolated Next.js 16.3.3 dependency/security atom, local gates, remote deterministic quality, Lighthouse, and normal fast-forward publication are complete through `f1e2743`. This handoff atom changes documentation only.

ContentOps was not changed. Its Contract 4 producer support remains a separate follow-up; its pre-existing local/remote state was not touched.

## QA release facts

- The corpus has five categories and 17 synthetic articles, including a 13-article category, short and long cases, tables, code, commands, gallery, FAQ, sources, updates, related content, CTA, policy paths, 404, and gone path.
- Exactly 15 theme-by-skin releases round-trip through the actual Contract 4 loader with reserved example origins, provider-off configuration, QA marks, and forced `noindex`.
- Each variant produced 40 route artifacts: 34 HTML documents including 404 plus six feed/metadata endpoints. The 15 sites contain 510 HTML documents.
- The preview gallery contains 15 inert cards and 15 loopback commands with update checks disabled; it has no links, scripts, frames, external resources, or runtime query theme override.
- Five QA-only WebP assets are abstract, text-free, person-free, and logo-free; provenance, licenses, dimensions, MIME checks, and checksums are tracked.
- Generated sites, reports, and runner scratch are ignored. Only 28 reviewed, lossless Chromium WebP baselines are tracked.

## Pre-publication automated quality evidence

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

Perfect historical compliance is not claimed. The original handoff section 8 remains the audit ledger for inherited published exceptions. Additional track exceptions preserved without rewrite are: `3294ceb` literal escaped newlines; `a9b6eed` coupled helper/reading-time repair; `5b5f7ad` incorrect body line count; `fa162e1` noisy/contradictory validation; `e47c30c` full test listing; `149ca03` stale deferred wording; `f6556ab` non-strict fix headings; `126f958` 141 additions without the required size rationale; and the 22-commit range `ac4da12..8eb1e35` lacking every exact pre-plan field. `703a354` has all six fields and is not part of that exception. Later atoms use the strict fields, staged-diff checks, secret scans, focused validation, and explicit rollback.

## Open gates

- Real content, domains, brand assets, legal copy, advertising, analytics, consent, comments, provider IDs/secrets, deployment, and DNS need approval.
- Actual Safari manual review, VoiceOver core flow, 200% zoom, and OS print preview remain manual acceptance evidence. Automated WebKit mobile, Axe, reduced motion, JavaScript-off, reflow, and print layout checks did pass.
- The Next.js release gate is closed by `f1e2743`. The dev-only LHCI transitive audit findings and mutable/deprecated GitHub Actions majors remain separate tooling gates; neither is included in production static output, but neither is represented as remediated.
- ContentOps Contract 4 producer support remains a separate six-commit-ahead follow-up and was not changed in this track.
- Production readiness must not be reported until these gates close.
