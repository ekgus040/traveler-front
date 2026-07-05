import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      naverDirectionsPlugin(env.NAVER_CLIENT_ID ?? "", env.NAVER_CLIENT_SECRET ?? ""),
    ],

    preview: {
      allowedHosts: true,
    },

    server: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
      allowedHosts: true,
    },
  };
});
