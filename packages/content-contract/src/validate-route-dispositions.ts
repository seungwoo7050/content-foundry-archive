import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocuments } from "./read-bundle-documents.js";

export function validateRouteDispositions(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];
  const sourcePaths = new Map<string, number>();
  const redirects = new Map<string, { readonly index: number; readonly to: string }>();

  bundle.redirects.items.forEach((item, index) => {
    const source = item.type === "redirect" ? item.fromPath : item.path;
    const firstIndex = sourcePaths.get(source);
    if (firstIndex !== undefined) {
      issues.push({
        path: `/redirects/items/${index}`,
        message: `duplicate source path ${source}; first declared at /redirects/items/${firstIndex}`,
      });
    } else {
      sourcePaths.set(source, index);
    }

    if (item.type === "redirect") {
      if (item.fromPath === item.toPath) {
        issues.push({
          path: `/redirects/items/${index}/toPath`,
          message: "self-redirect is forbidden",
        });
      } else if (!redirects.has(item.fromPath)) {
        redirects.set(item.fromPath, { index, to: item.toPath });
      }
    }
  });

  const state = new Map<string, "visiting" | "visited">();
  const visit = (path: string) => {
    state.set(path, "visiting");
    const redirect = redirects.get(path);
    if (redirect) {
      const nextState = state.get(redirect.to);
      if (nextState === "visiting") {
        issues.push({
          path: `/redirects/items/${redirect.index}/toPath`,
          message: `redirect cycle reaches ${redirect.to}`,
        });
      } else if (!nextState && redirects.has(redirect.to)) {
        visit(redirect.to);
      }
    }
    state.set(path, "visited");
  };

  for (const path of redirects.keys()) {
    if (!state.has(path)) visit(path);
  }

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Route dispositions are inconsistent",
      issues,
    );
  }
  return bundle;
}
