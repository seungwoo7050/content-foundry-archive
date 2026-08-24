import { describe, expect, it } from "vitest";

import {
  resolveSupportedContractVersion,
  SUPPORTED_CONTRACT_VERSIONS,
} from "./contract-version.js";

describe("resolveSupportedContractVersion", () => {
  it("resolves the complete supported version range", () => {
    expect(SUPPORTED_CONTRACT_VERSIONS).toEqual(["2.0.0", "3.0.0", "4.0.0"]);
    expect(resolveSupportedContractVersion("2.0.0")).toBe("2.0.0");
    expect(resolveSupportedContractVersion("3.0.0")).toBe("3.0.0");
    expect(resolveSupportedContractVersion("4.0.0")).toBe("4.0.0");
  });

  it.each(["5.0.0", undefined, 2])(
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
