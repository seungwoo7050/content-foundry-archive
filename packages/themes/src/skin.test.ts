import { describe, expect, expectTypeOf, it } from "vitest";

import {
  SKIN_IDS,
  SKIN_TOKENS,
  type SemanticColorTokens,
  type SkinId,
} from "./skin.js";

const semanticTokenNames = [
  "canvas",
  "surface",
  "surfaceMuted",
  "text",
  "textMuted",
  "primary",
  "onPrimary",
  "border",
  "success",
  "warning",
  "danger",
  "focusRing",
] as const;

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g);
  if (!channels || channels.length !== 3) throw new Error(`Invalid color: ${hex}`);
  const [red, green, blue] = channels.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const luminances = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left) as [number, number];
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

describe("theme skins", () => {
  it("keeps the supported skin tuple exact", () => {
    expect(SKIN_IDS).toEqual(["calm-blue", "forest-green", "warm-neutral"]);
    expect(Object.isFrozen(SKIN_IDS)).toBe(true);
    expectTypeOf<SkinId>().toEqualTypeOf<
      "calm-blue" | "forest-green" | "warm-neutral"
    >();
  });

  it.each(SKIN_IDS)("publishes a complete frozen %s token set", (skinId) => {
    const tokens = SKIN_TOKENS[skinId];

    expect(Object.keys(tokens)).toEqual(semanticTokenNames);
    expect(Object.isFrozen(tokens)).toBe(true);
    expect(
      Object.values(tokens).every((value) => /^#[0-9A-F]{6}$/.test(value)),
    ).toBe(true);
  });

  it.each(SKIN_IDS)("keeps %s visitor text at WCAG AA contrast", (skinId) => {
    const tokens = SKIN_TOKENS[skinId];
    for (const background of [tokens.canvas, tokens.surface, tokens.surfaceMuted]) {
      expect(contrastRatio(tokens.text, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.textMuted, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.primary, background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(tokens.onPrimary, tokens.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps semantic colors independent of structural theme ids", () => {
    expectTypeOf(SKIN_TOKENS).toEqualTypeOf<
      Readonly<Record<SkinId, SemanticColorTokens>>
    >();
    expect(Object.keys(SKIN_TOKENS)).toEqual(SKIN_IDS);
  });
});
