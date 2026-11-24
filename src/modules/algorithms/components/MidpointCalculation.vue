<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ left: number; right: number }>()
const mid = computed(() => Math.floor((props.left + props.right) / 2))
</script>

<template>
  <code
    class="midpoint-calculation"
    data-testid="midpoint-calculation"
    aria-live="polite"
    aria-atomic="true"
  >
    <span>mid</span>
    <span>= floor((left + right) / 2)</span>
    <span></span>
    <span>= floor(({{ left }} + {{ right }}) / 2)</span>
    <span></span>
    <span class="midpoint-result">= {{ mid }}</span>
  </code>
</template>

<style scoped>
.midpoint-calculation {
  display: grid;
  grid-template-columns: 3ch 1fr;
  grid-template-rows: repeat(3, 1.6em);
  column-gap: 1ch;
  row-gap: var(--algo-space-2);
  box-sizing: border-box;
  width: 100%;
  padding-left: var(--algo-space-6);
  border-left: 1px solid var(--algo-line);
  color: var(--algo-secondary);
  font: var(--algo-text-value)/1.6 var(--algo-mono);
  white-space: nowrap;
}
.midpoint-calculation > span:nth-child(-n + 2) {
  color: var(--algo-ink);
}
.midpoint-result {
  color: var(--algo-accent);
  font-size: var(--algo-text-title);
  font-weight: 500;
  line-height: 1.3;
}
</style>
