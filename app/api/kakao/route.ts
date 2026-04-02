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

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&y=${lat}&x=${lng}&radius=500`,
    {
      headers: {
        Authorization: "KakaoAK d7984cb73547b4ce84b91bbda15def5c",
      },
    }
  );

  const data = await res.json();

  console.log("카카오 원본 응답 전체:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    return Response.json(
      { error: "카카오 API 오류", detail: data },
      { status: res.status }
    );
  }

  return Response.json(data.documents ?? []);
}