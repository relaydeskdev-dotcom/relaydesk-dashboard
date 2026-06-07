"use client";

import { useEffect, useState } from "react";
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
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&zwnj;/gi, " ")
    .replace(/\u200c/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
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

  if (textBody) return "텍스트 본문";
  if (htmlBody) return "이미지/HTML 중심";
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


function 읽기좋게정리(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/https?:\/\/\S+/g, "[링크]")
    .replace(/([.!?。！？])\s+/g, "$1\n")
    .replace(/(안녕하세요|감사합니다|Regards|Best regards|Thank you)/gi, "\n$1")
    .trim();
}

function 문단나누기(text: string): string[] {
  return 읽기좋게정리(text)
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter(Boolean);
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
  const [추출본문열림, set추출본문열림] = useState(false);

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
      set추출본문열림(false);

      const 정확조회 = await supabase
        .from("메일_원문")
        .select("*")
        .eq("user_id", 정리된UserId)
        .eq("message_id", 정리된MessageId)
        .limit(1);

      if (정확조회.error) {
        set에러(`원문 조회 중 문제가 발생했습니다: ${정확조회.error.message}`);
        set로딩중(false);
        return;
      }

      if (정확조회.data && 정확조회.data.length > 0) {
        set원문(정확조회.data[0] as AnyRow);
        set로딩중(false);
        return;
      }

      const 메시지조회 = await supabase
        .from("메일_원문")
        .select("*")
        .eq("message_id", 정리된MessageId)
        .limit(1);

      if (메시지조회.error) {
        set에러(`원문 조회 중 문제가 발생했습니다: ${메시지조회.error.message}`);
        set로딩중(false);
        return;
      }

      if (메시지조회.data && 메시지조회.data.length > 0) {
        set원문(메시지조회.data[0] as AnyRow);
        set로딩중(false);
        return;
      }

      set에러("저장된 원문을 찾을 수 없습니다.");
      set로딩중(false);
    }

    원문가져오기();
  }, [열림, messageId, userId]);

  if (!열림) return null;

  const 표시본문 = 원문본문추출(원문);
  const html본문 = html본문추출(원문);
  const 본문유형 = 원문유형추정(원문);
  const 텍스트품질낮음 = 표시본문 ? 추출텍스트품질낮음(표시본문) : false;

  const 안내카드필요 =
    원문 && !로딩중 && !에러 && (!표시본문 || 텍스트품질낮음);

  const 일반본문표시 =
    원문 && !로딩중 && !에러 && 표시본문 && !텍스트품질낮음;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={닫기}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">원문 보기</h2>

            {제목 && (
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold">제목:</span> {제목}
              </p>
            )}

            {보낸사람 && (
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold">보낸 사람:</span> {보낸사람}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={닫기}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto rounded-xl border bg-slate-50 p-4">
          {로딩중 && (
            <p className="text-sm text-slate-500">원문을 불러오는 중...</p>
          )}

          {에러 && !로딩중 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-red-700">
                {에러}
              </p>
            </div>
          )}

        {일반본문표시 && (
  <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
    {표시본문}
  </pre>
)}

          {안내카드필요 && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  이 메일은 이미지 또는 HTML 중심으로 구성된 메일입니다.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  텍스트 추출 결과가 제한적이거나 원문 배치와 다르게 보일 수
                  있습니다. 이미지, 버튼, 상품 정보, 표 형태의 내용은 원문에서
                  확인하는 편이 더 정확합니다.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <p>
                  감지된 원문 유형:{" "}
                  <span className="font-semibold text-slate-800">
                    {본문유형}
                  </span>
                </p>

                {html본문 && (
                  <p className="mt-1">
                    HTML 본문이 저장되어 있으나, 텍스트 변환 결과가 제한적일 수
                    있습니다.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {gmailUrl && gmailUrl !== "없음" && (
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Gmail에서 원문 보기
                  </a>
                )}

                {표시본문 && (
                  <button
                    type="button"
                    onClick={() => set추출본문열림((prev) => !prev)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {추출본문열림
                      ? "추출 텍스트 숨기기"
                      : "추출 텍스트 보기"}
                  </button>
                )}
              </div>

              {추출본문열림 && 표시본문 && (
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                  {표시본문}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}