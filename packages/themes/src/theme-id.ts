export const THEME_IDS = Object.freeze([
  "minimal-knowledge-base",
  "friendly-mobile-utility",
  "editorial-utility",
  "clean-personal-blog",
  "information-portal",
] as const);

export type ThemeId = (typeof THEME_IDS)[number];
