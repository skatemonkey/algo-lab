<script setup lang="ts">
import { useId } from 'vue'

import DiagramArrowhead from './DiagramArrowhead.vue'
import RuleActionMarker from './RuleActionMarker.vue'

const arrowheadId = useId()

withDefaults(
  defineProps<{
    name: string
    value: number | string
    valueSeparator?: string
    position: string
    placement: 'above' | 'below'
    lane?: number
    labelOffset?: number
    edge?: 'before' | 'after' | null
    tone?: 'neutral' | 'accent' | 'success'
    updated?: boolean
    step?: number
    activeStep?: number
  }>(),
  { lane: 0, labelOffset: 0, edge: null, tone: 'neutral', updated: false },
)
</script>

<template>
  <div
    class="array-pointer"
    :class="[placement, tone, { updated }]"
    :style="{
      left: position,
      '--pointer-lane': lane,
      '--pointer-label-offset': `${labelOffset}px`,
      '--pointer-connector-start': `${Math.min(0, labelOffset)}px`,
      '--pointer-connector-width': `${Math.abs(labelOffset)}px`,
    }"
    :data-pointer="name"
    :data-index="value"
    :data-edge="edge"
    :aria-label="`${name} pointer: ${value}`"
  >
    <span class="pointer-label algo-mono">
      <span>{{ name }}</span>
      <span v-if="valueSeparator" aria-hidden="true">{{ valueSeparator }}</span>
      <strong :data-testid="`variable-${name}`">{{ value }}</strong>
      <RuleActionMarker v-if="step" :step="step" :active="step === activeStep" />
    </span>
    <span class="pointer-stem" aria-hidden="true">
      <svg class="pointer-arrow" width="8" height="100%" focusable="false">
        <defs>
          <DiagramArrowhead :id="arrowheadId" />
        </defs>
        <line x1="4" y1="0" x2="4" y2="100%" :marker-end="`url(#${arrowheadId})`" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.array-pointer {
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  /* Keep the anchor out of a stacking context so every label stays above every stem. */
  width: 0;
  color: var(--algo-secondary);
  transition: left var(--algo-pointer-motion);
}
.above {
  --pointer-target-offset: var(--algo-array-header-height, 0px);
  bottom: calc(100% + var(--algo-space-2) - var(--pointer-target-offset));
}
.below {
  top: calc(100% + var(--algo-space-2));
  flex-direction: column-reverse;
}
.accent {
  color: var(--algo-accent);
}
.success {
  color: var(--algo-success);
}
.pointer-label {
  position: relative;
  z-index: 4;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  font-size: var(--algo-text-sm);
  line-height: 1.5;
  background: var(--algo-paper);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  white-space: nowrap;
  transform: translateX(var(--pointer-label-offset));
  transition: transform var(--algo-pointer-motion);
}
.pointer-label strong {
  font-weight: 500;
}
.array-pointer.updated .pointer-label,
.array-pointer.accent .pointer-label {
  border-color: var(--algo-accent-line);
  background: var(--algo-accent-soft);
  color: var(--algo-accent);
}
.array-pointer.success .pointer-label {
  border-color: var(--algo-success-line);
  background: var(--algo-success-soft);
  color: var(--algo-success);
}
.pointer-stem {
  position: relative;
  z-index: 2;
  display: block;
  width: 8px;
  height: calc(var(--algo-pointer-stem) + var(--pointer-lane) * var(--algo-pointer-lane));
  transition: height var(--algo-pointer-motion);
}
.pointer-arrow {
  display: block;
  overflow: visible;
}
.pointer-arrow line {
  stroke: currentColor;
  stroke-width: var(--algo-arrow-stroke);
}
.below .pointer-arrow {
  transform: scaleY(-1);
}
.pointer-stem::before {
  content: '';
  position: absolute;
  left: calc(50% + var(--pointer-connector-start));
  width: var(--pointer-connector-width);
  height: var(--algo-arrow-stroke);
  background: currentColor;
  transition:
    left var(--algo-pointer-motion),
    width var(--algo-pointer-motion);
}
.above .pointer-stem::before {
  /* Hide the connector beneath the label wherever the stem already meets it. */
  top: calc(-1 * var(--algo-arrow-stroke));
}
.below .pointer-stem::before {
  bottom: calc(-1 * var(--algo-arrow-stroke));
}
</style>
