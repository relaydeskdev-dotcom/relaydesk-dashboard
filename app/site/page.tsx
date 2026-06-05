import Link from "next/link";

const 기능목록 = [
  {
    제목: "업무 메일 자동분류",
    설명:
      "업무 , 광고, 결제 알림, 보안 알림, 서비스 알림을 자동으로 구분해 중요한 메일을 먼저 확인할 수 있습니다.",
  },
  {
    제목: "답장·확인 필요 상태 정리",
    설명:
      "응답필요, 확인필요, 응답불필요 상태를 나눠서 답장해야 할 메일을 놓치지 않도록 도와줍니다.",
  },
  {
    제목: "맞춤 키워드 기반 보정",
    설명:
      "직종과 관심 키워드를 반영해 사용자의 업무 스타일에 맞는 분류 결과를 제공합니다.",
  },
  {
    제목: "원문 확인과 Gmail 연결",
    설명:
      "대시보드에서 메일 원문을 확인하고, 필요할 때 Gmail 원문으로 바로 이동할 수 있습니다.",
  },
];

const 대상목록 = [
  "커미션 작업자",
  "프리랜서 디자이너",
  "일러스트레이터",
  "외주 작업자",
  "1인 개발자",
  "소규모 사업자",
];

const 문제목록 = [
  "광고와 알림 속에서 업무 문의를 놓친 적이 있다",
  "답장해야 할 메일과 그냥 봐도 되는 메일이 섞여 있다",
  "결제/보안 알림과 고객 문의를 한눈에 구분하고 싶다",
  "메일함을 열 때마다 정리부터 해야 해서 피곤하다",
];

export default function SitePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-lg font-bold tracking-tight">
          Mail Dashboard
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            기능
          </a>
          <a href="#target" className="hover:text-white">
            대상
          </a>
          <a href="#pricing" className="hover:text-white">
            베타
          </a>
          <Link
            href="/"
            className="rounded-xl border border-white/20 px-4 py-2 text-white hover:bg-white/10"
          >
            대시보드 보기
          </Link>
        </nav>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
            프리랜서와 커미션 작업자를 위한 메일 자동정리
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            중요한 업무 메일,
            <br />
            광고 속에 묻히지 않게.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            업무 문의, 결제 알림, 보안 알림, 광고 메일을 자동으로 분류하고
            답장과 확인이 필요한 메일을 우선순위대로 보여주는 메일 정리
            대시보드입니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
            >
              베타 신청 준비 중
            </a>

            <Link
              href="/"
              className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              대시보드 미리보기
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            현재는 베타 테스트 준비 단계입니다. 정식 요금제와 신청 폼은 추후
            공개됩니다.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/40">
          <div className="rounded-2xl bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">오늘의 메일</p>
                <h2 className="text-xl font-bold">우선 확인 목록</h2>
              </div>
              <div className="rounded-xl bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950">
                AI 정리됨
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["업무", "커미션 견적 문의드립니다", "응답필요", "높음"],
                ["결제알림", "구독 결제가 완료되었습니다", "확인필요", "보통"],
                ["보안알림", "새 로그인 알림", "확인필요", "높음"],
                ["광고", "이번 주 프로모션 안내", "응답불필요", "낮음"],
              ].map(([분류, 제목, 상태, 긴급도]) => (
                <div
                  key={제목}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {분류}
                    </span>
                    <span className="text-xs text-slate-400">
                      긴급도 {긴급도}
                    </span>
                  </div>
                  <p className="font-semibold">{제목}</p>
                  <p className="mt-1 text-sm text-slate-400">{상태}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-4">
          <div>
            <p className="text-3xl font-black">7가지</p>
            <p className="mt-1 text-sm text-slate-400">메일 자동분류</p>
          </div>
          <div>
            <p className="text-3xl font-black">AI</p>
            <p className="mt-1 text-sm text-slate-400">요약·상태 판단</p>
          </div>
          <div>
            <p className="text-3xl font-black">키워드</p>
            <p className="mt-1 text-sm text-slate-400">직종 맞춤 보정</p>
          </div>
          <div>
            <p className="text-3xl font-black">Gmail</p>
            <p className="mt-1 text-sm text-slate-400">원문 바로 확인</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10">
          <p className="text-sm font-bold text-cyan-300">주요 기능</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            난잡한 메일함을 정돈된 대시보드로 바꿔드립니다.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {기능목록.map((기능) => (
            <div
              key={기능.제목}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <h3 className="text-xl font-bold">{기능.제목}</h3>
              <p className="mt-3 leading-7 text-slate-300">{기능.설명}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="target" className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold text-cyan-300">이런 분께 추천</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            메일함이 곧 업무창인 사람들을 위해.
          </h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {대상목록.map((대상) => (
              <span
                key={대상}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200"
              >
                {대상}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-xl font-bold">이런 문제를 겪은 적이 있나요?</h3>

          <ul className="mt-5 space-y-4">
            {문제목록.map((문제) => (
              <li key={문제} className="flex gap-3 text-slate-300">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                <span>{문제}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8 md:p-10">
          <p className="text-sm font-bold text-cyan-200">Beta</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            현재 베타 테스트 준비 중입니다.
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-slate-300">
            초기 버전은 제한된 인원에게 먼저 제공될 예정입니다. 실제 사용
            피드백을 바탕으로 분류 정확도, 키워드 설정, 대시보드 기능을
            개선한 뒤 정식 요금제를 공개할 계획입니다.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">베타 가격</p>
              <p className="mt-2 text-2xl font-black">미정</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">대상</p>
              <p className="mt-2 text-2xl font-black">프리랜서</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">상태</p>
              <p className="mt-2 text-2xl font-black">준비 중</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              className="cursor-not-allowed rounded-2xl bg-white/20 px-6 py-3 text-sm font-bold text-white"
            >
              베타 신청 폼 준비 중
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Mail Dashboard. All rights reserved.</p>
          <p>프리랜서 업무 메일 자동정리 서비스</p>
        </div>
      </footer>
    </main>
  );
}