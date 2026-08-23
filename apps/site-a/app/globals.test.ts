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
});
