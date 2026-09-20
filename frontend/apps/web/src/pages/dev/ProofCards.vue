<script setup lang="ts">
import { UiDetailCard, UiDetailListItem, UiValueCard } from '@homebook/ui';
</script>

<template>
  <!-- Figures, labels and package names below are fixtures, not copy -->
  <section class="hb-proof-cards">
    <div class="hb-proof-cards__row">
      <UiValueCard
        title="Balance"
        value-display="1,240.00 €"
        color="var(--hb-color-cerulean)"
        icon="ChartCircle"
        footer-highlighted-text="+12 %"
        footer-notice="since March"
      />

      <UiValueCard
        title="Spent this month"
        value-display="482.15 €"
        color="var(--hb-color-crimson)"
        icon="MoneyBagEuro"
        footer-highlighted-text="-4 %"
      />

      <UiValueCard title="Savings goals" value-display="3" color="var(--hb-color-emerald)" icon="Gear2" />
    </div>

    <div class="hb-proof-cards__row">
      <UiDetailCard color="var(--hb-color-lavender)" icon="Home">
        <template #header>
          <div>A detail card with a header and a footer</div>
        </template>
        <template #footer>
          <UiDetailListItem icon="Tag">
            <template #title>Instance</template>
            <template #caption>homebook.local</template>
          </UiDetailListItem>
          <UiDetailListItem>
            <template #title>No icon on this row</template>
            <template #caption>The row starts at the title</template>
          </UiDetailListItem>
        </template>
      </UiDetailCard>

      <UiDetailCard color="var(--hb-color-amber)" icon="Gear2">
        <template #header>
          <div>A detail card without a footer</div>
        </template>
      </UiDetailCard>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hb-proof-cards__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cell-gap);
  margin-bottom: var(--cell-gap);
}

.hb-proof-cards__row > * {
  width: calc(var(--cell-size) * 4);
}
</style>
