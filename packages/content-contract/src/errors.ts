export type ContractErrorCode =
  | "CONTRACT_UNSUPPORTED"
  | "CONTRACT_INVALID"
  | "REFERENCE_INVALID"
  | "INTEGRITY_FAILED"
  | "BUILD_FAILED"
  | "DEPLOY_FAILED"
  | "VERIFY_FAILED"
  | "CONFLICT"
  | "TEMPORARY"
  | "PERMANENT";

export interface ContractIssue {
  readonly path: string;
  readonly message: string;
}

export class ContractError extends Error {
  readonly code: ContractErrorCode;
  readonly issues: readonly ContractIssue[];
  readonly retryable: boolean;

  constructor(
    code: ContractErrorCode,
    message: string,
    issues: readonly ContractIssue[] = [],
    retryable = false,
  ) {
    super(message);
    this.name = "ContractError";
    this.code = code;
    this.issues = issues;
    this.retryable = retryable;
  }
}
