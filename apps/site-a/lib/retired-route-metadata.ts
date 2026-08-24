import type { Metadata } from "next";

export function createRetiredRouteMetadata(): Metadata {
  const title = "더 이상 제공하지 않는 페이지";
  const description = "이 주소의 콘텐츠는 더 이상 제공하지 않습니다.";
  return {
    title,
    description,
    alternates: { canonical: null },
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      images: [],
    },
    twitter: { card: "summary", title, description, images: [] },
  };
}
