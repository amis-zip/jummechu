
import PageShell from "@/components/PageShell";
import ActionButton from "@/components/ActionButton";

export default function HomePage() {
  return (
    <PageShell className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-100 backdrop-blur md:p-8">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-500">
                점메추
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Fast Lunch Pick 🚀
                <br />
                by 점메추
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-500">
                현재 위치를 기준으로 가까운 식당을 찾고,
                음식 종류와 거리 조건까지 반영해서
                오늘의 점심 후보를 골라드려요.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
  <ActionButton href="/recommend" variant="primary">
    추천 시작하기
  </ActionButton>

  <ActionButton href="/result" variant="outline">
    결과 화면 보기
  </ActionButton>
</div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <p className="text-sm font-medium text-slate-500">
                  오늘 이런 걸 할 수 있어요
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-blue-50 px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      📍 내 위치 기반 추천
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      지금 위치 주변 식당을 자동으로 찾아와요.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-indigo-50 px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      🍱 음식 종류 필터
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      한식, 일식, 중식, 양식, 고기, 샐러드 중 원하는 메뉴를 고를 수 있어요.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-sky-50 px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      🚶 거리 조건 설정
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      300m, 500m, 1km 이하로 점심 후보를 좁혀볼 수 있어요.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      🗺️ 지도 바로 보기
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      추천된 식당을 눌러 바로 위치를 확인할 수 있어요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-medium text-slate-500">STEP 1</p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                추천 조건 고르기
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                음식 종류와 최대 거리를 정해서 오늘 점심 범위를 정해요.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-medium text-slate-500">STEP 2</p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                점심 후보 받기
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                주변 식당 중 조건에 맞는 곳을 3개씩 추천해줘요.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-medium text-slate-500">STEP 3</p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                최종 메뉴 정하기
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                추천된 후보를 바탕으로 팀원들과 투표해 오늘의 점심을 결정해요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}