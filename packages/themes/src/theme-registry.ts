import { cleanPersonalBlogTheme } from "./clean-personal-blog/module.js";
import { editorialUtilityTheme } from "./editorial-utility/module.js";
import { friendlyMobileUtilityTheme } from "./friendly-mobile-utility/module.js";
import { informationPortalTheme } from "./information-portal/module.js";
import { minimalKnowledgeBaseTheme } from "./minimal-knowledge-base/index.js";
import type { ThemeId } from "./theme-id.js";
import type { ThemeModule } from "./theme-module.js";

export type ThemeRegistry = {
  readonly [TId in ThemeId]: ThemeModule & { readonly id: TId };
};

function registerTheme<TId extends ThemeId>(
  id: TId,
  module: ThemeModule,
): ThemeModule & { readonly id: TId } {
  if (module.id !== id) {
    throw new Error(`Theme registry identity mismatch: ${id} != ${module.id}`);
  }
  return module as ThemeModule & { readonly id: TId };
}

export const THEME_REGISTRY: ThemeRegistry = Object.freeze({
  "minimal-knowledge-base": registerTheme(
    "minimal-knowledge-base",
    minimalKnowledgeBaseTheme,
  ),
  "friendly-mobile-utility": registerTheme(
    "friendly-mobile-utility",
    friendlyMobileUtilityTheme,
  ),
  "editorial-utility": registerTheme(
    "editorial-utility",
    editorialUtilityTheme,
  ),
  "clean-personal-blog": registerTheme(
    "clean-personal-blog",
    cleanPersonalBlogTheme,
  ),
  "information-portal": registerTheme(
    "information-portal",
    informationPortalTheme,
  ),
});

export function getThemeModule<TId extends ThemeId>(
  themeId: TId,
): ThemeRegistry[TId] {
  return THEME_REGISTRY[themeId];
}
