<script setup lang="ts">
import Card from 'primevue/card';
import { useSlots } from 'vue';

import type { TintableIconSet } from '../icons/iconSets';
import UiColoredIcon from './UiColoredIcon.vue';

interface Props {
  /** Accent color of the icon, any CSS color. Callers pass a palette token such as `var(--hb-color-cerulean)`. */
  color: string;
  /** Name of the icon, the file name inside the set. */
  icon: string;
  iconSet?: TintableIconSet;
}

withDefaults(defineProps<Props>(), { iconSet: 'windows11-filled' });

const slots = useSlots();
</script>

<template>
  <!-- `no-divider` drops the separator line the app gives every other card, see styles/_primevue.scss -->
  <Card class="ui-detail-card no-divider">
    <template #content>
      <div class="ui-detail-card-container">
        <div class="ui-detail-card-content">
          <div class="ui-detail-card-header">
            <slot name="header" />
          </div>

          <UiColoredIcon :set="iconSet" :name="icon" :color="color" />
        </div>

        <div v-if="slots.footer" class="ui-detail-card-footer">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
// The card inherits the text color of its surroundings, the accent is carried by the icon alone
.ui-detail-card,
.ui-detail-card-container,
.ui-detail-card-content,
.ui-detail-card-header,
.ui-detail-card-footer {
  color: inherit;
}

.ui-detail-card-content {
  display: flex;
  justify-content: space-between;
  gap: var(--hb-space-4);
}
</style>
