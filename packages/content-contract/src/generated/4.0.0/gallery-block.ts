/* Generated from contract 4.0.0. Do not edit. */

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
