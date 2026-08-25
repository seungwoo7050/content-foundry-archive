export const QA_MEDIA_ASSET_IDS = [
  "MED-QA-001",
  "MED-QA-002",
  "MED-QA-003",
  "MED-QA-004",
  "MED-QA-005",
] as const;

export type QaMediaAssetId = (typeof QA_MEDIA_ASSET_IDS)[number];

export type QaMediaAsset = {
  readonly id: QaMediaAssetId;
  readonly sourcePath: `assets/${string}.webp`;
  readonly sha256: string;
  readonly bytes: number;
  readonly mimeType: "image/webp";
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly credit: string;
  readonly license: string;
};

const QA_CREDIT = "OpenAI 내장 이미지 생성·합성 QA 검증 자산";
const QA_LICENSE = "QA 전용·운영/재배포 미승인";

export const qaMediaAssets = [
  {
    id: "MED-QA-001",
    sourcePath: "assets/abstract-layers.webp",
    sha256: "a2b9671753ea1d4818b3c673d356e3d9cd0f2a19af034b1e5433dec571157c93",
    bytes: 139_542,
    mimeType: "image/webp",
    width: 1_536,
    height: 1_024,
    alt: "QA 비운영 검증용 겹친 평면과 곡선의 추상 이미지",
    credit: QA_CREDIT,
    license: QA_LICENSE,
  },
  {
    id: "MED-QA-002",
    sourcePath: "assets/abstract-flow.webp",
    sha256: "8ea5e34289f531f5f490a9b6012f7c44d0ac10efed01a2ac25585c082bad09dd",
    bytes: 281_438,
    mimeType: "image/webp",
    width: 1_536,
    height: 1_024,
    alt: "QA 비운영 검증용 접힌 리본과 평면의 추상 이미지",
    credit: QA_CREDIT,
    license: QA_LICENSE,
  },
  {
    id: "MED-QA-003",
    sourcePath: "assets/abstract-panels.webp",
    sha256: "6beff46d7716cae59d84a2a2e0bf51a6938d54bb4755d6090d537adb82abc6ad",
    bytes: 179_950,
    mimeType: "image/webp",
    width: 1_536,
    height: 1_024,
    alt: "QA 비운영 검증용 패널과 원형 요소의 추상 이미지",
    credit: QA_CREDIT,
    license: QA_LICENSE,
  },
  {
    id: "MED-QA-004",
    sourcePath: "assets/abstract-arches.webp",
    sha256: "1a9cb8b6d6b51ef0df25f0293d434f4a8cc25eabf3e6998ea1e6f308351a9bf5",
    bytes: 134_174,
    mimeType: "image/webp",
    width: 1_536,
    height: 1_024,
    alt: "QA 비운영 검증용 아치와 원형 요소의 추상 이미지",
    credit: QA_CREDIT,
    license: QA_LICENSE,
  },
  {
    id: "MED-QA-005",
    sourcePath: "assets/qa-favicon.webp",
    sha256: "3105983465aee757f79a64d3958097131577992f7121ecac357aa9c3ca82b82b",
    bytes: 188_872,
    mimeType: "image/webp",
    width: 1_254,
    height: 1_254,
    alt: "QA 비운영 검증용 세 가지 겹친 도형의 추상 아이콘",
    credit: QA_CREDIT,
    license: QA_LICENSE,
  },
] as const satisfies readonly QaMediaAsset[];
