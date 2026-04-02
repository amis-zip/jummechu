"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type KakaoPlace = {
  id: string;
  place_name: string;
  road_address_name?: string;
  address_name: string;
  distance: string;
  category_name?: string;
};

export default function ResultPage() {
  const [picked, setPicked] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("jummechu-picked");
    if (saved) {
      setPicked(JSON.parse(saved));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">점메추</p>
        <h1 className="mt-2 text-3xl font-semibold">오늘의 추천 결과</h1>

        {picked.length === 0 ? (
          <p className="mt-6 text-slate-500">
            아직 저장된 추천 결과가 없어요. 추천 페이지에서 먼저 추천을 받아보세요.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {picked.map((place) => (
              <div
                key={place.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <h2 className="text-lg font-semibold">{place.place_name}</h2>

                <p className="mt-1 text-xs text-slate-400">
                  📍 {place.distance}m · {place.category_name?.split(">").pop()?.trim() ?? "기타"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {place.road_address_name || place.address_name}
                </p>

                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(
                    place.place_name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 rounded-xl border px-3 py-2 text-sm font-medium"
                >
                  지도에서 보기
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/recommend"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-medium"
          >
            다시 추천하러 가기
          </Link>

          <Link
            href="/"
            className="rounded-2xl border px-5 py-3 font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}