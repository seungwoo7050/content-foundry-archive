import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  AdSenseBootstrap,
  loadAdSenseBootstrap,
} from "./adsense-bootstrap";

describe("AdSense bootstrap", () => {
  it("renders nothing for disabled advertising", () => {
    expect(renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: null,
    }))).toBe("");
  });

  it("renders only the validated account meta before hydration", () => {
    const html = renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: "ca-pub-1234567890123456",
    }));

    expect(html).toBe(
      '<meta name="google-adsense-account" content="ca-pub-1234567890123456"/>',
    );
  });

  it("loads and deduplicates the official async script after hydration", () => {
    const appended: Array<Record<string, unknown>> = [];
    const script = {
      async: false,
      crossOrigin: "",
      src: "",
      setAttribute: vi.fn(),
    };
    const documentTarget = {
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => script),
      head: { append: (value: Record<string, unknown>) => appended.push(value) },
    } as unknown as Document;

    expect(loadAdSenseBootstrap(
      documentTarget,
      "ca-pub-1234567890123456",
    )).toBe(true);
    expect(script).toMatchObject({
      async: true,
      crossOrigin: "anonymous",
      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456",
    });
    expect(script.setAttribute).toHaveBeenCalledWith(
      "data-content-foundry-provider",
      "adsense",
    );
    expect(appended).toEqual([script]);

    const existing = {
      querySelector: () => ({}),
    } as unknown as Document;
    expect(loadAdSenseBootstrap(
      existing,
      "ca-pub-1234567890123456",
    )).toBe(false);
  });

  it("rejects a forged public client at the rendering boundary", () => {
    expect(() => renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: "ca-pub-forged",
    }))).toThrow("valid public client ID");
  });
});
