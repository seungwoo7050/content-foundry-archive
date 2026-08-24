import type { PublishedContentBlockV4 } from "@content-foundry/content-contract";

import { createQaArticle } from "./corpus-factory";

const richContent: PublishedContentBlockV4[] = [
  { type: "heading", id: "qa-structure", level: 2, text: "QA 비운영 구조 검증" },
  {
    type: "paragraph",
    markdown: "실제 정보가 아닌 렌더링 검증용 긴 합성 본문입니다.",
  },
  {
    type: "table",
    caption: "QA 합성 표",
    columns: ["항목", "값"],
    rows: [["상태", "비운영"]],
  },
  {
    type: "code",
    language: "javascript",
    code: "const mode = 'qa-only';",
    caption: "QA 합성 코드",
  },
  { type: "command", shell: "sh", command: "printf 'qa-only\\n'", caption: "QA 합성 명령" },
  {
    type: "gallery",
    caption: "QA 중립 추상 이미지",
    items: [{ mediaId: "MED-QA-001" }, { mediaId: "MED-QA-002" }],
  },
  {
    type: "callout",
    tone: "warning",
    markdown: "QA 비운영 자료를 실제 안내로 사용하지 마세요.",
  },
  { type: "action-link", kind: "internal", label: "QA 연락 화면 확인", path: "/contact" },
];

const richArticle = createQaArticle({
  index: 1,
  categoryId: "field-notes",
  title:
    "QA 비운영 환경에서 매우 긴 한국어 제목과 다양한 구조화 블록의 " +
    "줄바꿈 및 정보 계층을 함께 검증하는 합성 안내",
  slug:
    "qa-nonproduction-very-long-korean-title-layout-table-code-command-" +
    "gallery-faq-source-update-related-action",
  updatedAt: "2026-08-24T02:30:00Z",
  content: richContent,
  toc: [{ id: "qa-structure", text: "QA 비운영 구조 검증", level: 2 }],
  faq: [
    {
      question: "이 자료는 실제 안내인가요?",
      answerMarkdown: "아니요. QA 비운영 합성 자료입니다.",
    },
  ],
  sourceDisclosures: [
    {
      label: "QA 합성 출처",
      url: "https://source.qa.public-sites.example/synthetic-reference",
    },
  ],
  relatedArticleIds: ["ART-QA-002"],
  updateTriggers: ["QA fixture 구조가 변경될 때"],
});
const shortArticle = createQaArticle({
  index: 2,
  categoryId: "field-notes",
  title: "QA 비운영 짧은 글",
  slug: "qa-short",
  content: [{ type: "paragraph", markdown: "QA 전용입니다." }],
});
const denseArticles = Array.from({ length: 11 }, (_, offset) =>
  createQaArticle({ index: offset + 3, categoryId: "field-notes" }),
);
const remainingArticles = ["patterns", "reference", "studio", "updates"].map(
  (categoryId, offset) => createQaArticle({ index: offset + 14, categoryId }),
);

export const qaArticles = [
  richArticle,
  shortArticle,
  ...denseArticles,
  ...remainingArticles,
];
