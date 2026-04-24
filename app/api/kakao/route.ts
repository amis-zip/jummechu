import { NextRequest, NextResponse } from "next/server";

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat, lng가 필요해요." },
        { status: 400 }
      );
    }

    if (!KAKAO_KEY) {
      return NextResponse.json(
        { error: "KAKAO_REST_API_KEY가 설정되지 않았어요." },
        { status: 500 }
      );
    }

    const radius = 1000;
    const size = 15;
    const maxPage = 3;

    const allDocs: any[] = [];

    for (let page = 1; page <= maxPage; page++) {
      const url =
        `https://dapi.kakao.com/v2/local/search/category.json` +
        `?category_group_code=FD6` +
        `&x=${lng}` +
        `&y=${lat}` +
        `&radius=${radius}` +
        `&sort=distance` +
        `&page=${page}` +
        `&size=${size}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_KEY}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { error: "카카오 API 호출 실패", detail: errorText },
          { status: res.status }
        );
      }

      const data = await res.json();

      if (Array.isArray(data.documents)) {
        allDocs.push(...data.documents);
      }

      // 마지막 페이지면 더 안 돌기
      if (data.meta?.is_end) {
        break;
      }
    }

    // place.id 기준 중복 제거
    const uniqueDocs = Array.from(
      new Map(allDocs.map((place) => [place.id, place])).values()
    );

    return NextResponse.json(uniqueDocs);
  } catch (error) {
    console.error("카카오 API 라우트 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했어요." },
      { status: 500 }
    );
  }
}