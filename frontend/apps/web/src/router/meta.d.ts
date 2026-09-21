import 'vue-router';

export {};

declare module 'vue-router' {
  interface RouteMeta {
    /** Chrome around the page. `main` when not set. */
    layout?: 'main' | 'contentOnly';
    /** Sign-in required. `true` when not set, as the global `[Authorize]` of the Blazor frontend. */
    requiresAuth?: boolean;
    /** Admins only. */
    requiresAdmin?: boolean;
    /** Only reachable while the backend runs in developer mode. */
    devOnly?: boolean;
  }
}
