import {
  resolveAdvertisingProviderConfig,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdSenseBootstrap } from "./adsense-bootstrap";

describe("AdSense bootstrap", () => {
  it("renders nothing for disabled advertising", () => {
    expect(renderToStaticMarkup(createElement(AdSenseBootstrap, {
      config: {
        provider: "disabled",
        enabled: false,
        publicClientId: null,
        manualUnits: {},
      },
    }))).toBe("");
  });

  it("renders the validated account meta and official async loader", () => {
    const config = resolveAdvertisingProviderConfig(true, {
      provider: "adsense",
      enabled: true,
      publicClientId: "ca-pub-1234567890123456",
    }, '{"article-end":"9876543210"}');
    const html = renderToStaticMarkup(createElement(AdSenseBootstrap, {
      config,
    }));

    expect(html).toBe(
      '<script async="" crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>'
      + '<meta name="google-adsense-account" content="ca-pub-1234567890123456"/>',
    );
  });

  it("rejects a forged public client at the rendering boundary", () => {
    const forged = {
      provider: "adsense",
      enabled: true,
      publicClientId: "ca-pub-forged",
      manualUnits: { "article-end": "9876543210" },
    } as unknown as AdvertisingProviderConfig;

    expect(() => renderToStaticMarkup(createElement(AdSenseBootstrap, {
      config: forged,
    }))).toThrow("valid public client ID");
  });
});
