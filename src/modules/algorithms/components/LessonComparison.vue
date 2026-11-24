<script setup lang="ts">
import { TrendingDown, TrendingUp } from '@lucide/vue'

withDefaults(
  defineProps<{
    formula: string
    comparison: string
    result: string
    tone?: 'accent' | 'success' | 'error'
    direction?: 'rising' | 'falling'
  }>(),
  { tone: 'accent' },
)
</script>

<template>
  <div class="lesson-comparison" :class="tone" aria-live="polite" aria-atomic="true">
    <code class="comparison-formula">{{ formula }}</code>
    <code>{{ comparison }}</code>
    <span class="comparison-result">
      <TrendingUp v-if="direction === 'rising'" :size="18" aria-hidden="true" />
      <TrendingDown v-else-if="direction === 'falling'" :size="18" aria-hidden="true" />
      {{ result }}
    </span>
  </div>
</template>

<style scoped>
.lesson-comparison {
  display: grid;
  grid-template-rows: repeat(3, 1.6em);
  row-gap: var(--algo-space-2);
  box-sizing: border-box;
  width: 100%;
  padding-left: var(--algo-space-6);
  border-left: 1px solid var(--algo-line);
  color: var(--algo-secondary);
  font: var(--algo-text-value)/1.6 var(--algo-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  --result-color: var(--algo-accent);
}
code {
  font: inherit;
}
.comparison-formula {
  color: var(--algo-ink);
}
.success {
  --result-color: var(--algo-success);
}
.error {
  --result-color: var(--algo-error);
}
.comparison-result {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  color: var(--result-color);
  font: 500 var(--algo-text-value)/1.6 var(--algo-font);
}
</style>
