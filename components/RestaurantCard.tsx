type KakaoPlace = {
  id: string;
  place_name: string;
  road_address_name?: string;
  address_name: string;
  distance: string;
  category_name?: string;
};

type RestaurantCardProps = {
  place: KakaoPlace;
  votes?: number;
  onVote?: (id: string) => void;
  showVoteButton?: boolean;
};

export default function RestaurantCard({
  place,
  votes = 0,
  onVote,
  showVoteButton = false,
}: RestaurantCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold leading-snug text-slate-900">
          {place.place_name}
        </h2>

        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
          {place.category_name?.split(">").pop()?.trim() ?? "기타"}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-blue-500">
        📍 {place.distance}m
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        🏠 {place.road_address_name || place.address_name}
      </p>

      <a
        href={`https://map.kakao.com/link/search/${encodeURIComponent(
          place.place_name
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex mt-4 items-center rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-100"
      >
        지도에서 보기
      </a>

      {showVoteButton && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-700">
            현재 <span className="text-blue-600">{votes}표</span>
          </p>

          <button
            type="button"
            onClick={() => onVote?.(place.id)}
            className="mt-3 w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-blue-600 active:scale-[0.98]"
          >
            이 메뉴로 투표하기
          </button>
        </div>
      )}
    </div>
  );
}