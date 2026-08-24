import type { AnalyticsProviderConfig } from "@content-foundry/analytics";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Ga4Tag, loadGa4 } from "./ga4-tag";

describe("GA4 Basic consent-mode tag", () => {
  it("renders no provider markup before the CMP callback", () => {
    expect(renderToStaticMarkup(createElement(Ga4Tag, {
      config: { provider: "disabled", publicMeasurementId: null },
    }))).toBe("");
    expect(renderToStaticMarkup(createElement(Ga4Tag, {
      config: { provider: "ga4", publicMeasurementId: "G-ABC123" },
    }))).toBe("");
  });

  it("loads and configures one validated GA4 script", () => {
    const appended: Array<Record<string, unknown>> = [];
    const script = {
      async: false,
      src: "",
      setAttribute: vi.fn(),
    };
    const documentTarget = {
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => script),
      head: { append: (value: Record<string, unknown>) => appended.push(value) },
    } as unknown as Document;
    const dataLayer: unknown[] = [];

    expect(loadGa4(documentTarget, { dataLayer }, "G-ABC123")).toBe(true);
    expect(script).toMatchObject({
      async: true,
      src: "https://www.googletagmanager.com/gtag/js?id=G-ABC123",
    });
    expect(script.setAttribute).toHaveBeenCalledWith(
      "data-content-foundry-provider",
      "ga4",
    );
    expect(appended).toEqual([script]);
    expect(dataLayer[0]).toEqual(["js", expect.any(Date)]);
    expect(dataLayer[1]).toEqual(["config", "G-ABC123"]);
  });

  it("deduplicates the loader and rejects forged identifiers", () => {
    const existingDocument = {
      querySelector: () => ({}),
    } as unknown as Document;
    expect(loadGa4(existingDocument, {}, "G-ABC123")).toBe(false);
    expect(() => loadGa4(existingDocument, {}, "G-forged")).toThrow(
      "valid measurement ID",
    );

    const forged = {
      provider: "ga4",
      publicMeasurementId: "G-forged",
    } as unknown as AnalyticsProviderConfig;
    expect(() => renderToStaticMarkup(createElement(Ga4Tag, { config: forged })))
      .toThrow("valid measurement ID");
  });
});
