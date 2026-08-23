export default function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <p>404</p>
      <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
      <p>
        주소가 바뀌었거나 존재하지 않는 페이지입니다. 생활메모 홈에서 최신 안내를
        확인해 주세요.
      </p>
      <p>
        {/* Static export intentionally uses native navigation without client code. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">생활메모 홈으로 돌아가기</a>
      </p>
    </section>
  );
}
