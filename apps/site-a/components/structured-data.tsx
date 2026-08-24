interface StructuredDataProps {
  readonly value: Readonly<Record<string, unknown>>;
}

export function StructuredData({ value }: StructuredDataProps) {
  const serialized = JSON.stringify(value).replaceAll("<", "\\u003c");
  return <script type="application/ld+json">{serialized}</script>;
}
