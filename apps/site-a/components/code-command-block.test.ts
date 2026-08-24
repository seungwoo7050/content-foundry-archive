import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CodeCommandBlock } from "./code-command-block";

describe("CodeCommandBlock", () => {
  it("renders escaped code with its complete whitespace and visible kind", () => {
    const html = renderToStaticMarkup(
      createElement(CodeCommandBlock, {
        block: {
          type: "code",
          language: "html",
          code: ' \t<button type="button">\n  저장\n</button>\n',
          caption: "문자열 <마크업> 예시",
        },
      }),
    );

    expect(html).toContain(
      "문자열 &lt;마크업&gt; 예시 — 코드 (html)",
    );
    expect(html).toContain(
      "<pre><code> \t&lt;button type=&quot;button&quot;&gt;\n  저장\n&lt;/button&gt;\n</code></pre>",
    );
    expect(html).not.toContain('<button type="button">');
  });

  it("renders command input without adding a prompt or captured output", () => {
    const html = renderToStaticMarkup(
      createElement(CodeCommandBlock, {
        block: {
          type: "command",
          shell: "posix-sh",
          command: "git status --short\ngit diff --check",
          caption: "작업 트리 상태와 whitespace 확인",
        },
      }),
    );

    expect(html).toContain("작업 트리 상태와 whitespace 확인 — 명령 (posix-sh)");
    expect(html).toContain(
      "<pre><code>git status --short\ngit diff --check</code></pre>",
    );
    expect(html).not.toContain("$ git status");
    expect(html).not.toContain("실행");
  });

  it("renders an unknown language as inert plain preformatted text", () => {
    const html = renderToStaticMarkup(
      createElement(CodeCommandBlock, {
        block: {
          type: "code",
          language: "future-lang",
          code: "{{ dangerous.template }} <script>alert(1)</script>",
          caption: null,
        },
      }),
    );

    expect(html).toContain("코드 (future-lang)");
    expect(html).toContain(
      "{{ dangerous.template }} &lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("language-future-lang");
  });
});
