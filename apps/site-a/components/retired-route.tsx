interface RetiredRouteProps {
  readonly path: string;
  readonly replacementPath: string | null;
}

export function RetiredRoute({
  path,
  replacementPath,
}: RetiredRouteProps) {
  const destination = replacementPath ?? "/archive";
  const destinationLabel = replacementPath
    ? "대신 볼 수 있는 안내로 이동"
    : "전체 글 보기";

  return (
    <section className="retired-page" aria-labelledby="retired-route-title">
      <p>410</p>
      <h1 id="retired-route-title">더 이상 제공하지 않는 페이지입니다</h1>
      <p>
        <code>{path}</code> 주소의 콘텐츠는 더 이상 제공하지 않습니다.
      </p>
      <p>
        {/* Static export intentionally uses native navigation without client code. */}
        <a href={destination}>{destinationLabel}</a>
      </p>
    </section>
  );
}
