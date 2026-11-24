<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import PointerSequence from './PointerSequence.vue'

withDefaults(
  defineProps<{
    label: string
    connected?: boolean
    compact?: boolean
    snapshots: readonly {
      label: string
      values: readonly number[]
      pointers: readonly {
        name: string
        index: number | null
        updated: boolean
        highlighted?: boolean
        step?: number
      }[]
      linked?: boolean
      prefixLength?: number
      prefixLabel?: string
      written?: readonly number[]
      highlighted?: readonly number[]
      traversed?: readonly number[]
      cellSteps?: Readonly<Record<number, number>>
      activeStep?: number
      resultIndex?: number
      complete?: boolean
    }[]
  }>(),
  { connected: true },
)
</script>

<template>
  <figure class="rule-example" :class="{ connected, compact }" :aria-label="label">
    <template v-for="(snapshot, index) in snapshots" :key="snapshot.label">
      <ArrowRight v-if="index && connected" class="example-arrow" :size="16" aria-hidden="true" />
      <div class="rule-snapshot">
        <span class="snapshot-label">{{ snapshot.label }}</span>
        <PointerSequence
          compact
          :values="snapshot.values"
          :pointers="snapshot.pointers"
          :linked="snapshot.linked"
          :prefix-length="snapshot.prefixLength"
          :prefix-label="snapshot.prefixLabel"
          :written="snapshot.written"
          :highlighted="snapshot.highlighted"
          :traversed="snapshot.traversed"
          :cell-steps="snapshot.cellSteps"
          :active-step="snapshot.activeStep"
          :result-index="snapshot.resultIndex"
          :complete="snapshot.complete"
        />
      </div>
    </template>
  </figure>
</template>

<style scoped>
.rule-example {
  --algo-pointer-top-space: var(--algo-example-pointer-space, 60px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: var(--algo-space-4);
  margin: var(--algo-space-4) 0 0;
}
.rule-example.connected {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}
.rule-example.compact {
  --algo-pointer-top-space: var(--algo-example-pointer-space, 56px);
  gap: var(--algo-space-3);
  margin-top: var(--algo-space-2);
}
.rule-snapshot {
  min-width: 0;
}
.snapshot-label {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.example-arrow {
  margin-top: calc(var(--algo-pointer-top-space) + 34px);
  color: var(--algo-muted);
}
.rule-example :deep(.pointer-visualization.compact) {
  padding: 0;
}
.rule-example :deep(.sequence-stage) {
  padding-bottom: 0;
}
.rule-example :deep(.sequence-cell) {
  height: 40px;
}
.rule-example :deep(.next-link) {
  top: 12px;
}
.rule-example :deep(.prefix-band) {
  height: 3px;
}
</style>
