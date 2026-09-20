export { default as UiColoredIcon } from './components/UiColoredIcon.vue';
export { default as UiIcon } from './components/UiIcon.vue';
export { default as UiPictogram } from './components/UiPictogram.vue';
export {
  useIconSprite,
  type IconSize,
  type UseIconSprite,
  type UseIconSpriteOptions,
} from './composables/useIconSprite';
export {
  createIconRegistry,
  getIconRegistry,
  iconRegistryKey,
  type IconRegistry,
  type IconSetLoaders,
  type IconSetModule,
} from './icons/iconRegistry';
export {
  iconSets,
  iconSymbolId,
  isTintableIconSet,
  multicolorIconSets,
  tintableIconSets,
  type IconSetName,
  type MulticolorIconSet,
  type TintableIconSet,
} from './icons/iconSets';
export * from './theme';
