import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdSenseBootstrap } from "./adsense-bootstrap";

describe("AdSense bootstrap", () => {
  it("renders nothing for disabled advertising", () => {
    expect(renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: null,
    }))).toBe("");
  });

  it("renders the validated account meta and official async loader", () => {
    const html = renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: "ca-pub-1234567890123456",
    }));

    expect(html).toBe(
      '<script async="" crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>'
      + '<meta name="google-adsense-account" content="ca-pub-1234567890123456"/>',
    );
  });

  it("rejects a forged public client at the rendering boundary", () => {
    expect(() => renderToStaticMarkup(createElement(AdSenseBootstrap, {
      publicClientId: "ca-pub-forged",
    }))).toThrow("valid public client ID");
  });
});
