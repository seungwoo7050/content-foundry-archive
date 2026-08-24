import { describe, expect, expectTypeOf, it } from "vitest";

import {
  AD_SLOT_IDS,
  type AdSlotId,
  ManualAdUnitConfigError,
  hasValidManualAdUnits,
  isAdSenseUnitId,
  parseManualAdUnits,
} from "./manual-units.js";

describe("provider-neutral manual ad units", () => {
  it("uses the exact theme-neutral slot vocabulary", () => {
    expect(AD_SLOT_IDS).toEqual([
      "home-feed",
      "article-after-summary",
      "article-mid-1",
      "article-mid-2",
      "article-end",
      "desktop-sidebar",
    ]);
    expectTypeOf<AdSlotId>().toEqualTypeOf<
      | "home-feed"
      | "article-after-summary"
      | "article-mid-1"
      | "article-mid-2"
      | "article-end"
      | "desktop-sidebar"
    >();
  });

  it("accepts and canonicalizes a non-empty slot subset", () => {
    const units = parseManualAdUnits(
      '{"article-end":"9876543210","home-feed":"1234567890"}',
    );

    expect(units).toEqual({
      "home-feed": "1234567890",
      "article-end": "9876543210",
    });
    expect(Object.isFrozen(units)).toBe(true);
    expect(hasValidManualAdUnits(units)).toBe(true);
  });

  it.each(["1", "1234567890", "9".repeat(20)])(
    "accepts numeric unit ID %s",
    (unitId) => expect(isAdSenseUnitId(unitId)).toBe(true),
  );

  it.each(["", " 123", "123 ", "12 3", "123x", "１２３", "9".repeat(21)])(
    "rejects non-numeric, whitespace, or oversized unit ID %j",
    (unitId) => expect(isAdSenseUnitId(unitId)).toBe(false),
  );

  it.each([
    undefined,
    null,
    "{}",
    '{"unknown":"123"}',
    '{"auto-placement":"123"}',
    '{"home-feed":"12 3"}',
  ])("rejects non-exact manual unit config %j", (serialized) => {
    expect(() => parseManualAdUnits(serialized)).toThrow(ManualAdUnitConfigError);
  });

  it("surfaces semantic duplicate keys as a manual config error", () => {
    const serialized = '{"home-feed":"123","home\\u002dfeed":"456"}';
    expect(() => parseManualAdUnits(serialized)).toThrow(ManualAdUnitConfigError);
  });
});
