import {
  resolveAdvertisingProviderConfig,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ManualAdSlot } from "./manual-ad-slot";

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

  it("renders one explicit responsive unit and one initialization push", () => {
    const html = renderToStaticMarkup(createElement(ManualAdSlot, {
      config: enabled,
      slotId: "article-end",
    }));

    expect(html).toBe(
      '<aside aria-label="광고" data-ad-placement="article-end">'
      + '<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890123456" data-ad-format="auto" data-ad-slot="9876543210" data-full-width-responsive="true" style="display:block"></ins>'
      + '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
      + '</aside>',
    );
    expect(html).not.toMatch(/enable_page_level_ads|data-adbreak/i);
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
