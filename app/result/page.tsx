"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
};

type VoteRow = {
  id: number;
  room_id: string;
  place_id: string;
  place_name: string;
  count: number;
  created_at: string;
};

function ResultPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [picked, setPicked] = useState<KakaoPlace[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [shareUrl, setShareUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [ranking, setRanking] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const savedPicked = localStorage.getItem("jummechu-picked");
    if (savedPicked) {
      setPicked(JSON.parse(savedPicked));
    }

    const savedCompany = localStorage.getItem("jummechu-company-name");
    if (savedCompany) {
      setCompanyName(savedCompany);
    }

    const savedRoom = localStorage.getItem("jummechu-room-name");
    if (savedRoom) {
      setRoomName(savedRoom);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const fetchVotes = async () => {
    if (!roomId) return;

    setLoadingVotes(true);

    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("room_id", roomId);

    if (error) {
      console.error("투표 조회 실패:", error);
      setMessageType("error");
      setVoteMessage("투표 현황을 불러오지 못했어요.");
      setLoadingVotes(false);
      return;
    }

    const mapped: Record<string, number> = {};

    (data as VoteRow[] | null)?.forEach((vote) => {
      mapped[vote.place_id] = vote.count;
    });

    setVotes(mapped);
    setLoadingVotes(false);
  };

  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from("votes")
      .select("place_name, count");

    if (error) {
      console.error("랭킹 조회 실패:", error);
      return;
    }

    const grouped = (data ?? []).reduce((acc, cur) => {
      const name = cur.place_name;
      const count = cur.count ?? 0;

      if (!acc[name]) {
        acc[name] = { name, count: 0 };
      }

      acc[name].count += count;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);

    const result = Object.values(grouped).sort((a, b) => b.count - a.count);

    setRanking(result);
  };

  useEffect(() => {
    if (!roomId) return;

    fetchVotes();
    fetchRanking();

    const channel = supabase
      .channel(`votes-realtime-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchVotes();
          fetchRanking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const getVoteStorageKey = (currentRoomId: string, placeId: string) => {
    return `jummechu-voted-${currentRoomId}-${placeId}`;
  };

  const hasAlreadyVoted = (currentRoomId: string, placeId: string) => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem(getVoteStorageKey(currentRoomId, placeId)) === "true"
    );
  };

  const markAsVoted = (currentRoomId: string, placeId: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getVoteStorageKey(currentRoomId, placeId), "true");
  };

  const handleVote = async (place: KakaoPlace) => {
    if (!roomId) {
      setMessageType("error");
      setVoteMessage("공유된 투표방 정보가 없어요. 후보를 다시 만들어 주세요.");
      return;
    }

    if (hasAlreadyVoted(roomId, place.id)) {
      setMessageType("info");
      setVoteMessage("이 후보에는 이미 투표했어요.");
      return;
    }

    setVoteMessage("");

    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("room_id", roomId)
      .eq("place_id", place.id)
      .maybeSingle();

    if (error) {
      console.error("투표 조회 실패:", error);
      setMessageType("error");
      setVoteMessage("투표를 처리하는 중 문제가 생겼어요.");
      return;
    }

    if (data) {
      const current = data as VoteRow;

      const { error: updateError } = await supabase
        .from("votes")
        .update({ count: current.count + 1 })
        .eq("id", current.id);

      if (updateError) {
        console.error("투표 업데이트 실패:", updateError);
        setMessageType("error");
        setVoteMessage("투표를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("votes").insert({
        room_id: roomId,
        place_id: place.id,
        place_name: place.place_name,
        count: 1,
      });

      if (insertError) {
        console.error("투표 생성 실패:", insertError);
        setMessageType("error");
        setVoteMessage("투표를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
    }

    markAsVoted(roomId, place.id);
    setMessageType("success");
    setVoteMessage("투표가 반영됐어요.");
    fetchVotes();
    fetchRanking();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("공유 링크를 복사했어요.");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
      setCopyMessage("링크를 복사하지 못했어요.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const maxVote = useMemo(() => {
    const values = Object.values(votes);
    if (values.length === 0) return 0;
    return Math.max(...values);
  }, [votes]);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-rose-500">
            점메추
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {companyName && roomName
              ? `${companyName} · ${roomName}`
              : roomName
              ? `${roomName} 점심 후보`
              : "오늘의 점심 후보"}
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Final lunch candidates for your team
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            팀원들과 후보를 비교하고, 가장 마음에 드는 메뉴에 투표해보세요.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            링크를 공유하면 같은 화면에서 함께 결정할 수 있어요.
          </p>
        </div>

        <div className="rounded-2xl bg-pink-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-pink-100 shadow-sm">
          <p className="font-medium text-slate-800">진행 상태</p>
          <p className="mt-1">
            {picked.length > 0
              ? `${picked.length}개의 후보가 준비됐어요.`
              : "아직 후보가 준비되지 않았어요."}
          </p>
          {loadingVotes && (
            <p className="mt-2 text-xs text-slate-500">
              투표 현황을 불러오는 중...
            </p>
          )}
        </div>
      </div>

      {!roomId && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">공유 정보가 없어요.</p>
          <p className="mt-1 text-sm text-amber-700">
            추천 페이지에서 후보를 다시 만든 뒤 결과 화면으로 이동해 주세요.
          </p>
        </div>
      )}

      {voteMessage && (
        <div
          className={`mt-6 rounded-2xl p-4 ring-1 transition-all duration-300 ${
            messageType === "success"
              ? "border border-emerald-200 bg-emerald-50 ring-emerald-100"
              : messageType === "error"
              ? "border border-rose-200 bg-rose-50 ring-rose-100"
              : "border border-amber-200 bg-amber-50 ring-amber-100"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              messageType === "success"
                ? "text-emerald-900"
                : messageType === "error"
                ? "text-rose-900"
                : "text-amber-900"
            }`}
          >
            {voteMessage}
          </p>
        </div>
      )}

      {roomId && (
        <div className="mt-6 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 p-5 ring-1 ring-rose-100 shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            팀원에게 이 링크를 공유하세요
          </p>
          <p className="mt-2 text-sm text-slate-500">
            같은 링크로 들어오면 같은 후보에 함께 투표할 수 있어요.
          </p>

          <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-rose-100">
            <p className="break-all text-sm text-rose-600">{shareUrl}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
            >
              공유 링크 복사
            </button>

            {copyMessage && (
              <p className="text-sm font-medium text-slate-600">
                {copyMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {picked.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            아직 표시할 후보가 없어요.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            추천 페이지에서 먼저 후보를 만든 뒤 다시 들어와 주세요.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picked.map((place, index) => {
            const currentVotes = votes[place.id] || 0;
            const isLeader = maxVote > 0 && currentVotes === maxVote;

            return (
              <div
                key={place.id}
                className="animate-[fadeUp_.5s_ease-out] opacity-0"
                style={{
                  animationDelay: `${index * 120}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <RestaurantCard
                  place={place}
                  votes={currentVotes}
                  onVote={handleVote}
                  showVoteButton={true}
                  isLeader={isLeader}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionButton href="/recommend" variant="primary">
          후보 다시 만들기
        </ActionButton>

        <ActionButton
          onClick={async () => {
            if (!roomId) return;

            const { error } = await supabase
              .from("votes")
              .delete()
              .eq("room_id", roomId);

            if (error) {
              console.error("투표 초기화 실패:", error);
              setMessageType("error");
              setVoteMessage("투표를 초기화하지 못했어요.");
              return;
            }

            setVotes({});

            picked.forEach((place) => {
              localStorage.removeItem(getVoteStorageKey(roomId, place.id));
            });

            setMessageType("success");
            setVoteMessage("투표를 초기화했어요.");
            fetchRanking();
          }}
          variant="outline"
        >
          투표 새로 시작하기
        </ActionButton>

        <ActionButton href="/" variant="outline">
          처음으로
        </ActionButton>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">🔥 인기 메뉴 랭킹</h2>
        <p className="mt-2 text-sm text-slate-500">
          지금까지 가장 많은 표를 받은 메뉴예요.
        </p>

        <div className="mt-4 space-y-2">
          {ranking.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                아직 집계된 랭킹이 없어요.
              </p>
            </div>
          ) : (
            ranking.slice(0, 5).map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100"
              >
                <span className="font-medium text-slate-800">
                  {idx + 1}위 · {item.name}
                </span>
                <span className="font-semibold text-rose-500">
                  {item.count}표
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="py-16 text-center text-slate-500">
            결과 화면을 불러오는 중...
          </div>
        </PageShell>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}