/* Generated from contract 3.0.0. Do not edit. */

export interface PublicSiteReleaseManifest {
  contractVersion: "3.0.0";
  releaseId: string;
  siteId: string;
  createdAt: string;
  contentRevision: number;
  siteConfigRevision: number;
  articleCount: number;
  pageCount: number;
  defaultTheme:
    | "editorial-utility"
    | "clean-personal-blog"
    | "information-portal"
    | "minimal-knowledge-base"
    | "friendly-mobile-utility";
  defaultSkin: string;
  bundleChecksum: string;
}
