import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { QA_QUALITY_VARIANTS } from "./variants";
import { writeQaPreviewGallery } from "./write-preview-gallery";

const roots: string[] = [];

function fixture() {
  const repositoryDirectory = mkdtempSync(join(tmpdir(), "public-sites-qa-gallery-"));
  roots.push(repositoryDirectory);
  const qualityDirectory = join(repositoryDirectory, "output/quality-release");
  const sitesDirectory = join(qualityDirectory, "sites");
  mkdirSync(sitesDirectory, { recursive: true });
  writeFileSync(join(repositoryDirectory, "serve.json"), '{"cleanUrls":true}\n');
  const plans = QA_QUALITY_VARIANTS.map((variant) => {
    const outputDirectory = join(sitesDirectory, variant.id);
    mkdirSync(outputDirectory);
    writeFileSync(join(outputDirectory, "index.html"),
      `<meta name="robots" content="noindex,nofollow"><main data-theme="${variant.theme}" data-skin="${variant.skin}">QA 비운영</main>`);
    return {
      ...variant,
      releaseDirectory: join(qualityDirectory, "releases", variant.id),
      outputDirectory,
      environment: {
        RELEASE_MODE: "preview" as const,
        CONTENT_RELEASE_DIR: join(qualityDirectory, "releases", variant.id),
        SITE_ORIGIN: variant.origin,
        ENABLE_ANALYTICS: "false" as const,
        ENABLE_ADS: "false" as const,
      },
    } satisfies QaStaticBuildPlan;
  });
  return { qualityDirectory, plans, repositoryDirectory };
}

afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true })));

describe("writeQaPreviewGallery", () => {
  it("writes one self-contained noindex index for the exact QA registry", () => {
    const { qualityDirectory, plans, repositoryDirectory } = fixture();
    const options = { qualityDirectory, plans, repositoryDirectory };
    const target = writeQaPreviewGallery(options);
    const html = readFileSync(target, "utf8");

    expect(target).toBe(join(qualityDirectory, "preview-gallery.html"));
    expect(html).toContain('<meta name="robots" content="noindex,nofollow,noarchive">');
    expect(html).toContain("QA 비운영 프리뷰 갤러리");
    expect(html).toContain("분석·광고 provider는 꺼져 있고");
    expect(html.match(/PROVIDERS OFF/gu)).toHaveLength(15);
    expect(html.match(/<li><article>/gu)).toHaveLength(15);
    for (const variant of QA_QUALITY_VARIANTS) {
      const output = `output/quality-release/sites/${variant.id}`;
      expect(html).toContain(`Verified output: <code>${output}</code>`);
      expect(html).toContain(
        `NO_UPDATE_CHECK=1 pnpm exec serve '${output}' --config '../../../../serve.json' `
          + "--listen 'tcp://127.0.0.1:4173' --no-clipboard",
      );
      expect(html).toContain(variant.origin);
    }
    expect(html).not.toMatch(/<(?:script|iframe|img|link)\b/iu);
    expect(html).not.toMatch(/\bhref\s*=/iu);
    expect(html).not.toMatch(/[?&](?:theme|skin)=/iu);
    expect(() => writeQaPreviewGallery(options)).toThrow(/EEXIST/u);
  });

  it("rejects mismatched plans, site inventories, and home identities", () => {
    const reordered = fixture();
    expect(() => writeQaPreviewGallery({
      ...reordered, plans: [...reordered.plans].reverse(),
    })).toThrow(/plan 0 does not match/u);

    const extra = fixture();
    mkdirSync(join(extra.qualityDirectory, "sites", "unexpected"));
    expect(() => writeQaPreviewGallery(extra))
      .toThrow(/site inventory/u);

    const operational = fixture();
    const first = operational.plans[0]!;
    const plans = [{
      ...first,
      environment: { ...first.environment, RELEASE_MODE: "production" as const },
    }, ...operational.plans.slice(1)] as unknown as QaStaticBuildPlan[];
    expect(() => writeQaPreviewGallery({ ...operational, plans }))
      .toThrow(/plan 0 does not match/u);

    const wrongHome = fixture();
    writeFileSync(join(wrongHome.plans[0]!.outputDirectory, "index.html"), "operational", {
      flag: "w",
    });
    expect(() => writeQaPreviewGallery(wrongHome))
      .toThrow(/home identity/u);

    const unsafeServeConfig = fixture();
    writeFileSync(join(unsafeServeConfig.repositoryDirectory, "serve.json"), "{}\n", {
      flag: "w",
    });
    expect(() => writeQaPreviewGallery(unsafeServeConfig))
      .toThrow(/cleanUrls true/u);
  });
});
