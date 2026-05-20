/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Portal origin for QR codes and external links (no trailing slash). */
  readonly VITE_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing SVGs as modules returning the URL string
declare module "*.svg" {
  const src: string;
  export default src;
}
