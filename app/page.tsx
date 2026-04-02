import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl rounded-[32px] border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">점메추</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          점심 메뉴를 빠르게 추천해주는 웹페이지
        </h1>
        <p className="mt-3 text-slate-600">
          조건을 고르면 점심 메뉴 후보 3개를 추천해줘요.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/recommend"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-medium"
          >
            추천 시작하기
          </Link>
          <Link
            href="/result"
            className="rounded-2xl border px-5 py-3 font-medium"
          >
            결과 화면 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
