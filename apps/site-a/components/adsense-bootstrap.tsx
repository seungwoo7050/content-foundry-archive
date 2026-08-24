import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
} from "@content-foundry/advertising";

export function AdSenseBootstrap({
  publicClientId,
}: {
  readonly publicClientId: string | null;
}) {
  if (publicClientId === null) return null;
  if (!isAdSensePublicClientId(publicClientId)) {
    throw new AdvertisingConfigError(
      "AdSense bootstrap requires a valid public client ID",
    );
  }
  return (
    <>
      <meta name="google-adsense-account" content={publicClientId} />
      <script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publicClientId}`}
      />
    </>
  );
}
