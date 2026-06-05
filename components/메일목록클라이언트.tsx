"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import 메일원문보기모달 from "./메일원문보기모달";

export type EmailRow = {
  id: string | number;

  user_id?: string | null;
  message_id?: string | null;

  "중요메일"?: boolean | null;

  gmail_thread_id?: string | null;
  gmail_url?: string | null;

  "최종 분류"?: string | null;
  긴급도?: string | null;
  제목?: string | null;
  "보낸 사람"?: string | null;
  "본문 요약"?: string | null;
  상태?: string | null;
  "추가 정보"?: unknown;
  "수신 시각"?: string | null;

  created_at?: string | null;
};

type ExtraInfo = {
  링크?: string[] | string;
  링크라벨?: string;
  첨부파일?: string[] | string;

  주요링크?: string[] | string;
  첨부파일명?: string[] | string;
  대표이미지?: string;
  본문유형?: string;
};


function 값(row: EmailRow, key: keyof EmailRow) {
  const v = row[key];

  if (v === null || v === undefined) return "";
  return String(v);
}

function 배열화(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .filter((item) => item !== "없음");
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text || text === "없음" || text === "-") return [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return 배열화(parsed);
    } catch {}

    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => item !== "없음");
  }

  return [];
}

function 추가정보파싱(raw: unknown): ExtraInfo {
  if (!raw) return {};

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ExtraInfo;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as ExtraInfo;
      }
    } catch {}
  }

  return {};
}

function 표시날짜(value: string) {
  if (!value || value === "-" || value === "없음") return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function 시간점수용(row: EmailRow) {
  const 수신시각 = 값(row, "수신 시각");
  const 생성시각 = 값(row, "created_at");

  const 수신시간 = new Date(수신시각).getTime();
  if (Number.isFinite(수신시간)) return 수신시간;

  const 생성시간 = new Date(생성시각).getTime();
  if (Number.isFinite(생성시간)) return 생성시간;

  return 0;
}

function 발신자파싱(sender: string) {
  const source = sender.trim();

  if (!source || source === "없음") {
    return {
      name: "-",
      email: "",
    };
  }

  const emailMatch = source.match(/<([^>]+)>/);
  const email = emailMatch?.[1]?.trim() ?? "";

  const name = source
    .replace(/<[^>]+>/g, "")
    .replace(/^"|"$/g, "")
    .trim();

  return {
    name: name || email || source,
    email,
  };
}

function 배지색상(type: string) {
  switch (type) {
    case "업무":
      return "bg-blue-50 text-blue-700";
    case "광고":
      return "bg-yellow-100 text-yellow-700";
    case "스팸":
      return "bg-red-100 text-red-700";
    case "결제알림":
      return "bg-emerald-100 text-emerald-700";
    case "서비스알림":
      return "bg-slate-100 text-slate-700";
    case "보안알림":
      return "bg-red-100 text-red-700";
    case "검토필요":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function 긴급도색상(type: string) {
  switch (type) {
    case "높음":
      return "bg-red-100 text-red-700";
    case "보통":
      return "bg-yellow-100 text-yellow-700";
    case "낮음":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function 상태색상(type: string) {
  switch (type) {
    case "즉시응답필요":
      return "bg-red-100 text-red-700";
    case "응답필요":
      return "bg-blue-100 text-blue-700";
    case "확인필요":
      return "bg-yellow-100 text-yellow-700";
    case "응답불필요":
      return "bg-slate-100 text-slate-700";
    case "검토필요":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap break-keep rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function ExtraInfoView({ raw }: { raw: unknown }) {
  const info = 추가정보파싱(raw);

  const 링크목록 = 배열화(info.링크).length
    ? 배열화(info.링크)
    : 배열화(info.주요링크);

  const 첨부목록 = 배열화(info.첨부파일).length
    ? 배열화(info.첨부파일)
    : 배열화(info.첨부파일명);

  const 대표링크 = 링크목록[0];

  if (!대표링크 && 첨부목록.length === 0) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <div className="space-y-2 text-xs text-slate-600">
      {대표링크 && (
        <div className="min-w-0">
          <div className="mb-1 font-semibold text-slate-700">링크</div>

          <a
            href={대표링크}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            링크 열기
          </a>

          <div className="mt-1 max-w-[120px] truncate text-[11px] text-slate-500">
            {대표링크}
          </div>
        </div>
      )}

      {첨부목록.length > 0 && (
        <div className="text-xs text-slate-600">첨부 {첨부목록.length}개</div>
      )}
    </div>
  );
}

export default function 메일목록클라이언트({
  emails,
}: {
  emails: EmailRow[];
}) {

 async function 중요메일토글(email: EmailRow) {
  const 현재값 = Boolean(email["중요메일"]);
  const 다음값 = !현재값;

  const emailId = email.id;
  const userId = 값(email, "user_id");
  const messageId = 값(email, "message_id");

  console.log("중요 메일 토글 시작:", {
    emailId,
    userId,
    messageId,
    현재값,
    다음값,
  });

  // 화면 먼저 반영
  set메일목록((prev) =>
    prev.map((item) =>
      item.id === email.id ? { ...item, 중요메일: 다음값 } : item
    )
  );

  try {
    // 1차: id 기준 업데이트
    let 업데이트결과 = await supabase
      .from("emails")
      .update({ 중요메일: 다음값 })
      .eq("id", emailId)
      .select("*");

    console.log("중요 메일 id 기준 업데이트 결과:", 업데이트결과);

    if (업데이트결과.error) {
      throw 업데이트결과.error;
    }

    // id 기준으로 업데이트된 row가 없으면 user_id + message_id 기준 재시도
    if (!업데이트결과.data || 업데이트결과.data.length === 0) {
      업데이트결과 = await supabase
        .from("emails")
        .update({ 중요메일: 다음값 })
        .eq("user_id", userId)
        .eq("message_id", messageId)
        .select("*");

      console.log("중요 메일 message_id 기준 업데이트 결과:", 업데이트결과);

      if (업데이트결과.error) {
        throw 업데이트결과.error;
      }
    }

    if (!업데이트결과.data || 업데이트결과.data.length === 0) {
      throw new Error("업데이트된 메일 row가 없습니다.");
    }

    const 저장된값 = Boolean(업데이트결과.data[0]?.["중요메일"]);

    set메일목록((prev) =>
      prev.map((item) =>
        item.id === email.id ? { ...item, 중요메일: 저장된값 } : item
      )
    );

    console.log("중요 메일 저장 완료:", 업데이트결과.data[0]);
  } catch (error) {
    console.error("중요 메일 변경 실패:", error);

    set메일목록((prev) =>
      prev.map((item) =>
        item.id === email.id ? { ...item, 중요메일: 현재값 } : item
      )
    );

    alert("중요 메일 설정 중 문제가 발생했습니다. 콘솔 오류를 확인해주세요.");
  }
}



  const [메일목록, set메일목록] = useState<EmailRow[]>(emails);
  const [선택메일, set선택메일] = useState<EmailRow | null>(null);
  const [선택분류, set선택분류] = useState("전체");

useEffect(() => {
  set메일목록(emails);
}, [emails]);


  const 분류목록 = [
    "전체",
    "중요",
    "업무",
    "검토필요",
    "결제알림",
    "보안알림",
    "광고",
    "서비스알림",
    "스팸",
  ];

  const 긴급도순서: Record<string, number> = {
    높음: 3,
    보통: 2,
    낮음: 1,
  };

  const 상태순서: Record<string, number> = {
    즉시응답필요: 5,
    응답필요: 4,
    확인필요: 3,
    검토필요: 2,
    응답불필요: 1,
  };

  const 우선정렬분류 = ["중요", "업무", "보안알림", "검토필요", "결제알림"];

  function 중요도점수(email: EmailRow) {
    const 상태 = 값(email, "상태");
    const 긴급도 = 값(email, "긴급도");

    const 상태점수 = 상태순서[상태] ?? 0;
    const 긴급도점수 = 긴급도순서[긴급도] ?? 0;

    return 상태점수 * 10 + 긴급도점수;
  }

 const 표시메일목록 = [...메일목록]
  .filter((email) => {
    if (선택분류 === "전체") return true;

    if (선택분류 === "중요") {
      return Boolean(email["중요메일"]);
    }

    return 값(email, "최종 분류") === 선택분류;
  })
    .sort((a, b) => {
      if (우선정렬분류.includes(선택분류)) {
        const 중요도차이 = 중요도점수(b) - 중요도점수(a);

        if (중요도차이 !== 0) {
          return 중요도차이;
        }
      }

      return 시간점수용(b) - 시간점수용(a);
    });

 const 분류별개수 = 분류목록.reduce((acc, 분류) => {
  if (분류 === "전체") {
    acc[분류] = 메일목록.length;
    return acc;
  }

  if (분류 === "중요") {
    acc[분류] = 메일목록.filter((email) =>
      Boolean(email["중요메일"])
    ).length;
    return acc;
  }

  acc[분류] = 메일목록.filter(
    (email) => 값(email, "최종 분류") === 분류
  ).length;

  return acc;
}, {} as Record<string, number>);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {분류목록.map((분류) => (
          <button
            key={분류}
            type="button"
            onClick={() => set선택분류(분류)}
            className={`inline-flex items-center justify-center whitespace-nowrap break-keep rounded-full border px-4 py-2 text-sm font-medium transition ${
              선택분류 === 분류
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{분류}</span>
            <span
              className={`ml-1 text-xs ${
                선택분류 === 분류 ? "text-slate-200" : "text-slate-400"
              }`}
            >
              {분류별개수[분류] ?? 0}
            </span>
          </button>
        ))}
      </div>



      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
       <table className="min-w-[1180px] w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[100px]" />
            <col className="w-[85px]" />
            <col className="w-[210px]" />
            <col className="w-[190px]" />
            <col className="w-[260px]" />
            <col className="w-[120px]" />
            <col className="w-[130px]" />
            <col className="w-[120px]" />
            <col className="w-[130px]" />
          </colgroup>

          <thead className="bg-slate-50 text-left text-sm text-slate-800">
            <tr className="border-b border-slate-300">
              <th className="px-4 py-4 font-bold">최종분류</th>
              <th className="px-4 py-4 font-bold">긴급도</th>
              <th className="px-4 py-4 font-bold">제목</th>
              <th className="px-4 py-4 font-bold">보낸사람</th>
              <th className="px-4 py-4 font-bold">본문요약</th>
              <th className="px-4 py-4 font-bold">상태</th>
              <th className="px-4 py-4 font-bold">추가정보</th>
              <th className="px-4 py-4 font-bold">수신시각</th>
              <th className="px-4 py-4 font-bold">작업</th>
            </tr>


          </thead>

          <tbody>
            {표시메일목록.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  선택한 분류에 해당하는 메일이 없습니다.
                </td>
              </tr>
            ) : (
              표시메일목록.map((email) => {
                const 최종분류 = 값(email, "최종 분류") || "검토필요";
                const 긴급도 = 값(email, "긴급도") || "보통";
                const 상태 = 값(email, "상태") || "검토필요";
                const 제목 = 값(email, "제목") || "(제목 없음)";
                const 본문요약 = 값(email, "본문 요약") || "-";
                const 보낸사람 = 발신자파싱(값(email, "보낸 사람"));
                const gmailUrl = 값(email, "gmail_url");
                const 수신시각 =
                  값(email, "수신 시각") || 값(email, "created_at");

                return (
                  <tr
                    key={String(email.id)}
                    className="border-b border-slate-200 align-top last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <Badge className={배지색상(최종분류)}>
                        {최종분류}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <Badge className={긴급도색상(긴급도)}>{긴급도}</Badge>
                    </td>

                    <td className="px-4 py-4">
                     <div className="flex min-w-0 items-start gap-2">
                      <button
                      type="button"
                      onClick={() => 중요메일토글(email)}
                      title={Boolean(email["중요메일"]) ? "중요 메일 해제" : "중요 메일 추가"}
                      className={`mt-0.5 shrink-0 text-lg leading-none transition ${
                         Boolean(email["중요메일"])
                         ? "text-amber-500 hover:text-amber-600"
                         : "text-slate-300 hover:text-amber-500"
                     }`}
    >
      {Boolean(email["중요메일"]) ? "★" : "☆"}
    </button>

    <div className="line-clamp-2 min-w-0 font-semibold text-slate-900">
      {제목}
    </div>
  </div>
</td>

                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">
                          {보낸사람.name}
                        </div>

                        {보낸사람.email && (
                          <div className="mt-1 truncate text-xs text-slate-500">
                            {보낸사람.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="line-clamp-2 text-slate-700">
                        {본문요약}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge className={상태색상(상태)}>{상태}</Badge>
                    </td>

                    <td className="px-4 py-4">
                      <ExtraInfoView raw={email["추가 정보"]} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {표시날짜(수신시각)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => set선택메일(email)}
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          원문 보기
                        </button>

                        {gmailUrl && gmailUrl !== "없음" && (
                          <a
                            href={gmailUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Gmail에서 열기
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {선택메일 && (
  <메일원문보기모달
    열림={Boolean(선택메일)}
    닫기={() => set선택메일(null)}
    userId={값(선택메일, "user_id")}
    messageId={값(선택메일, "message_id")}
    제목={값(선택메일, "제목")}
    보낸사람={값(선택메일, "보낸 사람")}
  />
)}
    </>
  );
}