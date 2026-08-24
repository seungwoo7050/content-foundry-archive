import { describe, expect, it } from "vitest";

import { escapeXmlText } from "./xml-text";

describe("XML text escaping", () => {
  it("escapes every reserved XML character", () => {
    expect(escapeXmlText(`A&B <tag> "quoted" 'single'`)).toBe(
      "A&amp;B &lt;tag&gt; &quot;quoted&quot; &apos;single&apos;",
    );
  });

  it("removes invalid XML code points while preserving valid Unicode", () => {
    const unpairedSurrogate = String.fromCharCode(0xd800);
    expect(
      escapeXmlText(`한글\t\n\r${String.fromCharCode(0x00)}${unpairedSurrogate}😀`),
    ).toBe("한글\t\n\r😀");
  });
});
