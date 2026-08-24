import {
  AnalyticsConfigError,
  isGa4MeasurementId,
  type AnalyticsProviderConfig,
} from "@content-foundry/analytics";

function createGa4Source(measurementId: string): string {
  return `gtag('js', new Date());\ngtag('config', '${measurementId}');`;
}

export function Ga4Tag({
  config,
}: {
  readonly config: AnalyticsProviderConfig;
}) {
  if (config.provider === "disabled") return null;
  if (!isGa4MeasurementId(config.publicMeasurementId)) {
    throw new AnalyticsConfigError("GA4 tag requires a valid measurement ID");
  }
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${config.publicMeasurementId}`}
      />
      <script>{createGa4Source(config.publicMeasurementId)}</script>
    </>
  );
}
