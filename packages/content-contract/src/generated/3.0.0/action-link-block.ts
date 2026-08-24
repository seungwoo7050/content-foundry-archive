/* Generated from contract 3.0.0. Do not edit. */

export type PublishedActionLinkBlock =
  | {
      type: "action-link";
      kind: "internal";
      label: string;
      path: string;
    }
  | {
      type: "action-link";
      kind: "official" | "affiliate";
      label: string;
      url: string;
    };
