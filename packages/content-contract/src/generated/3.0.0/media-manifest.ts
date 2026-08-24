/* Generated from contract 3.0.0. Do not edit. */

export interface MediaManifest {
  items: {
    id: string;
    kind: "image";
    source: "bundle" | "immutable-object";
    path: string;
    sha256: string;
    mimeType: string;
    width: number;
    height: number;
    bytes: number;
    alt: string;
    credit: string | null;
    license: string | null;
  }[];
}
