<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const STEPS = 10;
</script>

<template>
  <section class="hb-proof-frosted">
    <h2>{{ t('settings.developer.frosted.title') }}</h2>

    <div v-for="family in ['frosted-b', 'frosted-bg-b']" :key="family" class="hb-proof-frosted__row">
      <!-- Class names are identifiers, not copy -->
      <div v-for="step in STEPS" :key="step" class="hb-proof-frosted__tile" :class="family + step">
        .{{ family + step }}
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hb-proof-frosted__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cell-gap);
  margin-bottom: var(--cell-gap);
}

.hb-proof-frosted__tile {
  // `.frosted-bg-*` leaves the positioning to its host
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--cell-size) * 2);
  height: calc(var(--cell-size) + var(--cell-gap));
  box-sizing: border-box;
  border-radius: var(--hb-border-radius-default);
  font-size: var(--hb-font-size-caption);
}
</style>
