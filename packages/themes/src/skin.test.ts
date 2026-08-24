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

  it("keeps semantic colors independent of structural theme ids", () => {
    expectTypeOf(SKIN_TOKENS).toEqualTypeOf<
      Readonly<Record<SkinId, SemanticColorTokens>>
    >();
    expect(Object.keys(SKIN_TOKENS)).toEqual(SKIN_IDS);
  });
});
