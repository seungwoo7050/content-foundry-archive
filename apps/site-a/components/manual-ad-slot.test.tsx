import {
  resolveAdvertisingProviderConfig,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ManualAdSlot,
  activateManualAdUnit,
  updateManualAdViewability,
} from "./manual-ad-slot";

const enabled = resolveAdvertisingProviderConfig(true, {
  provider: "adsense",
  enabled: true,
  publicClientId: "ca-pub-1234567890123456",
}, '{"home-feed":"123","article-end":"9876543210"}');

describe("manual AdSense slot", () => {
  it("renders nothing when advertising or the requested unit is absent", () => {
    expect(renderToStaticMarkup(createElement(ManualAdSlot, {
      config: {
        provider: "disabled",
        enabled: false,
        publicClientId: null,
        manualUnits: {},
      },
      slotId: "article-end",
    }))).toBe("");
    expect(renderToStaticMarkup(createElement(ManualAdSlot, {
      config: enabled,
      slotId: "article-mid-1",
    }))).toBe("");
  });

  it("reserves and labels one explicit unit without pre-consent script", () => {
    const html = renderToStaticMarkup(createElement(ManualAdSlot, {
      config: enabled,
      slotId: "article-end",
    }));

    expect(html).toBe(
      '<aside aria-label="광고" data-ad-placement="article-end" style="min-height:280px">'
      + '<small aria-hidden="true">광고</small>'
      + '<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890123456" data-ad-format="auto" data-ad-slot="9876543210" data-full-width-responsive="true" style="display:block"></ins>'
      + '</aside>',
    );
    expect(html).not.toMatch(/<script|enable_page_level_ads|data-adbreak/i);
  });

  it("queues exactly one unit activation per explicit call", () => {
    const target = { adsbygoogle: [] as unknown[] };
    activateManualAdUnit(target);
    expect(target.adsbygoogle).toEqual([{}]);
  });

  it("reports viewability once after both ad consent and half visibility", () => {
    const emit = vi.fn(() => true);
    const initial = {
      advertisingAllowed: false,
      visible: false,
      reported: false,
    };
    const visible = updateManualAdViewability(
      "article-end",
      initial,
      { visible: true },
      emit,
    );
    expect(emit).not.toHaveBeenCalled();

    const reported = updateManualAdViewability(
      "article-end",
      visible,
      { advertisingAllowed: true },
      emit,
    );
    expect(emit).toHaveBeenCalledWith({
      eventName: "ad_slot_viewability",
      slotId: "article-end",
    });
    expect(reported.reported).toBe(true);

    updateManualAdViewability(
      "article-end",
      reported,
      { visible: false },
      emit,
    );
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("rejects forged client and unit identifiers", () => {
    for (const config of [
      { ...enabled, publicClientId: "ca-pub-forged" },
      { ...enabled, manualUnits: { "article-end": "not numeric" } },
    ]) {
      expect(() => renderToStaticMarkup(createElement(ManualAdSlot, {
        config: config as unknown as AdvertisingProviderConfig,
        slotId: "article-end",
      }))).toThrow(/valid (?:public client|unit) ID/);
    }
  });
});
