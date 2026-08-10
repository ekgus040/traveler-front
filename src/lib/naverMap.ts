const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";

declare global {
  interface Window {
    naver?: {
      maps: {
        LatLng: new (lat: number, lng: number) => unknown;
        Size: new (width: number, height: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        Map: new (
          element: HTMLElement,
          options: {
            center: unknown;
            zoom: number;
            zoomControl?: boolean;
            zoomControlOptions?: { position: unknown };
          },
        ) => {
          fitBounds: (bounds: unknown, padding?: number | unknown) => void;
          panTo: (position: unknown) => void;
        };
        Marker: new (options: {
          position: unknown;
          map: unknown;
          title?: string;
          icon?: {
            content: string;
            size: unknown;
            anchor: unknown;
          };
        }) => unknown;
        Polyline: new (options: {
          map: unknown;
          path: unknown[];
          strokeColor?: string;
          strokeWeight?: number;
          strokeOpacity?: number;
          strokeStyle?: "solid" | "shortdash" | "dash" | "dot" | "longdash";
          startIcon?: number;
          endIcon?: number;
          endIconSize?: number;
        }) => unknown;
        InfoWindow: new (options: { content: string; borderWidth?: number; backgroundColor?: string }) => {
          open: (map: unknown, marker: unknown) => void;
          close: () => void;
        };
        LatLngBounds: new () => {
          extend: (latLng: unknown) => void;
        };
        Position: {
          TOP_RIGHT: unknown;
        };
        Event: {
          addListener: (target: unknown, type: string, listener: () => void) => unknown;
        };
      };
    };
  }
}

export async function loadNaverMapScript(clientId: string) {
  if (!clientId) {
    throw new Error("네이버 지도 Client ID가 없습니다.");
  }

  if (isNaverMapsReady()) {
    return window.naver!.maps;
  }

  const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return pollForNaverMaps();
  }

  const script = document.createElement("script");
  script.id = NAVER_MAP_SCRIPT_ID;
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
  script.async = true;

  const loaded = new Promise<void>((resolve, reject) => {
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("네이버 지도 SDK 로드에 실패했습니다."));
  });

  document.head.appendChild(script);
  await loaded;

  return pollForNaverMaps();
}

function isNaverMapsReady(): boolean {
  const maps = window.naver?.maps;
  return Boolean(
    maps
      && typeof maps.LatLng === "function"
      && typeof maps.Map === "function"
      && typeof maps.LatLngBounds === "function",
  );
}

async function pollForNaverMaps() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (isNaverMapsReady()) {
      return window.naver!.maps;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error("네이버 지도 SDK 초기화에 실패했습니다. Client ID와 Web 서비스 URL을 확인하세요.");
}
