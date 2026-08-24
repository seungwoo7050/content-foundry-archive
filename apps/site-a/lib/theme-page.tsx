import type { ReactNode } from "react";

import {
  getThemeModule,
  SKIN_TOKENS,
  type HtmlRouteViewModel,
  type SkinId,
  type ThemeId,
  type ThemeRenderContext,
} from "@content-foundry/themes";

import {
  createThemeShellViewModel,
  type ThemeShellSource,
} from "./theme-shell-view-model";

export interface ThemePageSource extends ThemeShellSource {
  readonly site: ThemeShellSource["site"] & {
    readonly defaultTheme: ThemeId;
    readonly defaultSkin: string;
  };
}

function resolveSkin(skinId: string): ThemeRenderContext {
  if (!Object.hasOwn(SKIN_TOKENS, skinId)) {
    throw new Error(`Unknown theme skin: ${skinId}`);
  }
  const knownSkinId = skinId as SkinId;
  return { skinId: knownSkinId, colors: SKIN_TOKENS[knownSkinId] };
}

export function renderThemePage(
  bundle: ThemePageSource,
  route: HtmlRouteViewModel,
): ReactNode {
  const theme = getThemeModule(bundle.site.defaultTheme);
  if (!theme || theme.id !== bundle.site.defaultTheme) {
    throw new Error(`Unknown theme: ${bundle.site.defaultTheme}`);
  }
  return theme.renderRoute(
    { shell: createThemeShellViewModel(bundle), route },
    resolveSkin(bundle.site.defaultSkin),
  );
}
