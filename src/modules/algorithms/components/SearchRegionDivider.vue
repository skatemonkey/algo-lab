<script setup lang="ts">
import { computed } from 'vue'
import type { SearchDivision } from '../domain/searchPresentation'

const props = defineProps<{
  division: SearchDivision
  length: number
}>()

const position = computed(() => {
  if (!props.length) return '0%'
  const fraction = props.division.index / props.length
  // Place the divider halfway through the gap between cells.
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--algo-array-gap))`
})
</script>

<template>
  <div class="region-divider algo-mono" :style="{ left: position }" aria-hidden="true">
    <span v-if="division.index < length" class="region-condition after">
      {{ division.after }}
    </span>
    <span v-if="division.index > 0" class="region-condition before">
      {{ division.before }}
    </span>
  </div>
</template>

<style scoped>
.region-divider {
  position: absolute;
  top: var(--algo-region-caption-top, 0px);
  bottom: calc(var(--algo-space-3) + 5px);
  width: 1px;
  background: color-mix(in srgb, var(--algo-muted) 40%, var(--algo-line));
  pointer-events: none;
}
.region-condition {
  position: absolute;
  top: 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-xs);
  line-height: var(--algo-space-4);
  white-space: nowrap;
}
.region-condition.after {
  left: var(--algo-space-2);
}
.region-condition.before {
  right: var(--algo-space-2);
}
</style>
