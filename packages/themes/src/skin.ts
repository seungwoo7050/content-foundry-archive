export const SKIN_IDS = Object.freeze([
  "calm-blue",
  "forest-green",
  "warm-neutral",
] as const);

export type SkinId = (typeof SKIN_IDS)[number];

export interface SemanticColorTokens {
  readonly canvas: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly text: string;
  readonly textMuted: string;
  readonly primary: string;
  readonly onPrimary: string;
  readonly border: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly focusRing: string;
}

export const SKIN_TOKENS: Readonly<Record<SkinId, SemanticColorTokens>> =
  Object.freeze({
    "calm-blue": Object.freeze({
      canvas: "#F6F8FC",
      surface: "#FFFFFF",
      surfaceMuted: "#EAF3FF",
      text: "#13213A",
      textMuted: "#5F6D84",
      primary: "#245BCC",
      onPrimary: "#FFFFFF",
      border: "#CBD8EB",
      success: "#177245",
      warning: "#8A4B08",
      danger: "#B42318",
      focusRing: "#174AAD",
    }),
    "forest-green": Object.freeze({
      canvas: "#F4F8F4",
      surface: "#FFFFFF",
      surfaceMuted: "#E7F2EA",
      text: "#15251B",
      textMuted: "#506258",
      primary: "#236B3B",
      onPrimary: "#FFFFFF",
      border: "#C6D8CA",
      success: "#236B3B",
      warning: "#865A05",
      danger: "#A62A23",
      focusRing: "#17522C",
    }),
    "warm-neutral": Object.freeze({
      canvas: "#FAF7F2",
      surface: "#FFFDF9",
      surfaceMuted: "#F3EBDD",
      text: "#2B2118",
      textMuted: "#65584C",
      primary: "#81501D",
      onPrimary: "#FFFFFF",
      border: "#DDD0BC",
      success: "#35683A",
      warning: "#875A08",
      danger: "#A2382D",
      focusRing: "#6B3E12",
    }),
  });
