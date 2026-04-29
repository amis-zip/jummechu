"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import ActionButton from "@/components/ActionButton";
import RestaurantCard from "@/components/RestaurantCard";
import { supabase } from "@/lib/supabase";

type KakaoPlace = {
  id: string;
  place_name: string;
  road_address_name?: string;
  address_name: string;
  distance: string;
  category_name?: string;
  priceRange?: string;
};

const excludeKeywords = [
  "주점",
  "술집",
  "포차",
  "호프",
  "바",
  "이자카야",
  "횟집",
  "해산물",
  "조개",
  "생선",
  "오마카세",
];

const getPriceRange = (place: KakaoPlace) => {
  const text = `${place.place_name} ${place.category_name ?? ""}`;

  if (text.includes("분식") || text.includes("김밥") || text.includes("우동"))
    return "💰 7천~1만원 예상";

  if (text.includes("국밥") || text.includes("한식") || text.includes("백반"))
    return "💰 9천~1.3만원 예상";

  if (text.includes("중식") || text.includes("짜장") || text.includes("짬뽕"))
    return "💰 8천~1.3만원 예상";

  if (text.includes("일식") || text.includes("초밥") || text.includes("돈카츠"))
    return "💰 1.1~1.8만원 예상";

  if (text.includes("양식") || text.includes("파스타") || text.includes("피자"))
    return "💰 1.3~2만원 예상";

  if (text.includes("고기") || text.includes("삼겹살") || text.includes("갈비"))
    return "💰 1.5만원 이상 예상";

  return "💰 1만~1.5만원 예상";
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
  const [roomName, setRoomName] = useState("");

  const saveVisited = (list: KakaoPlace[]) => {
    const prev = JSON.parse(
      localStorage.getItem("jummechu-visited") || "[]"
    ) as string[];

    const ids = list.map((place) => place.id);
    const updated = [...new Set([...prev, ...ids])].slice(-5);

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

    let filtered = list.filter((place) => {
      const distance = Number(place.distance);
      return Number.isFinite(distance) && distance <= selectedDistance;
    });

    filtered = filtered.filter((place) => {
      const text = `${place.place_name} ${place.category_name ?? ""}`;
      return !excludeKeywords.some((keyword) => text.includes(keyword));
    });

    if (selectedCategory !== "전체") {
      filtered = filtered.filter((place) =>
        place.category_name?.includes(selectedCategory)
      );
    }

    let freshCandidates = filtered.filter((place) => !visited.includes(place.id));

    if (freshCandidates.length < 3) {
      freshCandidates = filtered;
    }

    const shuffled = [...freshCandidates]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    const selected = shuffled.slice(0, 3).map((place) => ({
      ...place,
      priceRange: getPriceRange(place),
    }));

    setPicked(selected);

    if (selected.length === 0) {
      setMessage("조건에 맞는 점심 후보를 찾지 못했어요.");
    } else {
      setMessage(`${freshCandidates.length}개의 후보 중에서 골랐어요.`);
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
          <p className="text-sm font-semibold tracking-wide text-rose-500">
            점메추
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            팀 점심 후보 추천
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            주점, 해산물 등 점심 후보로 부적합한 메뉴는 자동으로 제외하고
            예상 가격대도 함께 보여드려요.
          </p>
        </div>

        <div className="rounded-2xl bg-pink-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-pink-100">
          <p className="font-medium text-slate-800">추천 상태</p>
          <p className="mt-1">{message}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-rose-100">
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

        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-rose-100">
          <p className="text-sm font-medium text-slate-500">추천 조건</p>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              음식 종류
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-800 shadow-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-800 shadow-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            >
              <option value={300}>300m 이하</option>
              <option value={500}>500m 이하</option>
              <option value={1000}>1km 이하</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          팀 이름 / 방 이름
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="예: 마케팅팀 점심"
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton
          onClick={() => pickRandomRestaurants(restaurants, category, maxDistance)}
          variant="primary"
        >
          후보 다시 뽑기
        </ActionButton>

        <ActionButton
          onClick={async () => {
            if (picked.length === 0) {
              alert("먼저 후보를 뽑아주세요.");
              return;
            }

            const roomId = crypto.randomUUID();

            const { error } = await supabase.from("rooms").insert({
              id: roomId,
              room_name: roomName || "점심 후보",
              candidates: picked,
            });

            if (error) {
              console.error("방 저장 실패:", error);
              alert("방을 저장하지 못했어요.");
              return;
            }

            localStorage.setItem("jummechu-picked", JSON.stringify(picked));
            localStorage.setItem("jummechu-room-name", roomName || "점심 후보");

            saveVisited(picked);

            router.push(`/result?room=${roomId}`);
          }}
          variant="secondary"
        >
          후보 결과 보기
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

      {picked.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">
            조건에 맞는 점심 후보를 찾지 못했어요.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            음식 종류나 최대 거리를 바꾸거나, 추천 기록을 초기화해보세요.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picked.map((place, index) => (
            <div
              key={place.id}
              className="animate-[fadeUp_.5s_ease-out] opacity-0"
              style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: "forwards",
              }}
            >
              <RestaurantCard place={place} />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}