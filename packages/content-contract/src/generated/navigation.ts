/* Generated from contract 2.0.0. Do not edit. */

export interface PublicSiteNavigation {
  items: Item[];
}
/**
 * This interface was referenced by `PublicSiteNavigation`'s JSON-Schema
 * via the `definition` "item".
 */
export interface Item {
  id: string;
  label: string;
  path: string;
  children: Item[];
}
