import { describe, expect, expectTypeOf, it } from "vitest";

import { cleanPersonalBlogTheme } from "./clean-personal-blog/module.js";
import { editorialUtilityTheme } from "./editorial-utility/module.js";
import { friendlyMobileUtilityTheme } from "./friendly-mobile-utility/module.js";
import { informationPortalTheme } from "./information-portal/module.js";
import { minimalKnowledgeBaseTheme } from "./minimal-knowledge-base/index.js";
import { THEME_IDS, type ThemeId } from "./theme-id.js";
import {
  getThemeModule,
  THEME_REGISTRY,
  type ThemeRegistry,
} from "./theme-registry.js";

const modules = [
  minimalKnowledgeBaseTheme,
  friendlyMobileUtilityTheme,
  editorialUtilityTheme,
  cleanPersonalBlogTheme,
  informationPortalTheme,
] as const;

describe("theme registry", () => {
  it("registers every frozen theme once in exact identity order", () => {
    expect(Object.keys(THEME_REGISTRY)).toEqual(THEME_IDS);
    expect(Object.values(THEME_REGISTRY)).toEqual(modules);
    expect(Object.values(THEME_REGISTRY).map(({ id }) => id)).toEqual(THEME_IDS);
    expect(new Set(Object.values(THEME_REGISTRY)).size).toBe(THEME_IDS.length);
    expect(Object.isFrozen(THEME_REGISTRY)).toBe(true);
  });

  it("returns the exact registered module without fallback", () => {
    for (const [index, themeId] of THEME_IDS.entries()) {
      expect(getThemeModule(themeId)).toBe(modules[index]);
    }
    expectTypeOf<Parameters<typeof getThemeModule>[0]>().toEqualTypeOf<ThemeId>();
    expectTypeOf(getThemeModule("minimal-knowledge-base").id)
      .toEqualTypeOf<"minimal-knowledge-base">();
    expectTypeOf(getThemeModule("information-portal").id)
      .toEqualTypeOf<"information-portal">();
  });

  it("keeps registry keys statically closed to ThemeId", () => {
    expectTypeOf(THEME_REGISTRY).toEqualTypeOf<ThemeRegistry>();
    if (false) {
      // @ts-expect-error Unknown theme identities are not accepted.
      getThemeModule("unknown-theme");
    }
  });
});
