<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId } from 'vue'
import DiagramArrowhead from './DiagramArrowhead.vue'

defineProps<{
  left: string
  right: string
  leftValue: number
  rightValue: number
  running: boolean
  run: number
}>()
defineEmits<{ finish: [] }>()

const arrowheadId = useId()
const route = ref<SVGSVGElement | null>(null)
const width = ref(0)
const paths = computed(() => {
  const w = width.value
  const r = Math.min(4, w / 2)
  return {
    upper: `M ${w} 16 V ${r} Q ${w} 0 ${w - r} 0 H ${r} Q 0 0 0 ${r} V 12`,
    lower: `M 0 0 V ${16 - r} Q 0 16 ${r} 16 H ${w - r} Q ${w} 16 ${w} ${16 - r} V 4`,
  }
})
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) width.value = entry.contentRect.width
  })
  if (route.value) observer.observe(route.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div
    class="array-swap-motion"
    :style="{ '--swap-left': left, '--swap-right': right }"
    aria-hidden="true"
  >
    <svg ref="route" class="swap-route upper" focusable="false">
      <defs><DiagramArrowhead :id="arrowheadId" /></defs>
      <path v-if="width" :d="paths.upper" :marker-end="`url(#${arrowheadId})`" />
    </svg>
    <svg class="swap-route lower" focusable="false">
      <path v-if="width" :d="paths.lower" :marker-end="`url(#${arrowheadId})`" />
    </svg>
    <template v-if="running">
      <span
        :key="`nonzero-${run}`"
        class="swap-packet nonzero algo-mono"
        @animationend.self="$emit('finish')"
      >
        <span>{{ rightValue }}</span>
      </span>
      <span :key="`zero-${run}`" class="swap-packet zero algo-mono">
        <span>{{ leftValue }}</span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.array-swap-motion {
  --swap-inset: min(
    24px,
    (100% - (var(--sequence-length) - 1) * var(--sequence-gap)) / var(--sequence-length) / 4
  );
  --swap-left-edge: calc(var(--swap-left) + var(--swap-inset));
  --swap-right-edge: calc(var(--swap-right) - var(--swap-inset));
  --swap-duration: 1150ms;
  position: absolute;
  z-index: 3;
  inset: 0;
  pointer-events: none;
}
.swap-route {
  position: absolute;
  left: var(--swap-left-edge);
  width: calc(var(--swap-right-edge) - var(--swap-left-edge));
  height: 16px;
  overflow: visible;
  color: var(--algo-accent);
}
.swap-route.upper {
  top: -16px;
}
.swap-route.lower {
  top: var(--sequence-cell-height);
}
.swap-route path {
  fill: none;
  stroke: currentColor;
  stroke-width: var(--algo-arrow-stroke);
  stroke-linecap: round;
  stroke-linejoin: round;
}
.swap-packet {
  position: absolute;
  display: grid;
  place-items: center;
  min-width: 28px;
  max-width: calc(100% / var(--sequence-length));
  height: 24px;
  padding-inline: var(--algo-space-1);
  border: var(--algo-arrow-stroke) solid var(--algo-accent);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-accent-soft);
  color: var(--algo-ink);
  font-size: var(--algo-text-body);
  font-weight: 600;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  animation: swap-value var(--swap-duration) linear both;
}
.swap-packet > span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nonzero {
  --swap-from: var(--swap-right);
  --swap-to: var(--swap-left);
  --swap-start: var(--swap-right-edge);
  --swap-end: var(--swap-left-edge);
  --swap-lane: -16px;
}
.zero {
  --swap-from: var(--swap-left);
  --swap-to: var(--swap-right);
  --swap-start: var(--swap-left-edge);
  --swap-end: var(--swap-right-edge);
  --swap-lane: calc(var(--sequence-cell-height) + 16px);
  background: var(--algo-paper);
}
@keyframes swap-value {
  0% {
    left: var(--swap-from);
    top: calc(var(--sequence-cell-height) / 2);
  }
  18% {
    left: var(--swap-start);
    top: var(--swap-lane);
  }
  76% {
    left: var(--swap-end);
    top: var(--swap-lane);
  }
  92%,
  100% {
    left: var(--swap-to);
    top: calc(var(--sequence-cell-height) / 2);
  }
}
@media (prefers-reduced-motion: reduce) {
  .swap-packet {
    /* Preserve this short, user-controlled demonstration, as with copying. */
    animation-duration: var(--swap-duration) !important;
  }
}
</style>
