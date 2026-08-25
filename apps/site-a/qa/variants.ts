import {
  SKIN_IDS,
  THEME_IDS,
  type SkinId,
  type ThemeId,
} from "@content-foundry/themes";

import type { QaReleaseOrigin, QaReleaseVariant } from "./release-facts";

export const QA_THEME_IDS = Object.freeze([
  "friendly-mobile-utility",
  "editorial-utility",
  "clean-personal-blog",
  "information-portal",
  "minimal-knowledge-base",
] as const satisfies readonly ThemeId[]);

export type QaVariantId = `${ThemeId}--${SkinId}`;
export type QaQualityVariant = QaReleaseVariant & {
  readonly id: QaVariantId;
};

export const QA_QUALITY_VARIANTS = Object.freeze(
  QA_THEME_IDS.flatMap((theme) => SKIN_IDS.map((skin) => Object.freeze({
    id: `${theme}--${skin}` as QaVariantId,
    theme,
    skin,
    origin: `https://${theme}-${skin}.qa.public-sites.example` as QaReleaseOrigin,
  }))),
);

if (new Set(QA_THEME_IDS).size !== THEME_IDS.length) {
  throw new Error("QA theme matrix does not cover the complete theme registry");
}
