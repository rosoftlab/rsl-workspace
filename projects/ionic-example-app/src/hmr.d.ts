// src/hmr.d.ts
interface ImportMeta {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
}
