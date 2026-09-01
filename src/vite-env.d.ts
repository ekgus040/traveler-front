/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_NAVER_MAP_CLIENT_ID?: string;
  readonly VITE_MOCK_MODE?: string;
  readonly VITE_PROXY_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "lucide-react/dist/esm/icons/*.mjs" {
  import type { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}
