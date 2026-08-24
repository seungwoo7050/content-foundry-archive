import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, expectTypeOf, it } from "vitest";

import { GoogleConsentDefaults } from "./google-consent-defaults";

const expectedSource = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});`;

describe("GoogleConsentDefaults", () => {
  it("renders the fixed denied consent defaults as exactly one script", () => {
    expectTypeOf<Parameters<typeof GoogleConsentDefaults>>().toEqualTypeOf<[]>();
    const html = renderToStaticMarkup(createElement(GoogleConsentDefaults));

    expect(html).toBe(`<script>${expectedSource}</script>`);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(expectedSource.match(/'denied'/g)).toHaveLength(4);
  });

  it("contains no provider or interpolation surface", () => {
    const html = renderToStaticMarkup(createElement(GoogleConsentDefaults));
    const source = html.match(/^<script>([\s\S]*)<\/script>$/)?.[1];

    expect(source).toBe(expectedSource);
    expect(source).not.toMatch(/<\/script|\$\{|process\.env/i);
    expect(source).not.toMatch(/googletagmanager|google-analytics|G-[A-Z0-9]|ca-pub-/i);
  });
});
