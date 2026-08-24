import { describe, expect, it } from "vitest";

import {
  resolveSupportedContractVersion,
  SUPPORTED_CONTRACT_VERSION,
  SUPPORTED_CONTRACT_VERSIONS,
} from "./contract-version.js";

describe("resolveSupportedContractVersion", () => {
  it("resolves the complete supported v2 version", () => {
    expect(SUPPORTED_CONTRACT_VERSIONS).toEqual(["2.0.0"]);
    expect(SUPPORTED_CONTRACT_VERSION).toBe("2.0.0");
    expect(resolveSupportedContractVersion("2.0.0")).toBe("2.0.0");
  });

  it.each(["3.0.0", "4.0.0", undefined, 2])(
    "rejects unsupported version %s",
    (version) => {
      expect(() => resolveSupportedContractVersion(version)).toThrowError(
        expect.objectContaining({
          code: "CONTRACT_UNSUPPORTED",
          issues: [expect.objectContaining({ path: "/contractVersion" })],
        }),
      );
    },
  );
});
