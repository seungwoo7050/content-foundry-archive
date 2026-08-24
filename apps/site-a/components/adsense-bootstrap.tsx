import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";

export function AdSenseBootstrap({
  config,
}: {
  readonly config: AdvertisingProviderConfig;
}) {
  if (config.provider === "disabled") return null;
  if (!isAdSensePublicClientId(config.publicClientId)) {
    throw new AdvertisingConfigError(
      "AdSense bootstrap requires a valid public client ID",
    );
  }
  return (
    <>
      <meta name="google-adsense-account" content={config.publicClientId} />
      <script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publicClientId}`}
      />
    </>
  );
}
