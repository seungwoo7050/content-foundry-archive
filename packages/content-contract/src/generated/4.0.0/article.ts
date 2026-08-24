/* Generated from contract 4.0.0. Do not edit. */

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
    }
  | PublishedGalleryBlock
  | PublishedCodeOrCommandBlock
  | PublishedActionLinkBlock
  | PublishedNicheComponentBlock;
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
export type PublishedStructuredContent = PublishedContentBlock[];

export interface PublishedArticleProjection {
  id: string;
  revision: number;
  slug: string;
  title: string;
  summary: string;
  status: "published";
  categoryId: string;
  tagIds: string[];
  author: {
    displayName: string;
    profileId: string;
  };
  publishedAt: string;
  updatedAt: string;
  content: PublishedStructuredContent;
  toc: {
    id: string;
    text: string;
    level: number;
  }[];
  faq: {
    question: string;
    answerMarkdown: string;
  }[];
  sourceDisclosures: {
    label: string;
    url: string;
  }[];
  relatedArticleIds: string[];
  heroMediaId: string | null;
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    index: boolean;
    follow: boolean;
  };
  advertising: {
    enabled: boolean;
  };
  updateTriggers: string[];
}
export interface PublishedGalleryBlock {
  type: "gallery";
  caption?: string | null;
  /**
   * @minItems 2
   */
  items: [
    {
      mediaId: string;
      caption?: string | null;
    },
    {
      mediaId: string;
      caption?: string | null;
    },
    ...{
      mediaId: string;
      caption?: string | null;
    }[]
  ];
}
export interface PublishedNicheComponentBlock {
  type: "niche-component";
  componentId: string;
  label: string;
  fallbackText: string;
}
