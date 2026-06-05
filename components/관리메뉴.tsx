"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const 문의유형목록 = [
  "메일 수집/저장 문제",
  "메일 분류/AI 판단 문제",
  "원문 보기/Gmail 연결 문제",
  "맞춤 키워드/온보딩 문제",
  "대시보드 화면/조작 문제",
  "기능 개선 요청",
  "기타 문의",
];

export default function 관리메뉴() {
  const router = useRouter();

  const [메뉴열림, set메뉴열림] = useState(false);
  const [오류신고열림, set오류신고열림] = useState(false);
  const [비우기열림, set비우기열림] = useState(false);
  const [비우기처리중, set비우기처리중] = useState(false);
  const [비우기메시지, set비우기메시지] = useState("");

  const [문의유형, set문의유형] = useState("메일 분류/AI 판단 문제");
  const [내용, set내용] = useState("");
  const [저장중, set저장중] = useState(false);
  const [메시지, set메시지] = useState("");

  async function 오류신고보내기() {
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
        set오류신고열림(false);
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

  async function 대시보드비우기실행() {
    set비우기처리중(true);
    set비우기메시지("");

    try {
      const { data, error } = await supabase.rpc("대시보드_비우기", {
        p_user_id: "test_user_1",
      });

      if (error) {
        throw error;
      }

      set비우기메시지(`대시보드에서 ${data ?? 0}개의 메일을 비웠습니다.`);

      setTimeout(() => {
        set비우기열림(false);
        set비우기메시지("");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("대시보드 비우기 실패:", error);

      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "알 수 없는 오류";

      set비우기메시지(`처리 중 문제가 발생했습니다: ${errorMessage}`);
    } finally {
      set비우기처리중(false);
    }
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => set메뉴열림((prev) => !prev)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          관리 메뉴
          <span className="ml-1 text-xs text-slate-400">▼</span>
        </button>

        {메뉴열림 && (
          <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <Link
              href="/onboarding"
              onClick={() => set메뉴열림(false)}
              className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              맞춤 설정 다시 하기
            </Link>

            <button
              type="button"
              onClick={() => {
                set메뉴열림(false);
                set오류신고열림(true);
              }}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              오류 신고
            </button>

            <button
              type="button"
              onClick={() => {
                set메뉴열림(false);
                set비우기열림(true);
              }}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              대시보드 비우기
            </button>
          </div>
        )}
      </div>

      {오류신고열림 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => set오류신고열림(false)}
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
                onClick={() => set오류신고열림(false)}
                className="inline-flex h-8 min-w-[56px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100"
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
                  placeholder="예: 광고 메일이 업무로 분류됩니다. / 원문 보기에서 내용이 정상적으로 표시되지 않습니다. / 메일이 중복 저장됩니다."
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
                  onClick={() => set오류신고열림(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={오류신고보내기}
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

      {비우기열림 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => set비우기열림(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  대시보드 비우기
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  대시보드에 표시된 이전 메일을 정리합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => set비우기열림(false)}
                className="inline-flex h-8 min-w-[56px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <p className="font-semibold">
                대시보드 창을 비우면 이전 메일은 더 이상 확인할 수 없습니다.
              </p>
              <p className="mt-1">
                보관이 필요한 메일은 미리 중요 메일에 추가해주세요.
                중요 메일로 추가된 항목은 삭제되지 않습니다.
              </p>
            </div>

            {비우기메시지 && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {비우기메시지}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => set비우기열림(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={대시보드비우기실행}
                disabled={비우기처리중}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {비우기처리중 ? "비우는 중..." : "비우기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}