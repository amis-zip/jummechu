export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return Response.json(
      { error: "lat 또는 lng가 없어요." },
      { status: 400 }
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "KAKAO_REST_API_KEY 환경변수가 없어요." },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&y=${lat}&x=${lng}&radius=1000`,
    {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(
      { error: "카카오 API 오류", detail: data },
      { status: res.status }
    );
  }

  return Response.json(data.documents ?? []);
}