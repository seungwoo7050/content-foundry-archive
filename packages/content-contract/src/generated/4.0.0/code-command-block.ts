/* Generated from contract 4.0.0. Do not edit. */

export type PublishedCodeOrCommandBlock =
  | {
      type: "code";
      language: string;
      code: string;
      caption?: string | null;
    }
  | {
      type: "command";
      shell: string;
      command: string;
      caption?: string | null;
    };
