/* Generated from contract 4.0.0. Do not edit. */

/**
 * This interface was referenced by `PublicRouteDispositions`'s JSON-Schema
 * via the `definition` "path".
 */
export type Path = string;

export interface PublicRouteDispositions {
  items: (Redirect | Gone)[];
}
/**
 * This interface was referenced by `PublicRouteDispositions`'s JSON-Schema
 * via the `definition` "redirect".
 */
export interface Redirect {
  type: "redirect";
  fromPath: Path;
  toPath: Path;
  status: 301 | 308;
}
/**
 * This interface was referenced by `PublicRouteDispositions`'s JSON-Schema
 * via the `definition` "gone".
 */
export interface Gone {
  type: "gone";
  path: Path;
  status: 410;
  replacementPath: Path | null;
}
