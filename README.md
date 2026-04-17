# 🍽️ 점메추 (Jummechu)

팀원들과 함께 점심 메뉴를 빠르게 결정하는 서비스  
👉 랜덤 추천 + 실시간 투표 + 랭킹

---

## 🚀 배포 링크

👉 https://jummechu-five.vercel.app  
(배포 후 링크로 교체)

---

## ✨ 주요 기능

### 🥢 점심 메뉴 추천
- 카카오 API 기반 음식점 검색
- 랜덤으로 후보 3개 선정

### 🗳️ 실시간 투표
- 팀원들과 동시에 투표 가능
- Supabase 기반 실시간 반영

### 🔗 링크 공유
- URL 공유로 같은 방 참여
- 별도 로그인 없이 사용 가능

### 🏆 인기 메뉴 랭킹
- 전체 투표 데이터 기반 집계
- 실시간으로 순위 업데이트

---

## 🛠️ 기술 스택

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend / DB
- Supabase (PostgreSQL + Realtime)

### API
- Kakao Local API

### Deployment
- Vercel

---

## 📁 프로젝트 구조

```bash
app/
  recommend/   # 메뉴 추천 페이지
  result/      # 결과 + 투표 페이지
components/
  RestaurantCard.tsx
  ActionButton.tsx
lib/
  supabase.ts