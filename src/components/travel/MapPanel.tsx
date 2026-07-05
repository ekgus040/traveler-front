import { useEffect, useMemo, useRef, useState } from "react";
import { getRouteNaver, getRouteOSRM } from "../../api/traveler";
import { DEFAULT_RECOMMENDATION_COORDINATES } from "../../data/content";
import { loadNaverMapScript } from "../../lib/naverMap";
import type { Place, PlaceBadge } from "../../types/domain";

type MapPanelProps = {
  title: string;
  subtitle: string;
  description: string;
  notes: string[];
  places: Place[];
  modeKey?: string;
  badgeLabel?: string;
};

// 명소: teal, 히든: orange, 없음: navy
const MARKER_STYLE: Record<string, { bg: string; label: string }> = {
  명소: { bg: "#2D9C8C", label: "명소" },
  히든: { bg: "#F07A3B", label: "히든" },
  default: { bg: "#1C2B4A", label: "" },
};

function markerHtml(index: number, badge?: PlaceBadge): string {
  const style = badge ? (MARKER_STYLE[badge] ?? MARKER_STYLE.default) : MARKER_STYLE.default;
  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:36px;height:36px;border-radius:9999px;
        background:${style.bg};color:#fff;
        font:700 13px 'Noto Sans KR',sans-serif;
        box-shadow:0 4px 12px rgba(0,0,0,.28);
        border:2.5px solid #fff;
      ">${index + 1}</div>
      ${badge ? `
        <div style="
          margin-top:2px;padding:1px 5px;
          background:${style.bg};color:#fff;
          font:600 9px 'Noto Sans KR',sans-serif;
          border-radius:4px;white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,.2);
        ">${style.label}</div>
      ` : ""}
    </div>
  `;
}

function infoWindowHtml(place: Place): string {
  const badgeColor = place.badge === "명소" ? "#2D9C8C" : place.badge === "히든" ? "#F07A3B" : "#6B7280";
  const badgeHtml = place.badge
    ? `<span style="display:inline-block;margin-bottom:6px;padding:1px 7px;
         background:${badgeColor}1a;color:${badgeColor};
         font:600 10px 'Noto Sans KR',sans-serif;
         border-radius:20px;border:1px solid ${badgeColor}44;">${place.badge}</span>`
    : "";
  return `
    <div style="padding:10px 13px;min-width:150px;max-width:210px;font-family:'Noto Sans KR',sans-serif;">
      ${badgeHtml}
      <strong style="display:block;font-size:13px;color:#1C2B4A;line-height:1.4;">${place.title}</strong>
      <span style="display:block;margin-top:3px;font-size:11px;color:#9CA3AF;">${place.category}</span>
    </div>
  `;
}

export function MapPanel({ notes, places, modeKey = "nearby" }: MapPanelProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "done" | "osrm" | "fallback">("idle");

  const modeSummary =
    modeKey === "longdist"
      ? "출발지와 도착지 사이에 쉬기 좋은 경유지를 함께 보는 장거리 흐름"
      : modeKey === "remote"
        ? "낯선 지역에서도 헤매지 않도록 밀도를 조절한 타지 여행 흐름"
        : "이동 시간을 아껴 한 지역 안에서 만족도를 높이는 근교 흐름";

  const coordinatePlaces = useMemo(
    () => places.filter((p) => p.coordinates),
    [places],
  );

  const landmarkCount = useMemo(() => coordinatePlaces.filter((p) => p.badge === "명소").length, [coordinatePlaces]);
  const hiddenCount = useMemo(() => coordinatePlaces.filter((p) => p.badge === "히든").length, [coordinatePlaces]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
    const mapElement = mapElementRef.current;

    if (!clientId || !mapElement) return;

    let disposed = false;

    async function renderMap() {
      try {
        const maps = await loadNaverMapScript(clientId as string);
        if (!maps || disposed || !mapElementRef.current) return;

        const fallbackCenter = new maps.LatLng(
          DEFAULT_RECOMMENDATION_COORDINATES.lat,
          DEFAULT_RECOMMENDATION_COORDINATES.lon,
        );

        const map = new maps.Map(mapElementRef.current, {
          center: fallbackCenter,
          zoom: coordinatePlaces.length > 1 ? 10 : 13,
          zoomControl: true,
          zoomControlOptions: { position: maps.Position.TOP_RIGHT },
        });

        const bounds = new maps.LatLngBounds();
        const straightPath: unknown[] = [];   // 직선 fallback용
        const openInfoWindows: Array<{ open: (map: unknown, marker: unknown) => void; close: () => void }> = [];
        let boundsCount = 0;

        // ── 마커 배치 ──────────────────────────────────────────
        coordinatePlaces.forEach((place, index) => {
          if (!place.coordinates) return;

          const latLng = new maps.LatLng(place.coordinates.lat, place.coordinates.lon);
          bounds.extend(latLng);
          boundsCount++;
          straightPath.push(latLng);

          const marker = new maps.Marker({
            position: latLng,
            map,
            title: place.title,
            icon: {
              content: markerHtml(index, place.badge),
              size: new maps.Size(36, place.badge ? 52 : 36),
              anchor: new maps.Point(18, place.badge ? 52 : 36),
            },
          });

          const infoWindow = new maps.InfoWindow({
            content: infoWindowHtml(place),
            borderWidth: 0,
            backgroundColor: "transparent",
          });

          openInfoWindows.push(infoWindow);

          maps.Event.addListener(marker, "click", () => {
            openInfoWindows.forEach((iw, i) => {
              if (i === index) iw.open(map, marker);
              else iw.close();
            });
          });
        });

        if (boundsCount > 0) {
          map.fitBounds(bounds, 60);
        }

        setMapError(null);

        // ── Polyline 그리기 ────────────────────────────────────
        if (coordinatePlaces.length < 2) return;

        setRouteStatus("loading");

        // 1차: 네이버 길찾기 API
        const coords = coordinatePlaces.map((p) => p.coordinates!);
        let routePath = await getRouteNaver(coords);
        let routeSource: "naver" | "osrm" | null = routePath.length >= 2 ? "naver" : null;

        // 2차: OSRM fallback (OpenStreetMap 기반 실제 도로 경로)
        if (!routeSource) {
          routePath = await getRouteOSRM(coords);
          routeSource = routePath.length >= 2 ? "osrm" : null;
        }

        if (disposed) return;

        if (routeSource) {
          const polylinePath = routePath.map(([lat, lon]) => new maps.LatLng(lat, lon));
          new maps.Polyline({
            map,
            path: polylinePath,
            strokeColor: "#2D9C8C",
            strokeWeight: 4,
            strokeOpacity: 0.85,
            strokeStyle: "solid",
            endIcon: 2,
            endIconSize: 12,
          });
          setRouteStatus(routeSource === "naver" ? "done" : "osrm");
        } else {
          // 모든 API 실패 → 직선으로 fallback
          new maps.Polyline({
            map,
            path: straightPath,
            strokeColor: "#2D9C8C",
            strokeWeight: 3,
            strokeOpacity: 0.55,
            strokeStyle: "shortdash",
          });
          setRouteStatus("fallback");
        }
      } catch (error) {
        if (!disposed) {
          setMapError(error instanceof Error ? error.message : "네이버 지도를 불러오지 못했습니다.");
        }
      }
    }

    void renderMap();

    return () => {
      disposed = true;
    };
  }, [coordinatePlaces]);

  const hasClientId = Boolean(import.meta.env.VITE_NAVER_MAP_CLIENT_ID);

  return (
    <div className="space-y-3 p-4">
      {/* 이동 가이드 */}
      <div className="rounded-[10px] bg-[#EBF6F4] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2D9C8C]/70">이동 가이드</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#1C2B4A]">{modeSummary}</p>
      </div>

      {/* 지도 */}
      <div className="map-stage">
        <div ref={mapElementRef} className="h-full w-full" />

        {!hasClientId && (
          <div className="map-overlay-card">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">지도 설정 필요</p>
            <strong className="mt-2 block text-[14px] text-[#1C2B4A]">
              VITE_NAVER_MAP_CLIENT_ID를 설정하면 마커와 경로가 표시됩니다.
            </strong>
          </div>
        )}
        {hasClientId && mapError && (
          <div className="map-overlay-card">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">지도 오류</p>
            <strong className="mt-2 block text-[14px] text-[#1C2B4A]">{mapError}</strong>
          </div>
        )}
        {hasClientId && !mapError && coordinatePlaces.length === 0 && (
          <div className="map-overlay-card">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">좌표 대기 중</p>
            <strong className="mt-2 block text-[14px] text-[#1C2B4A]">
              추천 결과가 도착하면 마커와 경로가 표시됩니다.
            </strong>
          </div>
        )}
      </div>

      {/* 범례 */}
      {coordinatePlaces.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" viewBox="0 0 20 4">
              <line
                x1="0" y1="2" x2="20" y2="2"
                stroke="#2D9C8C" strokeWidth="2.5"
                strokeDasharray={routeStatus === "fallback" ? "5 3" : undefined}
              />
            </svg>
            {routeStatus === "loading" && "경로 로딩 중..."}
            {routeStatus === "done" && "실제 도로 경로 (네이버)"}
            {routeStatus === "osrm" && "실제 도로 경로 (OSM)"}
            {routeStatus === "fallback" && "직선 경로"}
            {routeStatus === "idle" && "경로"}
          </div>
          {landmarkCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#2D9C8C]" />
              명소 {landmarkCount}곳
            </div>
          )}
          {hiddenCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#F07A3B]" />
              히든 {hiddenCount}곳
            </div>
          )}
        </div>
      )}

      {/* 노트 태그 */}
      <div className="flex flex-wrap gap-1.5">
        {notes.map((note) => (
          <span key={note} className="rounded-full border border-[#E8E4DC] bg-white px-3 py-1.5 text-[12px] text-[#6B7280]">
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MapPanel;
