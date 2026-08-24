import { BuildTargetConfigError } from "@content-foundry/site-core";

export class SiteLaunchReadinessError extends BuildTargetConfigError {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    const stableIssues = Object.freeze([...issues]);
    super(`Site A production launch is not ready: ${stableIssues.join("; ")}`);
    this.name = "SiteLaunchReadinessError";
    this.issues = stableIssues;
  }
}
