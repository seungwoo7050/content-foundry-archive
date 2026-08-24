import type { Metadata } from "next";

export function createNotFoundRouteMetadata(): Metadata {
  const title = "페이지를 찾을 수 없습니다";
  const description = "요청한 주소의 페이지를 찾을 수 없습니다.";
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
