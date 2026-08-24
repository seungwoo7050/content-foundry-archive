import {
  AdvertisingConfigError,
  resolveAdvertisingProviderConfig,
} from "@content-foundry/advertising";
import type { ThemeAdSlots } from "@content-foundry/themes";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  assertMatchingAdSlotVocabularies,
  createSiteAdSlots,
} from "./site-ad-slots";

const disabled = {
  provider: "disabled",
  enabled: false,
  publicClientId: null,
  manualUnits: {},
} as const;
const enabled = resolveAdvertisingProviderConfig(true, {
  provider: "adsense",
  enabled: true,
  publicClientId: "ca-pub-1234567890123456",
}, '{"article-after-summary":"123","article-end":"9876543210"}');

describe("Site A manual ad slot assembly", () => {
  it("returns one frozen empty map for disabled advertising", () => {
    const first = createSiteAdSlots(disabled);
    const second = createSiteAdSlots(disabled);

    expect(first).toBe(second);
    expect(first).toEqual({});
    expect(Object.isFrozen(first)).toBe(true);
    expectTypeOf(first).toEqualTypeOf<ThemeAdSlots>();
  });

  it("projects only configured manual units in vocabulary order", () => {
    const slots = createSiteAdSlots(enabled);
    const html = renderToStaticMarkup(
      <>{slots["article-after-summary"]}{slots["article-end"]}</>,
    );

    expect(Object.keys(slots)).toEqual([
      "article-after-summary",
      "article-end",
    ]);
    expect(Object.isFrozen(slots)).toBe(true);
    expect(slots["home-feed"]).toBeUndefined();
    expect(html).toContain('data-ad-placement="article-after-summary"');
    expect(html).toContain('data-ad-slot="123"');
    expect(html).toContain('data-ad-placement="article-end"');
    expect(html).toContain('data-ad-slot="9876543210"');
  });

  it("fails closed when package slot vocabularies differ", () => {
    for (const themeSlotIds of [
      ["home-feed"],
      ["article-end", "home-feed"],
    ]) {
      expect(() => assertMatchingAdSlotVocabularies(
        ["home-feed", "article-end"],
        themeSlotIds,
      )).toThrow(AdvertisingConfigError);
    }
  });

  it("rejects a forged enabled configuration before creating nodes", () => {
    expect(() => createSiteAdSlots({
      ...enabled,
      manualUnits: { "article-end": "not numeric" },
    } as typeof enabled)).toThrow("requires a valid manual configuration");
  });
});
