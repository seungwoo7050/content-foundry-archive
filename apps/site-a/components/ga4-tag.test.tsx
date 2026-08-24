import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { AnalyticsProviderConfig } from "@content-foundry/analytics";
import { describe, expect, it } from "vitest";

import { Ga4Tag } from "./ga4-tag";

describe("Ga4Tag", () => {
  it("renders nothing for disabled analytics", () => {
    expect(renderToStaticMarkup(createElement(Ga4Tag, {
      config: { provider: "disabled", publicMeasurementId: null },
    }))).toBe("");
  });

  it("renders the official loader before one exact config command", () => {
    const html = renderToStaticMarkup(createElement(Ga4Tag, {
      config: { provider: "ga4", publicMeasurementId: "G-PSW1MY7HB4" },
    }));

    expect(html).toBe(
      '<script async="" src="https://www.googletagmanager.com/gtag/js?id=G-PSW1MY7HB4"></script>' +
      "<script>gtag('js', new Date());\ngtag('config', 'G-PSW1MY7HB4');</script>",
    );
    expect(html.match(/<script/g)).toHaveLength(2);
    expect(html.indexOf("gtag/js")).toBeLessThan(html.indexOf("gtag('config'"));
    expect(html).not.toMatch(/article|release|title|user|email|query/i);
  });

  it("fails closed if a typed boundary is forged", () => {
    const forged = {
      provider: "ga4",
      publicMeasurementId: "G-unsafe'</script>",
    } as AnalyticsProviderConfig;

    expect(() => renderToStaticMarkup(
      createElement(Ga4Tag, { config: forged }),
    )).toThrow("valid measurement ID");
  });
});
