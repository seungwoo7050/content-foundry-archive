import { MANUAL_AD_UNITS_INPUT_NAME } from "@content-foundry/advertising";
import { resolveConsentBuildConfig } from "@content-foundry/site-core";
import type { ThemeAdSlots } from "@content-foundry/themes";

import {
  resolveSiteAdvertisingConfig,
  type SiteAdvertisingSource,
} from "./site-advertising-config";
import { createSiteAdSlots } from "./site-ad-slots";

export function resolveSiteAdSlots(
  context: SiteAdvertisingSource,
  environment: Readonly<Record<string, string | undefined>>,
): ThemeAdSlots {
  const consent = resolveConsentBuildConfig(environment);
  const advertising = resolveSiteAdvertisingConfig(
    context,
    consent,
    environment[MANUAL_AD_UNITS_INPUT_NAME],
  );
  return createSiteAdSlots(advertising);
}
