import {
  ANALYTICS_EVENT_CONTRACT_VERSION,
  type AnalyticsEventContext,
  type AnalyticsEventPayload,
} from "@content-foundry/analytics";
import { act, createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import type { SiteAnalyticsRouteProjection } from "../lib/site-analytics-route-projection";
import { createAnalyticsEventRuntime } from "./analytics-event-runtime";
import {
  AnalyticsEventDispatcher,
  dispatchAnalyticsEvent,
  emitAnalyticsEvent,
  resolveAnalyticsEventContext,
  resolveClassifiedExternalLinkEvent,
  resolveInternalLinkEvent,
} from "./analytics-event-dispatcher";
import { GA4_PROVIDER_READY_EVENT } from "./ga4-tag";

const context: AnalyticsEventContext = {
  eventContractVersion: ANALYTICS_EVENT_CONTRACT_VERSION,
  siteId: "site-a",
  releaseId: "REL-2026-08-25",
  routeType: "article",
  themeId: "friendly-mobile-utility",
  skinId: "calm-blue",
};
const consent = {
  adStoragePurposeConsentStatus: 2,
  adUserDataPurposeConsentStatus: 2,
  adPersonalizationPurposeConsentStatus: 2,
  analyticsStoragePurposeConsentStatus: 1,
};
const detail = { eventName: "bookmark_local", articleId: "ART-GUIDE-1" };
const projection: SiteAnalyticsRouteProjection = {
  baseContext: {
    eventContractVersion: ANALYTICS_EVENT_CONTRACT_VERSION,
    siteId: "site-a",
    releaseId: "REL-2026-08-25",
    themeId: "friendly-mobile-utility",
    skinId: "calm-blue",
  },
  routeTypesByPath: {
    "/article/guide": "article",
    "/retired-guide": "retired",
  },
  routeDestinationsByPath: {
    "/article/guide": {
      destinationType: "article",
      destinationId: "ART-GUIDE-1",
    },
    "/category/daily-admin": {
      destinationType: "category",
      destinationId: "daily-admin",
    },
  },
};

class MountElement extends EventTarget {
  readonly nodeType = 1;
  readonly tagName = "DIV";
  readonly namespaceURI = "http://www.w3.org/1999/xhtml";
  readonly style = {};
  readonly childNodes: unknown[] = [];

  constructor(readonly ownerDocument: EventTarget) {
    super();
  }

  setAttribute() {}
  removeAttribute() {}
  appendChild(node: unknown) { this.childNodes.push(node); return node; }
  insertBefore(node: unknown) { this.childNodes.push(node); return node; }
  removeChild(node: unknown) {
    this.childNodes.splice(this.childNodes.indexOf(node), 1);
    return node;
  }
}

function createMountDom() {
  const documentTarget = Object.assign(new EventTarget(), {
    nodeType: 9,
    documentElement: { namespaceURI: "http://www.w3.org/1999/xhtml" },
    activeElement: null,
  });
  const createMountElement = () => new MountElement(documentTarget);
  Object.assign(documentTarget, { createElement: createMountElement, body: createMountElement() });
  const windowTarget = Object.assign(new EventTarget(), {
    document: documentTarget,
    location: {
      origin: "https://guides.example.kr",
      pathname: "/article/guide",
      protocol: "https:",
    },
    HTMLIFrameElement: class {},
    getSelection: () => null,
  });
  Object.assign(documentTarget, { defaultView: windowTarget });
  return { documentTarget, windowTarget, container: createMountElement() };
}

describe("Site A analytics event dispatch", () => {
  it("resolves exact known paths and defaults unknown paths to not-found", () => {
    expect(resolveAnalyticsEventContext(projection, "/article/guide").routeType).toBe("article");
    expect(resolveAnalyticsEventContext(projection, "/retired-guide").routeType).toBe("retired");
    expect(resolveAnalyticsEventContext(projection, "/ARTICLE/GUIDE").routeType).toBe("not-found");
  });

  it("resolves only same-origin article and category destinations", () => {
    expect(resolveInternalLinkEvent(
      projection,
      "/article/guide?source=home#steps",
      "https://guides.example.kr",
    )).toEqual({
      eventName: "internal_link_click",
      destinationType: "article",
      destinationId: "ART-GUIDE-1",
    });
    expect(resolveInternalLinkEvent(
      projection,
      "https://guides.example.kr/category/daily-admin",
      "https://guides.example.kr",
    )).toEqual({
      eventName: "internal_link_click",
      destinationType: "category",
      destinationId: "daily-admin",
    });
    expect(resolveInternalLinkEvent(
      projection,
      "https://other.example/article/guide",
      "https://guides.example.kr",
    )).toBeNull();
    expect(resolveInternalLinkEvent(
      projection,
      "/about",
      "https://guides.example.kr",
    )).toBeNull();
  });

  it("resolves only complete classified external action details", () => {
    expect(resolveClassifiedExternalLinkEvent({
      analyticsEvent: "external_official_click",
      analyticsTargetId: "government-service",
    })).toEqual({
      eventName: "external_official_click",
      targetId: "government-service",
    });
    expect(resolveClassifiedExternalLinkEvent({
      analyticsEvent: "affiliate_click",
      analyticsPartnerId: "comparison-partner",
      analyticsPlacement: "article-body",
    })).toEqual({
      eventName: "affiliate_click",
      partnerId: "comparison-partner",
      placement: "article-body",
    });
    expect(resolveClassifiedExternalLinkEvent({
      analyticsEvent: "affiliate_click",
      analyticsPartnerId: "comparison-partner",
    })).toBeNull();
    expect(resolveClassifiedExternalLinkEvent({
      analyticsEvent: "unknown",
      analyticsTargetId: "government-service",
    })).toBeNull();
  });

  it("sends a validated event after analytics consent", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(consent, context, detail, gtag)).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "bookmark_local", {
      article_id: "ART-GUIDE-1",
      event_contract_version: "1.0.0",
      release_id: "REL-2026-08-25",
      route_type: "article",
      site_id: "site-a",
      skin_id: "calm-blue",
      theme_id: "friendly-mobile-utility",
    });
  });

  it("drops events before or without analytics consent", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(undefined, context, detail, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent({ ...consent, analyticsStoragePurposeConsentStatus: 2 }, context, detail, gtag)).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("drops malformed detail and a missing gtag without queueing", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(consent, context, { ...detail, rawQuery: "secret" }, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, { ...detail, siteId: "other-site" }, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, detail, undefined)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, detail, "not-a-function")).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("flushes only consented runtime events when the provider becomes ready", () => {
    const delivered: AnalyticsEventPayload[] = [];
    const runtime = createAnalyticsEventRuntime((payload) => delivered.push(payload));
    runtime.capture(context, { ...detail, articleId: "ART-BEFORE-CONSENT" });
    runtime.updateConsent(consent);
    runtime.capture(context, { ...detail, articleId: "ART-BOOTSTRAP" });
    runtime.listenerReady();
    runtime.capture(context, { ...detail, articleId: "ART-DEFERRED" });
    expect(delivered).toEqual([]);

    runtime.providerReady();
    expect(delivered.map((payload) =>
      "articleId" in payload ? payload.articleId : "unexpected",
    )).toEqual([
      "ART-BOOTSTRAP", "ART-DEFERRED",
    ]);
  });

  it("clears deferred runtime events on consent revoke", () => {
    const delivered: AnalyticsEventPayload[] = [];
    const runtime = createAnalyticsEventRuntime((payload) => delivered.push(payload));
    runtime.updateConsent(consent);
    runtime.listenerReady();
    runtime.capture(context, detail);
    runtime.updateConsent({ ...consent, analyticsStoragePurposeConsentStatus: 2 });
    runtime.updateConsent(consent);
    runtime.providerReady();
    expect(delivered).toEqual([]);
  });

  it("mounts the consent and provider lifecycle that flushes a queued DOM event", async () => {
    const { documentTarget, windowTarget, container } = createMountDom();
    vi.stubGlobal("document", documentTarget);
    vi.stubGlobal("window", windowTarget);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container as unknown as Element);

    try {
      await act(async () => {
        root.render(createElement(AnalyticsEventDispatcher, { projection }));
      });
      const cmp = windowTarget as typeof windowTarget & {
        googlefc?: {
          callbackQueue?: Array<{ CONSENT_MODE_DATA_READY(): void }>;
          getGoogleConsentModeValues?: () => unknown;
        };
        gtag?: ReturnType<typeof vi.fn>;
      };
      expect(cmp.googlefc?.callbackQueue).toHaveLength(1);
      emitAnalyticsEvent({
        eventName: "bookmark_local",
        articleId: "ART-BEFORE-CONSENT",
      });
      cmp.googlefc!.getGoogleConsentModeValues = () => consent;
      cmp.googlefc!.callbackQueue![0]!.CONSENT_MODE_DATA_READY();
      emitAnalyticsEvent({
        eventName: "bookmark_local",
        articleId: "ART-QUEUED",
      });

      const gtag = vi.fn();
      cmp.gtag = gtag;
      expect(gtag).not.toHaveBeenCalled();
      documentTarget.dispatchEvent(new Event(GA4_PROVIDER_READY_EVENT));
      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag.mock.calls[0]?.[2]).toMatchObject({
        article_id: "ART-QUEUED",
        route_type: "article",
      });
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  });
});
