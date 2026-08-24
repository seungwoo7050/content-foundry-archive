import type { CSSProperties } from "react";

import type { SemanticColorTokens } from "../skin.js";

type PersonalVariables = CSSProperties & Record<`--personal-${string}`, string>;

export function createPersonalColorStyle(
  colors: SemanticColorTokens,
): PersonalVariables {
  return {
    "--personal-canvas": colors.canvas,
    "--personal-surface": colors.surface,
    "--personal-surface-muted": colors.surfaceMuted,
    "--personal-text": colors.text,
    "--personal-text-muted": colors.textMuted,
    "--personal-primary": colors.primary,
    "--personal-on-primary": colors.onPrimary,
    "--personal-border": colors.border,
    "--personal-success": colors.success,
    "--personal-warning": colors.warning,
    "--personal-danger": colors.danger,
    "--personal-focus-ring": colors.focusRing,
  };
}
