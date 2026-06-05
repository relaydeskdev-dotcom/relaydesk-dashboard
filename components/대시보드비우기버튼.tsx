"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function 대시보드비우기버튼() {
  const router = useRouter();

  const [열림, set열림] = useState(false);
  const [처리중, set처리중] = useState(false);
  const [메시지, set메시지] = useState("");

  async function 비우기실행() {
    set처리중(true);
    set메시지("");

    try {
      const { data, error } = await supabase.rpc("대시보드_비우기", {
        p_user_id: "test_user_1",
      });

      if (error) {
        throw error;
      }

      set메시지(`대시보드에서 ${data ?? 0}개의 메일을 비웠습니다.`);

      setTimeout(() => {
        set열림(false);
        set메시지("");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("대시보드 비우기 실패:", error);

      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "알 수 없는 오류";

      set메시지(`처리 중 문제가 발생했습니다: ${errorMessage}`);
    } finally {
      set처리중(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => set열림(true)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        대시보드 비우기
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
                  대시보드 비우기
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  대시보드에 표시된 이전 메일을 정리합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => set열림(false)}
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

            {메시지 && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {메시지}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => set열림(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={비우기실행}
                disabled={처리중}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {처리중 ? "비우는 중..." : "비우기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}