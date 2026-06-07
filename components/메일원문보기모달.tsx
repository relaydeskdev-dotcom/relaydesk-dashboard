"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { supabase } from "../lib/supabase";

type Props = {
  열림: boolean;
  닫기: () => void;
  userId: string;
  messageId: string | null;
  제목?: string;
  보낸사람?: string;
  gmailUrl?: string;
};

type AnyRow = Record<string, unknown>;
type 보기모드타입 = "읽기좋게" | "원본HTML";

function 값정리(value: unknown) {
  if (value === null || value === undefined) return "";

  const text = String(value).trim();

  if (
    !text ||
    text === "없음" ||
    text === "null" ||
    text === "undefined"
  ) {
    return "";
  }

  return text;
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, "$1 ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&zwnj;/gi, " ")
    .replace(/\u200c/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function html본문추출(row: AnyRow | null) {
  if (!row) return "";

  return (
    값정리(row["본문_html"]) ||
    값정리(row["본문 HTML"]) ||
    값정리(row["본문 html"]) ||
    값정리(row["body_html"]) ||
    값정리(row["html"]) ||
    값정리(row["textHtml"])
  );
}

function 텍스트본문추출(row: AnyRow | null) {
  if (!row) return "";

  return (
    값정리(row["본문"]) ||
    값정리(row["body"]) ||
    값정리(row["text"]) ||
    값정리(row["본문_text"]) ||
    값정리(row["본문 텍스트"]) ||
    값정리(row["plain_text"]) ||
    값정리(row["textPlain"])
  );
}

function 원문본문추출(row: AnyRow | null) {
  if (!row) return "";

  const textBody = 텍스트본문추출(row);
  if (textBody) return textBody;

  const htmlBody = html본문추출(row);
  if (htmlBody) return htmlToText(htmlBody);

  return "";
}

function 원문유형추정(row: AnyRow | null) {
  if (!row) return "알 수 없음";

  const textBody = 텍스트본문추출(row);
  const htmlBody = html본문추출(row);

  if (htmlBody && textBody) return "HTML 및 텍스트 본문";
  if (htmlBody) return "이미지/HTML 중심";
  if (textBody) return "텍스트 본문";

  return "본문 없음";
}

function 추출텍스트품질낮음(text: string) {
  const source = text.toLowerCase();

  const 가격패턴수 = (text.match(/₩[\d,]+/g) || []).length;
  const 할인패턴수 = (text.match(/-\d+%|\d+%/g) || []).length;
  const zwnj수 = (text.match(/&zwnj;|\u200c/g) || []).length;
  const 점문자반복수 = (text.match(/\. \.|\.\.\.|· ·/g) || []).length;

  const 구조신호 =
    source.includes("view more") ||
    source.includes("popular categories") ||
    source.includes("download to get") ||
    source.includes("app-only deals") ||
    source.includes("marketing emails") ||
    source.includes("privacy policy") ||
    source.includes("terms of use");

  return (
    zwnj수 >= 5 ||
    가격패턴수 >= 5 ||
    할인패턴수 >= 4 ||
    점문자반복수 >= 8 ||
    (구조신호 && 가격패턴수 >= 2)
  );
}
function 메일푸터제거(text: string): string {
  if (!text) return "";

  let 정리된텍스트 = text
    .replace(/\r\n|\r/g, "\n")
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u200c/g, " ")
    .replace(/&zwnj;/gi, " ")
    .trim();

  const 명확한푸터패턴 = [
    /이\s*알림은.{0,200}?이메일\s*주소로\s*전송되었습니다/gi,
    /이\s*메일은.{0,200}?이메일\s*주소로\s*전송되었습니다/gi,
    /본\s*(이메일|메일)은\s*발신\s*전용/gi,
    /본\s*(이메일|메일)은\s*자동으로\s*발송/gi,
    /이\s*(이메일|메일)은\s*자동으로\s*발송/gi,
    /본\s*(이메일|메일)에\s*답장하지\s*마세요/gi,
    /이\s*(이메일|메일)에\s*답장하지\s*마세요/gi,
    /this\s+(email|message)\s+was\s+sent\s+to/gi,
    /this\s+is\s+an\s+automated\s+(email|message)/gi,
    /please\s+do\s+not\s+reply\s+to\s+this\s+(email|message)/gi,
    /do\s+not\s+reply\s+to\s+this\s+(email|message)/gi,
    /view\s+(this\s+)?(email|message)\s+in\s+(your\s+)?browser/gi,
    /このメールは送信専用/gi,
    /このメールは自動送信/gi,
  ];

  const 최소허용위치 =
    정리된텍스트.length >= 200
      ? Math.floor(정리된텍스트.length * 0.15)
      : 0;

  let 푸터시작위치 = -1;

  for (const 패턴 of 명확한푸터패턴) {
    패턴.lastIndex = 0;
    let 일치: RegExpExecArray | null;

    while ((일치 = 패턴.exec(정리된텍스트)) !== null) {
      if (일치.index >= 최소허용위치) {
        if (푸터시작위치 === -1 || 일치.index < 푸터시작위치) {
          푸터시작위치 = 일치.index;
        }
        break;
      }

      if (일치[0].length === 0) {
        패턴.lastIndex += 1;
      }
    }
  }

  if (푸터시작위치 >= 0) {
    정리된텍스트 = 정리된텍스트
      .slice(0, 푸터시작위치)
      .trim();
  }

  return 정리된텍스트
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function 읽기좋게정리(text: string): string {
  const 푸터제거본문 = 메일푸터제거(text);

  return 푸터제거본문
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/https?:\/\/\S+/g, "[링크]")
    .replace(
      /(안녕하세요|감사합니다|Regards|Best regards|Thank you)/gi,
      "\n\n$1"
    )
    .replace(/([.!?。！？])\s+(?=[가-힣A-Za-z0-9])/g, "$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function 문단나누기(text: string) {
  const 정리된본문 = 읽기좋게정리(text);

  if (!정리된본문) return [];

  return 정리된본문
    .split(/\n+/)
    .map((문단) => 문단.trim())
    .filter(Boolean);
}

/**
 * 메일 HTML을 정제하고 독립된 iframe 문서로 만든다.
 *
 * iframe 내부에서 렌더링하므로 메일 CSS가
 * RelayDesk 대시보드에 영향을 주지 않는다.
 */
function 이메일HTML문서만들기(html: string) {
  if (!html || typeof window === "undefined") return "";

  const 정제된HTML = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    USE_PROFILES: {
      html: true,
    },
    FORBID_TAGS: [
      "script",
      "iframe",
      "frame",
      "frameset",
      "form",
      "input",
      "textarea",
      "select",
      "option",
      "button",
      "object",
      "embed",
      "applet",
      "video",
      "audio",
      "canvas",
      "svg",
      "math",
    ],
    FORBID_ATTR: [
      "srcdoc",
      "formaction",
      "autofocus",
      "contenteditable",
    ],
  });

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(정제된HTML, "text/html");

  // 자동 새로고침이나 외부 페이지 강제 이동 방지
  documentNode
    .querySelectorAll('meta[http-equiv="refresh"]')
    .forEach((element) => element.remove());

  documentNode.querySelectorAll("base").forEach((element) => element.remove());

  // 모든 링크는 RelayDesk 내부가 아니라 새 탭에서 열기
  documentNode.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const href = link.getAttribute("href") || "";

    if (
      !href ||
      href.startsWith("javascript:") ||
      href.startsWith("data:")
    ) {
      link.removeAttribute("href");
      return;
    }

    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // 메일 이미지 최적화 및 추적용 작은 이미지 제거
  documentNode.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
    const width = Number.parseInt(image.getAttribute("width") || "", 10);
    const height = Number.parseInt(image.getAttribute("height") || "", 10);

    const 작은추적이미지 =
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width <= 2 &&
      height <= 2;

    if (작은추적이미지) {
      image.remove();
      return;
    }

    image.setAttribute("loading", "lazy");
    image.setAttribute("referrerpolicy", "no-referrer");

    image.style.maxWidth = "100%";
    image.style.height = "auto";
  });

  // 요소에 직접 붙은 이벤트 속성을 한 번 더 제거
  documentNode.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  const 메일보정스타일 = documentNode.createElement("style");

  메일보정스타일.textContent = `
    html {
      width: 100%;
      min-height: 100%;
      background: #ffffff;
    }

    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      overflow-wrap: anywhere;
      background: #ffffff;
      color: #0f172a;
      font-family:
        Arial,
        "Apple SD Gothic Neo",
        "Noto Sans KR",
        sans-serif;
    }

    table {
      max-width: 100% !important;
    }

    img {
      max-width: 100% !important;
      height: auto !important;
    }

    a {
      cursor: pointer;
    }

    pre {
      max-width: 100%;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `;

  documentNode.head.appendChild(메일보정스타일);

  return `<!doctype html>${documentNode.documentElement.outerHTML}`;
}

function 기본보기모드결정(row: AnyRow): 보기모드타입 {
  const textBody = 텍스트본문추출(row);
  const htmlBody = html본문추출(row);

  if (!htmlBody) return "읽기좋게";
  if (!textBody) return "원본HTML";

  return 추출텍스트품질낮음(textBody)
    ? "원본HTML"
    : "읽기좋게";
}

export default function 메일원문보기모달({
  열림,
  닫기,
  userId,
  messageId,
  제목,
  보낸사람,
  gmailUrl,
}: Props) {
  const [로딩중, set로딩중] = useState(false);
  const [에러, set에러] = useState("");
  const [원문, set원문] = useState<AnyRow | null>(null);
  const [보기모드, set보기모드] =
    useState<보기모드타입>("읽기좋게");

  useEffect(() => {
    if (!열림) return;

    const 정리된UserId = String(userId || "").trim();
    const 정리된MessageId = String(messageId || "").trim();

    if (!정리된MessageId || 정리된MessageId === "없음") {
      set에러("원문을 조회할 수 없습니다.");
      return;
    }

    async function 원문가져오기() {
      set로딩중(true);
      set에러("");
      set원문(null);
      set보기모드("읽기좋게");

      const 정확조회 = await supabase
        .from("메일_원문")
        .select("*")
        .eq("user_id", 정리된UserId)
        .eq("message_id", 정리된MessageId)
        .limit(1);

      if (정확조회.error) {
        set에러(
          `원문 조회 중 문제가 발생했습니다: ${정확조회.error.message}`
        );
        set로딩중(false);
        return;
      }

      if (정확조회.data && 정확조회.data.length > 0) {
        const 조회된원문 = 정확조회.data[0] as AnyRow;

        set원문(조회된원문);

        set보기모드(기본보기모드결정(조회된원문));

        set로딩중(false);
        return;
      }

      const 메시지조회 = await supabase
        .from("메일_원문")
        .select("*")
        .eq("message_id", 정리된MessageId)
        .limit(1);

      if (메시지조회.error) {
        set에러(
          `원문 조회 중 문제가 발생했습니다: ${메시지조회.error.message}`
        );
        set로딩중(false);
        return;
      }

      if (메시지조회.data && 메시지조회.data.length > 0) {
        const 조회된원문 = 메시지조회.data[0] as AnyRow;

        set원문(조회된원문);

        set보기모드(기본보기모드결정(조회된원문));

        set로딩중(false);
        return;
      }

      set에러("저장된 원문을 찾을 수 없습니다.");
      set로딩중(false);
    }

    void 원문가져오기();
  }, [열림, messageId, userId]);

  const 표시본문 = 원문본문추출(원문);
  const 정리된표시본문 = 읽기좋게정리(표시본문);
  const html본문 = html본문추출(원문);
  const 본문유형 = 원문유형추정(원문);

  const 문단목록 = useMemo(() => {
    if (!정리된표시본문) return [];
    return 문단나누기(정리된표시본문);
  }, [정리된표시본문]);

  const 안전한HTML문서 = useMemo(() => {
    if (!html본문) return "";
    return 이메일HTML문서만들기(html본문);
  }, [html본문]);

  if (!열림) return null;

  const gmail링크존재 =
    Boolean(gmailUrl) && gmailUrl !== "없음";

  const 아무본문도없음 =
    !로딩중 &&
    !에러 &&
    Boolean(원문) &&
    !정리된표시본문 &&
    !html본문;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={닫기}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 상단 정보 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">
                원문 보기 테스트 2026
              </h2>

              {제목 && (
                <p className="mt-1 break-words text-sm text-slate-700">
                  <span className="font-semibold">제목:</span>{" "}
                  {제목}
                </p>
              )}

              {보낸사람 && (
                <p className="mt-1 break-words text-sm text-slate-700">
                  <span className="font-semibold">보낸 사람:</span>{" "}
                  {보낸사람}
                </p>
              )}

              {원문 && (
                <p className="mt-1 text-xs text-slate-500">
                  감지된 유형: {본문유형}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={닫기}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              닫기
            </button>
          </div>

          {/* 보기 방식 전환 */}
          {!로딩중 && !에러 && 원문 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {정리된표시본문 && (
                <button
                  type="button"
                  onClick={() => set보기모드("읽기좋게")}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    보기모드 === "읽기좋게"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  읽기 좋은 보기
                </button>
              )}

              {html본문 && (
                <button
                  type="button"
                  onClick={() => set보기모드("원본HTML")}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    보기모드 === "원본HTML"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  원본 디자인 보기
                </button>
              )}

              {gmail링크존재 && (
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Gmail에서 열기
                </a>
              )}
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
          {로딩중 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                원문을 불러오는 중...
              </p>
            </div>
          )}

          {에러 && !로딩중 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="whitespace-pre-wrap text-sm text-red-700">
                {에러}
              </p>
            </div>
          )}

          {!로딩중 &&
            !에러 &&
            보기모드 === "읽기좋게" &&
            정리된표시본문 && (
              <article className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
                <div className="space-y-4">
                  {문단목록.map((문단, index) => (
                    <p
                      key={`${index}-${문단.slice(0, 20)}`}
                      className="break-words text-sm leading-7 text-slate-800"
                    >
                      {문단}
                    </p>
                  ))}
                </div>
              </article>
            )}

          {!로딩중 &&
            !에러 &&
            보기모드 === "원본HTML" &&
            html본문 && (
              <div className="mx-auto max-w-5xl">
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs leading-5 text-amber-800">
                    메일 디자인을 최대한 유지해 표시합니다. 일부
                    상호작용 요소와 위험한 콘텐츠는 안전을 위해
                    제거됩니다.
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {안전한HTML문서 ? (
                    <iframe
                      title="메일 원본 HTML"
                      srcDoc={안전한HTML문서}
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      referrerPolicy="no-referrer"
                      className="h-[68vh] min-h-[500px] w-full border-0 bg-white"
                    />
                  ) : (
                    <div className="p-5">
                      <p className="text-sm text-slate-600">
                        HTML 본문을 표시하지 못했습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {아무본문도없음 && (
            <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">
                표시할 수 있는 본문이 없습니다.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                이미지가 Gmail 내부 참조 방식으로 포함되었거나 원문
                데이터가 저장되지 않았을 수 있습니다.
              </p>

              {gmail링크존재 && (
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Gmail에서 원문 확인
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}