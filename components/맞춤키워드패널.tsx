"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type 키워드유형 = "받고싶음" | "받고싶지않음";

type 직종프리셋 = {
  이름: string;
  설명: string;
  키워드: string[];
};

const 공통관심키워드 = [
  "견적",
  "의뢰",
  "외주",
  "프로젝트",
  "작업 문의",
  "진행 가능",
  "마감",
  "일정",
  "수정 요청",
  "피드백",
  "컨펌",
  "계약",
  "계약서",
  "입금",
  "결제",
  "청구서",
  "인보이스",
  "세금계산서",
  "환불",
  "납품",
  "파일 전달",
  "자료 전달",
];

const 직종프리셋목록: 직종프리셋[] = [
  {
    이름: "일러스트/커미션",
    설명: "커미션, 캐릭터, 시안, 수정 요청 중심",
    키워드: [
      "커미션",
      "외주",
      "견적",
      "의뢰",
      "캐릭터",
      "일러스트",
      "시안",
      "레퍼런스",
      "수정 요청",
      "피드백",
      "마감",
      "상업적 이용",
      "저작권",
      "입금",
      "세금계산서",
    ],
  },
  {
    이름: "디자인",
    설명: "로고, 썸네일, 배너, 브랜딩 작업 중심",
    키워드: [
      "디자인",
      "로고",
      "브랜딩",
      "썸네일",
      "배너",
      "포스터",
      "상세페이지",
      "시안",
      "수정",
      "컨펌",
      "레퍼런스",
      "견적",
      "마감",
      "납기",
    ],
  },
  {
    이름: "영상 편집",
    설명: "편집, 자막, 쇼츠, 썸네일, 납품 중심",
    키워드: [
      "영상 편집",
      "편집",
      "자막",
      "쇼츠",
      "릴스",
      "인트로",
      "아웃트로",
      "썸네일",
      "원본 파일",
      "납품",
      "수정 요청",
      "피드백",
      "마감",
      "견적",
    ],
  },
  {
    이름: "버튜버/Live2D",
    설명: "Live2D, 리깅, 모델링, 파츠분리 중심",
    키워드: [
      "버튜버",
      "Live2D",
      "리깅",
      "모델링",
      "파츠분리",
      "방송용",
      "오버레이",
      "캐릭터",
      "일러스트",
      "수정 요청",
      "피드백",
      "견적",
      "마감",
      "상업적 이용",
    ],
  },
  {
    이름: "웹/앱 개발",
    설명: "웹사이트, 앱, API, 유지보수, 배포 중심",
    키워드: [
      "웹사이트",
      "홈페이지",
      "랜딩페이지",
      "앱",
      "API",
      "대시보드",
      "관리자 페이지",
      "자동화",
      "유지보수",
      "버그",
      "수정",
      "배포",
      "서버",
      "DB",
      "견적",
      "계약",
    ],
  },
  {
    이름: "글/번역",
    설명: "원고, 번역, 교정, 리뷰, 납기 중심",
    키워드: [
      "원고",
      "번역",
      "교정",
      "교열",
      "리뷰",
      "작성",
      "시나리오",
      "카피라이팅",
      "초안",
      "수정 요청",
      "피드백",
      "납기",
      "마감",
      "견적",
    ],
  },
];

const 낮은우선순위추천키워드 = [
  "뉴스레터",
  "할인",
  "이벤트",
  "광고",
  "프로모션",
  "쿠폰",
  "세일",
  "무료 체험",
  "채용",
  "보험",
  "대출",
  "투자",
  "코인",
  "주식",
  "부업",
  "설문",
  "세미나",
  "웨비나",
  "추천 콘텐츠",
  "커뮤니티 알림",
];

export default function 맞춤키워드패널() {
  const [키워드패널열림, set키워드패널열림] = useState(false);
  const [선택직종, set선택직종] = useState("일러스트/커미션");

  const [추가관심키워드, set추가관심키워드] = useState<string[]>([]);
  const [낮은우선순위키워드, set낮은우선순위키워드] = useState<string[]>([
    "뉴스레터",
    "할인",
    "이벤트",
    "광고",
    "프로모션",
    "채용",
  ]);

  const [직접키워드, set직접키워드] = useState("");
  const [직접키워드유형, set직접키워드유형] =
    useState<키워드유형>("받고싶음");

  const [저장중, set저장중] = useState(false);
  const [저장메시지, set저장메시지] = useState("");

  const 선택직종프리셋 =
    직종프리셋목록.find((직종) => 직종.이름 === 선택직종) ??
    직종프리셋목록[0];

  const 자동적용키워드 = 선택직종프리셋.키워드;

  const 최종관심키워드 = Array.from(
  new Set([...공통관심키워드, ...자동적용키워드, ...추가관심키워드])
);

  function 낮은우선순위키워드토글(키워드: string) {
    set낮은우선순위키워드((prev) =>
      prev.includes(키워드)
        ? prev.filter((item) => item !== 키워드)
        : [...prev, 키워드]
    );
  }

  function 추가관심키워드삭제(키워드: string) {
    set추가관심키워드((prev) => prev.filter((item) => item !== 키워드));
  }

  function 낮은우선순위키워드삭제(키워드: string) {
    set낮은우선순위키워드((prev) => prev.filter((item) => item !== 키워드));
  }

  function 직접키워드추가() {
    const 새키워드 = 직접키워드.trim();

    if (!새키워드) return;

    if (직접키워드유형 === "받고싶음") {
      set추가관심키워드((prev) =>
        prev.includes(새키워드) ? prev : [...prev, 새키워드]
      );
    } else {
      set낮은우선순위키워드((prev) =>
        prev.includes(새키워드) ? prev : [...prev, 새키워드]
      );
    }

    set직접키워드("");
  }

 async function 저장하기() {
  const user_id = "test_user_1";

  set저장중(true);
  set저장메시지("");

  const 공통Rows = 공통관심키워드.map((키워드) => ({
    user_id,
    키워드,
    유형: "받고싶음",
    출처: "공통",
    카테고리: "공통",
    활성화: true,
  }));

  const 직종Rows = 자동적용키워드.map((키워드) => ({
    user_id,
    키워드,
    유형: "받고싶음",
    출처: "직종프리셋",
    카테고리: 선택직종,
    활성화: true,
  }));

  const 추가관심Rows = 추가관심키워드.map((키워드) => ({
    user_id,
    키워드,
    유형: "받고싶음",
    출처: "사용자입력",
    카테고리: "직접입력",
    활성화: true,
  }));

  const 낮은우선순위Rows = 낮은우선순위키워드.map((키워드) => ({
    user_id,
    키워드,
    유형: "받고싶지않음",
    출처: "사용자선택",
    카테고리: "낮은우선순위",
    활성화: true,
  }));

  const 저장Rows원본 = [
    ...공통Rows,
    ...직종Rows,
    ...추가관심Rows,
    ...낮은우선순위Rows,
  ];

  const 저장Rows = Array.from(
    new Map(
      저장Rows원본.map((row) => [
        `${row.user_id}-${row.키워드}-${row.유형}`,
        row,
      ])
    ).values()
  );

  try {
    const { error: 삭제오류 } = await supabase
      .from("사용자_키워드")
      .delete()
      .eq("user_id", user_id);

    if (삭제오류) {
      throw 삭제오류;
    }

    const { error: 저장오류 } = await supabase
      .from("사용자_키워드")
      .insert(저장Rows);

    if (저장오류) {
      throw 저장오류;
    }

    set저장메시지(`맞춤 키워드 ${저장Rows.length}개가 저장됐습니다.`);
  } catch (error) {
    console.error("키워드 저장 오류:", error);

    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : JSON.stringify(error);

    set저장메시지(`저장 중 오류가 발생했습니다: ${message}`);
  } finally {
    set저장중(false);
  }
}

  return (
    <>
      <div className="mb-5">
        <button
          type="button"
          onClick={() => set키워드패널열림((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {키워드패널열림 ? "맞춤 설정 닫기" : "맞춤 설정"}
        </button>
      </div>

      {키워드패널열림 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">맞춤 설정</h2>
            <p className="mt-1 text-sm text-slate-500">
              직종을 선택하면 관련 키워드가 자동으로 적용됩니다. 추가
              키워드는 선택사항이에요.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  어떤 일을 주로 하시나요?
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  직종을 선택하면 관련 키워드가 자동으로 활성화됩니다.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {직종프리셋목록.map((직종) => {
                  const 선택됨 = 선택직종 === 직종.이름;

                  return (
                    <button
                      key={직종.이름}
                      type="button"
                      onClick={() => set선택직종(직종.이름)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        선택됨
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-sm font-bold">{직종.이름}</div>
                      <div
                        className={`mt-1 text-xs leading-5 ${
                          선택됨 ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {직종.설명}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  자동 적용 키워드
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  선택한 직종에 맞춰 자동으로 적용되는 키워드입니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {자동적용키워드.map((키워드) => (
                  <span
                    key={키워드}
                    className="inline-flex items-center justify-center whitespace-nowrap break-keep rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                  >
                    {키워드}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  추가로 챙기고 싶은 단어
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  고객명, 프로젝트명, 작업 분야처럼 본인에게 중요한 단어를
                  추가할 수 있어요.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={직접키워드유형}
                  onChange={(event) =>
                    set직접키워드유형(event.target.value as 키워드유형)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="받고싶음">놓치면 안 되는 단어</option>
                  <option value="받고싶지않음">낮은 우선순위 단어</option>
                </select>

                <input
                  value={직접키워드}
                  onChange={(event) => set직접키워드(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      직접키워드추가();
                    }
                  }}
                  placeholder="예: Live2D, 버튜버, 로고, 유지보수"
                  className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
                />

                <button
                  type="button"
                  onClick={직접키워드추가}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  추가
                </button>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  낮은 우선순위 메일
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  업무/결제/보안 신호가 약하면 덜 중요하게 볼 단어입니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {낮은우선순위추천키워드.map((키워드) => {
                  const 선택됨 = 낮은우선순위키워드.includes(키워드);

                  return (
                    <button
                      key={키워드}
                      type="button"
                      onClick={() => 낮은우선순위키워드토글(키워드)}
                      className={`inline-flex items-center justify-center whitespace-nowrap break-keep rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        선택됨
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {키워드}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-2 text-sm font-bold text-slate-800">
                  최종 적용될 관심 키워드
                </div>

                <div className="flex flex-wrap gap-2">
                  {최종관심키워드.length > 0 ? (
                    최종관심키워드.map((키워드) => {
                      const 직접추가됨 = 추가관심키워드.includes(키워드);

                      return 직접추가됨 ? (
                        <button
                          key={키워드}
                          type="button"
                          onClick={() => 추가관심키워드삭제(키워드)}
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                        >
                          {키워드} ×
                        </button>
                      ) : (
                        <span
                          key={키워드}
                          className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {키워드}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400">
                      적용될 키워드가 없습니다.
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-2 text-sm font-bold text-slate-800">
                  최종 적용될 낮은 우선순위 키워드
                </div>

                <div className="flex flex-wrap gap-2">
                  {낮은우선순위키워드.length > 0 ? (
                    낮은우선순위키워드.map((키워드) => (
                      <button
                        key={키워드}
                        type="button"
                        onClick={() => 낮은우선순위키워드삭제(키워드)}
                        className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {키워드} ×
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      적용될 키워드가 없습니다.
                    </span>
                  )}
                </div>
              </div>
            </section>
     {저장메시지 && (
      <div className="text-sm font-medium text-slate-600">
       {저장메시지}
    </div>
)}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => set키워드패널열림(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                나중에 할게요
              </button>

              
                <button
                 type="button"
                 onClick={저장하기}
                 disabled={저장중}
                 className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
     >
               {저장중 ? "저장 중..." : "저장"}
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}