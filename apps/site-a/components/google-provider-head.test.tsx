import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GoogleProviderHead } from "./google-provider-head";

const cmp = {
  provider: "google-cmp",
  publicClientId: "ca-pub-1234567890123456",
} as const;

describe("Google provider head", () => {
  it("renders nothing when providers are disabled", () => {
    expect(renderToStaticMarkup(createElement(GoogleProviderHead, {
      analytics: { provider: "disabled", publicMeasurementId: null },
      cmp: { provider: "disabled", publicClientId: null },
    }))).toBe("");
  });

  it("renders denied defaults with pre-hydration account metadata", () => {
    const html = renderToStaticMarkup(createElement(GoogleProviderHead, {
      analytics: { provider: "disabled", publicMeasurementId: null },
      cmp,
    }));

    const defaultsIndex = html.indexOf("gtag('consent', 'default'");
    expect(defaultsIndex).toBeGreaterThan(-1);
    expect(html).toContain(
      'name="google-adsense-account" content="ca-pub-1234567890123456"',
    );
    expect(html).not.toContain("pagead2.googlesyndication.com");
    expect(html).not.toContain("googletagmanager");
  });

  it("keeps configured GA4 out of pre-consent markup", () => {
    const html = renderToStaticMarkup(createElement(GoogleProviderHead, {
      analytics: { provider: "ga4", publicMeasurementId: "G-ABC123" },
      cmp,
    }));

    expect(html).toContain("google-adsense-account");
    expect(html).not.toContain("pagead2.googlesyndication.com");
    expect(html).not.toContain("googletagmanager");
    expect(html).not.toContain("G-ABC123");
  });

  it("rejects GA4 without its CMP boundary", () => {
    expect(() => renderToStaticMarkup(createElement(GoogleProviderHead, {
      analytics: { provider: "ga4", publicMeasurementId: "G-ABC123" },
      cmp: { provider: "disabled", publicClientId: null },
    }))).toThrow("requires Google CMP");
  });
});
