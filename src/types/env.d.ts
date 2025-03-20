/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROPTRACK_API_KEY: string;
  readonly VITE_PROPTRACK_API_SECRET: string;
  readonly VITE_PROPTRACK_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.json' {
  const value: any;
  export default value;
} 