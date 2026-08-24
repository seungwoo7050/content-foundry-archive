import type { ThemeAdSlots } from "@content-foundry/themes";

import { createSiteAdSlots } from "./site-ad-slots";
import {
  resolveSiteProviderConfig,
  type SiteProviderSource,
} from "./site-provider-config";

export function resolveSiteAdSlots(
  context: SiteProviderSource,
  environment: Readonly<Record<string, string | undefined>>,
): ThemeAdSlots {
  return createSiteAdSlots(
    resolveSiteProviderConfig(context, environment).advertising,
  );
}
