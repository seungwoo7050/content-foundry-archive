import { describe, expect, it } from "vitest";

import { createAdsTxtRecord } from "./ads-txt.js";
import { AdvertisingConfigError } from "./provider.js";

describe("AdSense ads.txt record", () => {
  it("derives exactly one direct Google record from the validated client", () => {
    const record = createAdsTxtRecord("ca-pub-1234567890123456");

    expect(record).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0",
    );
    expect(record.split("\n")).toHaveLength(1);
  });

  it.each([
    "pub-1234567890123456",
    "ca-pub-123",
    "ca-pub-123456789012345x",
  ])("fails closed for malformed client ID %j", (clientId) => {
    expect(() => createAdsTxtRecord(clientId)).toThrow(AdvertisingConfigError);
  });
});
