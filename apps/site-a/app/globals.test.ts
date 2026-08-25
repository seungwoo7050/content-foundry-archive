import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("responsive CSS invariants", () => {
  it("prevents page-wide horizontal overflow", () => {
    expect(css).not.toContain("100vw");
    expect(css).toContain("min-width: 0");
    expect(css).toContain("overflow-wrap: anywhere");
  });

  it("limits horizontal scrolling to the table wrapper", () => {
    const tableRule = css.match(/\.content-table-scroll\s*\{([^}]*)\}/s)?.[1];

    expect(tableRule).toContain("max-width: 100%");
    expect(tableRule).toContain("overflow-x: auto");
  });

  it("contains intrinsic media and code without forcing a crop", () => {
    expect(css).toContain(".content-image img {\n  width: auto;\n  height: auto;");
    expect(css).toContain(".content-gallery-items {\n  display: grid;");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(css).toContain("repeat(2, minmax(0, 1fr))");
    expect(css).toContain(".content-code-command pre {\n  margin: 0;\n  overflow-x: auto;");
    expect(css).not.toMatch(/\.content-(?:image|gallery)[^{]*\{[^}]*object-fit:\s*cover/s);
  });

  it("keeps structured media legible in print", () => {
    const printRule = css.match(/@media print\s*\{([\s\S]*)\}\s*$/)?.[1];

    expect(printRule).toContain("break-inside: avoid");
    expect(printRule).toContain("white-space: pre-wrap");
    expect(printRule).toContain("overflow-wrap: anywhere");
  });
});
