/* Generated from contract 2.0.0. Do not edit. */

export type PublishedContentBlock =
  | {
      type: "heading";
      id: string;
      level: number;
      text: string;
    }
  | {
      type: "paragraph";
      markdown: string;
    }
  | {
      type: "list";
      ordered: boolean;
      /**
       * @minItems 1
       */
      items: [string, ...string[]];
    }
  | {
      type: "quote";
      markdown: string;
      attribution?: string | null;
    }
  | {
      type: "callout";
      tone: "info" | "tip" | "warning" | "danger";
      markdown: string;
    }
  | {
      type: "image";
      mediaId: string;
      caption?: string | null;
    }
  | {
      type: "table";
      caption?: string | null;
      /**
       * @minItems 1
       */
      columns: [string, ...string[]];
      rows: [string, ...string[]][];
    }
  | {
      type: "embed";
      provider: string;
      url: string;
    };
export type PublishedStructuredContent = PublishedContentBlock[];

export interface PublishedStaticPageProjection {
  id: string;
  path: string;
  title: string;
  summary: string;
  content: PublishedStructuredContent;
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    index: boolean;
    follow: boolean;
  };
}
