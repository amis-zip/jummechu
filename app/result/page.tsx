"use client";

import { useEffect, useState } from "react";
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

export default function ResultPage() {
  const [picked, setPicked] = useState<KakaoPlace[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem("jummechu-picked");
    if (saved) {
      setPicked(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const savedVotes = localStorage.getItem("jummechu-votes");
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jummechu-votes", JSON.stringify(votes));
  }, [votes]);

  const handleVote = (id: string) => {
    setVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-500">
            점메추
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            팀 점심 후보 결과
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Final lunch candidates for your team
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            지금 조건에 맞춰 고른 점심 후보예요. 팀원들과 비교해보고 오늘의 메뉴를 정해보세요.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            마음에 드는 후보에 투표해서 팀 점심 메뉴를 정할 수 있어요.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-indigo-100">
          <p className="font-medium text-slate-800">후보 상태</p>
          <p className="mt-1">
            {picked.length > 0
              ? `${picked.length}개의 점심 후보를 준비했어요.`
              : "아직 저장된 점심 후보가 없어요."}
          </p>
        </div>
      </div>

      {picked.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            아직 저장된 점심 후보가 없어요.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            추천 페이지에서 먼저 점심 후보를 받아보세요.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picked.map((place) => (
            <RestaurantCard
              key={place.id}
              place={place}
              votes={votes[place.id] || 0}
              onVote={handleVote}
              showVoteButton={true}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionButton href="/recommend" variant="primary">
          후보 다시 뽑으러 가기
        </ActionButton>

        <ActionButton
          onClick={() => {
            localStorage.removeItem("jummechu-votes");
            setVotes({});
          }}
          variant="outline"
        >
          투표 초기화
        </ActionButton>

        <ActionButton href="/" variant="outline">
          홈으로
        </ActionButton>
      </div>
    </PageShell>
  );
}