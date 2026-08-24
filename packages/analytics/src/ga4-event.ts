import {
  createAnalyticsEventPayload,
  type AnalyticsEventName,
  type AnalyticsEventPayload,
} from "./event-payload.js";

export type Ga4EventParameter = string | number;
export type Ga4EventCall = readonly [
  "event",
  AnalyticsEventName,
  Readonly<Record<string, Ga4EventParameter>>,
];

const toSnakeCase = (key: string) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function toGa4EventCall(value: AnalyticsEventPayload): Ga4EventCall {
  const payload = createAnalyticsEventPayload(value);
  const entries = Object.entries(payload)
    .filter(([key]) => key !== "eventName")
    .map(([key, parameter]) =>
      [toSnakeCase(key), parameter as Ga4EventParameter] as const)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  const parameters = Object.freeze(Object.fromEntries(entries));

  return Object.freeze(["event", payload.eventName, parameters] as const);
}
