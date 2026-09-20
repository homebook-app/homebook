/// <reference types="vite/client" />

// Provided by the `homebookIconSprites` Vite plugin, see `vite/iconSprites.ts`
declare module 'virtual:homebook-icons' {
  export const iconSetLoaders: Record<string, () => Promise<{ names: string[]; sprite: string }>>;
}

declare module 'virtual:homebook-icons/*' {
  export const names: string[];
  export const sprite: string;
}
