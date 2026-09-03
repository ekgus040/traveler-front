import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { resolve } from "node:path";

function naverDirectionsPlugin(clientId: string, clientSecret: string): Plugin {
  return {
    name: "naver-directions-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/naver-directions/")) return next();

        try {
          const path = url.replace("/naver-directions", "/map-direction/v1");
          const targetUrl = `https://naveropenapi.apigw.ntruss.com${path}`;

          const upstream = await fetch(targetUrl, {
            headers: {
              "X-NCP-APIGW-API-KEY-ID": clientId,
              "X-NCP-APIGW-API-KEY": clientSecret,
            },
          });

          const body = await upstream.text();
          res.writeHead(upstream.status, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });
          res.end(body);
        } catch (e) {
          console.error("[naver-proxy] 오류:", e);
          next();
        }
      });
    },
  };
}

function tourPlacePlugin(apiKey: string): Plugin {
  const cache = new Map<string, string>();

  return {
    name: "tour-place-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? "", "http://localhost");
        if (requestUrl.pathname !== "/tour-place") return next();

        const contentId = requestUrl.searchParams.get("contentId") ?? "";
        if (!/^\d+$/.test(contentId)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "유효한 contentId가 필요합니다." }));
          return;
        }

        if (!apiKey) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "TourAPI 키가 없습니다." }));
          return;
        }

        const cached = cache.get(contentId);
        if (cached) {
          res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" });
          res.end(cached);
          return;
        }

        try {
          const params = new URLSearchParams({
            serviceKey: apiKey,
            MobileOS: "ETC",
            MobileApp: "Traveler",
            _type: "json",
            contentId,
          });
          const upstream = await fetch(
            `https://apis.data.go.kr/B551011/KorService2/detailCommon2?${params.toString()}`,
            { signal: AbortSignal.timeout(10_000) },
          );
          const data = await upstream.json() as {
            response?: {
              header?: { resultCode?: string; resultMsg?: string };
              body?: { items?: { item?: TourApiPlace[] | TourApiPlace } | string };
            };
          };
          const items = data.response?.body?.items;
          const rawItem = typeof items === "object" ? items.item : undefined;
          const item = Array.isArray(rawItem) ? rawItem[0] : rawItem;

          if (!upstream.ok || data.response?.header?.resultCode !== "0000" || !item) {
            res.writeHead(upstream.ok ? 404 : upstream.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: data.response?.header?.resultMsg ?? "장소 정보를 찾지 못했습니다." }));
            return;
          }

          const payload = JSON.stringify({
            place_id: String(item.contentid ?? contentId),
            place_name: item.title ?? null,
            category: item.lclsSystm1 ?? null,
            lat: toFiniteNumber(item.mapy),
            lng: toFiniteNumber(item.mapx),
            description: item.overview ?? null,
          });
          cache.set(contentId, payload);
          res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" });
          res.end(payload);
        } catch (error) {
          console.error("[tour-place-proxy] 오류:", error);
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "TourAPI 장소 조회에 실패했습니다." }));
        }
      });
    },
  };
}

type TourApiPlace = {
  contentid?: string;
  title?: string;
  mapx?: string;
  mapy?: string;
  lclsSystm1?: string;
  overview?: string;
};

function toFiniteNumber(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendEnv = loadEnv(mode, resolve(process.cwd(), "../mobility_rag"), "");

  return {
    plugins: [
      react(),
      naverDirectionsPlugin(env.NAVER_CLIENT_ID ?? "", env.NAVER_CLIENT_SECRET ?? ""),
      tourPlacePlugin(env.KORWITHSERVICE_API_KEY ?? backendEnv.KORWITHSERVICE_API_KEY ?? ""),
    ],

    preview: {
      allowedHosts: true,
    },

    server: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
        },
        "/health": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
        },
      },
    },
  };
});
