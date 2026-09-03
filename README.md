# traveler-front

트래블러(Traveler) 웹 프론트엔드. 채팅으로 여행 조건을 받아 `mobility_rag` 백엔드의 추천 코스를 지도 위에 그린다.

- React 19 + Vite 5 + TypeScript + Tailwind(daisyUI)
- 지도: 네이버 지도 JS SDK, 경로: 네이버 Directions → 실패 시 OSRM 폴백
- 백엔드 통신: `/api/chat` (SSE), `/api/session/*`

## 빠른 시작

```bash
npm ci
cp .env.example .env.local   # 값 채우기 (아래 참고)
npm run dev                  # http://127.0.0.1:4173
```

Node 20.19 이상 필요. `npm install` 대신 **`npm ci`** 를 쓴다(락파일 고정).

## 환경변수

`.env.local` 에 작성한다. `.gitignore` 가 `.env*` 를 제외하므로 커밋되지 않는다.

| 이름 | 용도 | 번들 포함 |
|---|---|---|
| `VITE_API_BASE_URL` | 백엔드 주소 (기본 `http://localhost:8000`) | O |
| `VITE_MOCK_MODE` | `true` 면 백엔드 없이 목업 데이터로 동작 | O |
| `VITE_NAVER_MAP_CLIENT_ID` | 네이버 지도 JS SDK 키 | O |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 네이버 클라우드 Directions API (dev 프록시 전용) | X |
| `KORWITHSERVICE_API_KEY` | 한국관광공사 TourAPI (dev 프록시 전용) | X |

`KORWITHSERVICE_API_KEY` 는 비워두면 `../mobility_rag/.env` 의 같은 이름 값을 읽는다.
따라서 이 저장소를 `mobility_rag` 와 **형제 디렉터리**로 두면 별도 설정이 필요 없다.

## ⚠ dev 전용 프록시 (front#3)

`vite.config.ts` 는 개발 서버에만 존재하는 미들웨어 두 개를 등록한다.

| 경로 | 대상 |
|---|---|
| `/tour-place?contentId=` | TourAPI `KorService2/detailCommon2` — 장소명·좌표·설명 보강 |
| `/naver-directions/driving` | 네이버 Directions v1 — 실제 도로 경로 |

**`npm run build` 산출물에는 두 경로가 존재하지 않는다.** 그대로 배포하면
`enrichRecommendedPlaces()` 와 `getRouteNaver()` 가 404 를 받아 장소명·마커·경로선이 사라진다.
배포 전에 동일한 엔드포인트를 서버(FastAPI 라우터 또는 리버스 프록시)에 마련하고
호출 경로를 `VITE_API_BASE_URL` 기준으로 바꿔야 한다. → front#3

## 디렉터리

```
src/
  api/traveler.ts              백엔드·프록시 호출 (SSE, 세션, 경로, TourAPI 보강)
  components/                  fields · onboarding · results · travel · trust
  data/                        정적 콘텐츠·목업
  features/travel/hooks/       useRecommendationStream(SSE) · useTravelSession
  features/travel/model/       mappers · prompt · streamText(SSE 텍스트 추출)
  lib/                         naverMap(SDK 로더) · session
  pages/                       화면 9개
  types/                       api(백엔드 계약) · domain(화면 모델)
```

## 브랜치 · PR

- `master` 배포본 / `develop` 통합 / `feat/<이름>/<작업>` 작업
- PR 은 `develop` 으로, 템플릿 체크리스트를 채운다
- 커밋 메시지에 `Closes #번호` 를 적어 이슈를 닫는다

## 알려진 제약

- geolocation 은 HTTPS(또는 `127.0.0.1`)에서만 동작 — 배포 시 인증서 필수
- 네이버 지도 콘솔에 배포 도메인을 등록해야 지도 타일이 표시된다
- 백엔드가 `lat`/`lng` 를 채워주기 전에는 좌표 없는 장소가 폴백 좌표로 그려진다 → mobility_rag #27
