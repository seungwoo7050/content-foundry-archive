/* Generated from contract 2.0.0. Do not edit. */

export interface PublicSiteTaxonomy {
  categories: Taxon[];
  tags: Taxon[];
}
/**
 * This interface was referenced by `PublicSiteTaxonomy`'s JSON-Schema
 * via the `definition` "taxon".
 */
export interface Taxon {
  id: string;
  slug: string;
  label: string;
  description: string;
}
