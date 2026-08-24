import { ContractError } from "./errors.js";

export const SUPPORTED_CONTRACT_VERSIONS = Object.freeze(["2.0.0"] as const);

export type SupportedContractVersion =
  (typeof SUPPORTED_CONTRACT_VERSIONS)[number];

export function resolveSupportedContractVersion(
  value: unknown,
): SupportedContractVersion {
  if (
    typeof value === "string" &&
    SUPPORTED_CONTRACT_VERSIONS.some((version) => version === value)
  ) {
    return value as SupportedContractVersion;
  }

  throw new ContractError(
    "CONTRACT_UNSUPPORTED",
    `Unsupported contract version: ${String(value)}`,
    [
      {
        path: "/contractVersion",
        message: `expected one of ${SUPPORTED_CONTRACT_VERSIONS.join(", ")}`,
      },
    ],
  );
}
