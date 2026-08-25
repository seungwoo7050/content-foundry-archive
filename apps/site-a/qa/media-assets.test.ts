import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isAbsolute, posix, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { QA_MEDIA_IDS } from "./corpus";
import { QA_MEDIA_ASSET_IDS, qaMediaAssets } from "./media-assets";

const QA_ROOT = fileURLToPath(new URL(".", import.meta.url));

describe("QA media asset catalog", () => {
  it("maps every corpus media ID once in stable order", () => {
    const assetIds = qaMediaAssets.map(({ id }) => id);

    expect(assetIds).toEqual(QA_MEDIA_ASSET_IDS);
    expect(assetIds).toEqual(QA_MEDIA_IDS);
    expect(new Set(assetIds).size).toBe(assetIds.length);
  });

  it("matches the tracked WebP bytes and provenance inventory", () => {
    for (const asset of qaMediaAssets) {
      expect(isAbsolute(asset.sourcePath)).toBe(false);
      expect(asset.sourcePath).not.toContain("\\");
      expect(posix.normalize(asset.sourcePath)).toBe(asset.sourcePath);
      expect(asset.sourcePath).toMatch(/^assets\/[a-z0-9-]+\.webp$/u);

      const bytes = readFileSync(resolve(QA_ROOT, asset.sourcePath));
      expect(bytes.byteLength).toBe(asset.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
      expect(asset).toMatchObject({ mimeType: "image/webp" });
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
    }
  });

  it("keeps visitor descriptions neutral and usage explicitly QA-only", () => {
    const prohibitedClaims =
      /(?:텍스트|글자|문자|로고|상표|인물|사람|기관|제품|장소|사건|공식|운영용|출시)/u;

    for (const asset of qaMediaAssets) {
      expect(asset.alt).toMatch(/^QA 비운영 검증용/u);
      expect(asset.alt).not.toMatch(prohibitedClaims);
      expect(asset.credit).toBe("OpenAI 내장 이미지 생성·합성 QA 검증 자산");
      expect(asset.license).toBe("QA 전용·운영/재배포 미승인");
    }
  });
});
