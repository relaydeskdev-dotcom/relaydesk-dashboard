import Link from "next/link";
import CustomKeywordPanel from "@/components/맞춤키워드패널";


export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            시작 설정
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            어떤 메일을 놓치면 안 되나요?
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            직종을 선택하면 자주 쓰이는 의뢰, 견적, 수정, 결제 관련 키워드가
            자동으로 적용됩니다. 추가 키워드는 선택사항이에요.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              설정이 끝나면 첫 메일부터 맞춤 기준으로 더 신중하게 분류됩니다.
            </p>
            <p className="mt-1">
              키워드는 메일을 강제로 분류하는 규칙이 아니라, 중요한 메일을
              놓치지 않기 위한 보정 신호로 사용됩니다.
            </p>
          </div>
        </div>

        <CustomKeywordPanel />

        <div className="mt-6 flex justify-between">
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            대시보드로 돌아가기
          </Link>

          <Link
            href="/"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            일단 대시보드 보기
          </Link>
        </div>
      </div>
    </main>
  );
}