"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type KakaoPlace = {
  id: string;
  place_name: string;
  road_address_name?: string;
  address_name: string;
  distance: string;
  category_name?: string;
};

export default function RecommendPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<KakaoPlace[]>([]);
  const [picked, setPicked] = useState<KakaoPlace[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [message, setMessage] = useState("위치 정보를 불러오는 중이에요...");
  const [category, setCategory] = useState("전체");
  const [maxDistance, setMaxDistance] = useState(500);

  const saveVisited = (list: KakaoPlace[]) => {
    const prev = JSON.parse(localStorage.getItem("jummechu-visited") || "[]") as string[];
    const ids = list.map((p) => p.id);
    const updated = [...new Set([...prev, ...ids])];
    localStorage.setItem("jummechu-visited", JSON.stringify(updated));
  };

  const pickRandomRestaurants = (
    list: KakaoPlace[],
    selectedCategory: string,
    selectedDistance: number
  ) => {
    const visited = JSON.parse(
      localStorage.getItem("jummechu-visited") || "[]"
    ) as string[];

    let filtered = list
      .filter((place) => {
        const distance = Number(place.distance);
        return Number.isFinite(distance) && distance <= selectedDistance;
      })
      .filter((place) => !visited.includes(place.id));

    if (selectedCategory !== "전체") {
      filtered = filtered.filter((place) =>
        place.category_name?.includes(selectedCategory)
      );
    }

    const shuffled = [...filtered]
      .map((v) => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v)
      .slice(0, 3);

    setPicked(shuffled);

    if (shuffled.length === 0) {
      setMessage("조건에 맞는 식당을 찾지 못했어요.");
    } else {
      setMessage("현재 위치를 성공적으로 불러왔어요.");
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 위치 기능을 사용할 수 없어요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setLat(currentLat);
        setLng(currentLng);

        try {
          const res = await fetch(
            `/api/kakao?lat=${currentLat}&lng=${currentLng}`
          );

          const data: KakaoPlace[] = await res.json();
          setRestaurants(data);
          console.log("🍚 주변 식당:", data);
        } catch (error) {
          console.error("API 호출 실패:", error);
          setMessage("식당 정보를 불러오지 못했어요.");
        }
      },
      () => {
        setMessage("위치 권한이 거부되었거나 위치를 가져오지 못했어요.");
      }
    );
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      pickRandomRestaurants(restaurants, category, maxDistance);
    }
  }, [restaurants, category, maxDistance]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 md:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-blue-500">점메추</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">내 위치 기반 점심 추천</h1>
        <p className="mt-2 text-slate-600">{message}</p>

        <div className="mt-6 space-y-3 rounded-2xl border p-4">
          <p className="text-sm text-slate-500">현재 위치 정보</p>
          <p>위도: {lat ?? "아직 없음"}</p>
          <p>경도: {lng ?? "아직 없음"}</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">음식 종류</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="전체">전체</option>
            <option value="한식">한식</option>
            <option value="일식">일식</option>
            <option value="중식">중식</option>
            <option value="양식">양식</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">최대 거리</label>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value={300}>300m 이하</option>
            <option value={500}>500m 이하</option>
            <option value={1000}>1km 이하</option>
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => pickRandomRestaurants(restaurants, category, maxDistance)}
            className="rounded-2xl bg-blue-500 hover:bg-blue-600 transition px-5 py-3 text-white font-semibold shadow"
          >
            다시 추천
          </button>

          <button
            onClick={() => {
              localStorage.setItem("jummechu-picked", JSON.stringify(picked));
              saveVisited(picked);
              router.push("/result");
            }}
            className="rounded-2xl bg-indigo-500 hover:bg-indigo-600 px-5 py-3 text-white font-medium"
          >
            결과 페이지 보기
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("jummechu-visited");
              alert("추천 기록이 초기화됐어요!");
              pickRandomRestaurants(restaurants, category, maxDistance);
            }}
            className="rounded-2xl border px-5 py-3 font-medium"
          >
            기록 초기화
          </button>

          <Link
            href="/"
            className="rounded-2xl border px-5 py-3 font-medium"
          >
            홈으로
          </Link>
        </div>

        {picked.length === 0 && (
          <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
            <p className="font-medium">조건에 맞는 식당이 없어요.</p>
            <p className="mt-1 text-sm text-slate-500">
              음식 종류나 최대 거리를 바꾸거나, 추천 기록을 초기화해보세요.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-4">
          {picked.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl bg-white p-5 shadow-md hover:shadow-lg transition"
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
                className="inline-block mt-4 text-sm font-medium text-blue-600 hover:underline"
              >
                지도에서 보기
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}