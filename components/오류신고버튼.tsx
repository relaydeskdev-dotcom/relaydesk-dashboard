"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const 문의유형목록 = [
  "메일 가져오기/저장 문제",
  "메일 분류 문제",
  "원문 확인/Gmail 연결 문제",
  "맞춤 키워드 문제",
  "대시보드 화면/조작 문제",
  "기능 개선 요청",
  "기타 문의",
];

export default function 오류신고버튼() {
  const [열림, set열림] = useState(false);
  const [문의유형, set문의유형] = useState("분류가 이상해요");
  const [내용, set내용] = useState("");
  const [저장중, set저장중] = useState(false);
  const [메시지, set메시지] = useState("");

  async function 보내기() {
    const 정리된내용 = 내용.trim();

    if (!정리된내용) {
      set메시지("내용을 입력해주세요.");
      return;
    }

    set저장중(true);
    set메시지("");

    try {
      const { error } = await supabase.from("사용자_문의").insert({
        user_id: "test_user_1",
        message_id: null,
        문의유형,
        내용: 정리된내용,
        페이지: "dashboard",
        상태: "접수",
      });

      if (error) {
        throw error;
      }

      set메시지("오류 신고가 접수됐습니다.");
      set내용("");

      setTimeout(() => {
        set열림(false);
        set메시지("");
      }, 800);
    } catch (error) {
      console.error("오류 신고 저장 실패:", error);

      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "알 수 없는 오류";

      set메시지(`저장 중 문제가 발생했습니다: ${errorMessage}`);
    } finally {
      set저장중(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => set열림(true)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        오류 신고
      </button>

      {열림 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => set열림(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  오류 신고
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                 <span className="block">
                   사용 중 발생한 오류나 개선이 필요한 부분을 알려주세요.
               </span>
               <span className="block">
                   확인 후 신속히 개선하겠습니다.
              </span>
               </p>
              </div>

              <button
                type="button"
                onClick={() => set열림(false)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  문제 유형
                </label>

                <select
                  value={문의유형}
                  onChange={(event) => set문의유형(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-900"
                >
                  {문의유형목록.map((유형) => (
                    <option key={유형} value={유형}>
                      {유형}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  내용
                </label>

                <textarea
                  value={내용}
                  onChange={(event) => set내용(event.target.value)}
                  placeholder="예: 광고 메일인데 업무로 분류됨. / 원문 보기 버튼을 눌러도 내용이 안 보이지 않음."
                  className="min-h-32 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm leading-6 text-slate-700 outline-none focus:border-slate-900"
                />
              </div>

              {메시지 && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  {메시지}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => set열림(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={보내기}
                  disabled={저장중}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {저장중 ? "보내는 중..." : "보내기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}