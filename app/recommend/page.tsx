"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import ActionButton from "@/components/ActionButton";
import RestaurantCard from "@/components/RestaurantCard";

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
    const prev = JSON.parse(
      localStorage.getItem("jummechu-visited") || "[]"
    ) as string[];

    const ids = list.map((place) => place.id);
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
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
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
    <PageShell>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-500">
            점메추
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            내 위치 기반 점심 추천
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Lunch recommendation for your location
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            지금 위치를 기준으로, 조건에 맞는 점심 후보를 빠르게 골라드려요.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-blue-100">
          <p className="font-medium text-slate-800">상태</p>
          <p className="mt-1">{message}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-500">현재 위치 정보</p>
          <div className="mt-3 space-y-2 text-slate-800">
            <p>
              <span className="font-medium">위도</span>{" "}
              <span className="text-slate-600">{lat ?? "아직 없음"}</span>
            </p>
            <p>
              <span className="font-medium">경도</span>{" "}
              <span className="text-slate-600">{lng ?? "아직 없음"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-500">추천 조건</p>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              음식 종류
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              <option value="전체">전체</option>
              <option value="한식">한식</option>
              <option value="일식">일식</option>
              <option value="중식">중식</option>
              <option value="양식">양식</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              최대 거리
            </label>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              <option value={300}>300m 이하</option>
              <option value={500}>500m 이하</option>
              <option value={1000}>1km 이하</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton
          onClick={() => pickRandomRestaurants(restaurants, category, maxDistance)}
          variant="primary"
        >
          다시 추천
        </ActionButton>

        <ActionButton
          onClick={() => {
            localStorage.setItem("jummechu-picked", JSON.stringify(picked));
            saveVisited(picked);
            router.push("/result");
          }}
          variant="secondary"
        >
          결과 페이지 보기
        </ActionButton>

        <ActionButton
          onClick={() => {
            localStorage.removeItem("jummechu-visited");
            alert("추천 기록이 초기화됐어요!");
            pickRandomRestaurants(restaurants, category, maxDistance);
          }}
          variant="outline"
        >
          기록 초기화
        </ActionButton>

        <ActionButton href="/" variant="outline">
          홈으로
        </ActionButton>
      </div>

      {picked.length === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">
            조건에 맞는 식당이 없어요.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            음식 종류나 최대 거리를 바꾸거나, 추천 기록을 초기화해보세요.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {picked.map((place) => (
          <RestaurantCard key={place.id} place={place} />
        ))}
      </div>
    </PageShell>
  );
}