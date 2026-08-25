import { SKIN_IDS, THEME_IDS } from "@content-foundry/themes";
import { describe, expect, it } from "vitest";

import { QA_QUALITY_VARIANTS, QA_THEME_IDS } from "./variants";

describe("QA visual variant matrix", () => {
  it("enumerates every theme and skin exactly once in review order", () => {
    expect(new Set(QA_THEME_IDS)).toEqual(new Set(THEME_IDS));
    expect(QA_QUALITY_VARIANTS).toHaveLength(THEME_IDS.length * SKIN_IDS.length);
    expect(QA_QUALITY_VARIANTS.map(({ id }) => id)).toEqual(
      QA_THEME_IDS.flatMap((theme) =>
        SKIN_IDS.map((skin) => `${theme}--${skin}`),
      ),
    );
    expect(new Set(QA_QUALITY_VARIANTS.map(({ id }) => id)).size)
      .toBe(QA_QUALITY_VARIANTS.length);
  });

  it("uses unique reserved non-operational origins", () => {
    const origins = QA_QUALITY_VARIANTS.map(({ origin }) => origin);

    expect(new Set(origins).size).toBe(origins.length);
    for (const origin of origins) {
      const url = new URL(origin);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toMatch(/\.qa\.public-sites\.example$/u);
      expect(url.pathname).toBe("/");
    }
  });
});
