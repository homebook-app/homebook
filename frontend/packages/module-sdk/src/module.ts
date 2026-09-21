import type { IconSetName, TintableIconSet, UiWidgetSize } from '@homebook/ui';
import type { App, Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

/** A nested translation catalog as stored in the module's `locales/<language>.json`. */
export interface LocaleMessageTree {
  [key: string]: string | LocaleMessageTree;
}

/** A tile on the start page. Title and caption are translation keys, resolved by the app. */
export interface StartMenuItemDefinition {
  titleKey: string;
  captionKey: string;
  url: string;
  icon: string;
  iconSet?: TintableIconSet;
  /** Accent color as a token reference, e.g. `var(--hb-color-amber)`. */
  color: string;
}

/** A widget the module offers for the start page grid. */
export interface WidgetDefinition {
  key: string;
  component: Component;
  sizes: readonly UiWidgetSize[];
}

/** One search hit, as the backend returns it. */
export interface SearchResultItem {
  identifier: string;
  title: string;
  description?: string | null;
}

/** Props every search result component receives. */
export interface SearchResultComponentProps {
  items: readonly SearchResultItem[];
}

/**
 * A HomeBook frontend module. The app imports every module statically and registers it at
 * startup: routes go into the router, messages into i18n, start menu items onto the start page.
 */
export interface HomeBookModule {
  /** Identical to the backend module key, e.g. `homebook.kitchen`. */
  key: string;
  /** Translation keys inside the module's own catalog. */
  nameKey: string;
  descriptionKey: string;
  icon: { set: IconSetName; name: string };
  routes: readonly RouteRecordRaw[];
  startMenuItems: readonly StartMenuItemDefinition[];
  widgets: readonly WidgetDefinition[];
  /**
   * Result components by the backend search module key, which is the full name of the search
   * handler type, e.g. `HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler`.
   */
  searchResultComponents: Readonly<Record<string, Component>>;
  /** The module's catalog by language code (`en`, `de`, ...). Keys are namespaced by the module. */
  messages: Readonly<Record<string, LocaleMessageTree>>;
  /** Optional registration of the module's own dependencies. */
  setup?(app: App): void;
}

/** Identity helper that gives a module definition its type. */
export function defineModule(module: HomeBookModule): HomeBookModule {
  return module;
}
