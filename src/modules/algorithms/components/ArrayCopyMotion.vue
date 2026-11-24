<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId } from 'vue'
import DiagramArrowhead from './DiagramArrowhead.vue'

defineProps<{
  from: string
  to: string
  value: number
  running: boolean
  run: number
}>()
defineEmits<{ finish: [] }>()

const arrowheadId = useId()
const route = ref<SVGSVGElement | null>(null)
const routeWidth = ref(0)
const routePath = computed(() => {
  const width = routeWidth.value
  const radius = Math.min(4, width / 2)
  // The source dot and arrow tip both meet the cell's upper edge.
  return `M ${width} 12 V ${radius} Q ${width} 0 ${width - radius} 0 H ${radius} Q 0 0 0 ${radius} V 8`
})
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) routeWidth.value = entry.contentRect.width
  })
  if (route.value) observer.observe(route.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div
    class="array-copy-motion"
    :style="{ '--copy-from': from, '--copy-to': to }"
    aria-hidden="true"
  >
    <svg ref="route" class="copy-route" focusable="false">
      <defs>
        <DiagramArrowhead :id="arrowheadId" />
      </defs>
      <path v-if="routeWidth" :d="routePath" :marker-end="`url(#${arrowheadId})`" />
      <circle v-if="routeWidth" :cx="routeWidth" cy="12" r="2" />
    </svg>
    <span
      v-if="running"
      :key="run"
      class="copy-packet algo-mono"
      @animationend.self="$emit('finish')"
    >
      <span class="copy-value">{{ value }}</span>
    </span>
  </div>
</template>

<style scoped>
.array-copy-motion {
  --copy-lane: -8px;
  --copy-inset: min(
    24px,
    (100% - (var(--sequence-length) - 1) * var(--sequence-gap)) / var(--sequence-length) / 4
  );
  --copy-start: calc(var(--copy-from) - var(--copy-inset));
  --copy-end: calc(var(--copy-to) + var(--copy-inset));
  --copy-duration: 1150ms;
  position: absolute;
  z-index: 3;
  inset: 0;
  pointer-events: none;
}
.copy-route {
  position: absolute;
  left: var(--copy-end);
  top: calc(var(--copy-lane) - var(--algo-space-1));
  width: calc(var(--copy-start) - var(--copy-end));
  height: 12px;
  overflow: visible;
  color: var(--algo-accent);
}
.copy-route > path {
  fill: none;
  stroke: currentColor;
  stroke-width: var(--algo-arrow-stroke);
  stroke-linecap: round;
  stroke-linejoin: round;
}
.copy-route circle {
  fill: currentColor;
}
.copy-packet {
  position: absolute;
  top: calc(var(--sequence-cell-height) / 2);
  left: var(--copy-from);
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
  box-shadow: 0 3px 8px color-mix(in srgb, var(--algo-accent) 18%, transparent);
  font-size: var(--algo-text-body);
  font-weight: 600;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  animation: copy-value var(--copy-duration) linear both;
}
.copy-value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
@keyframes copy-value {
  0% {
    left: var(--copy-from);
    top: calc(var(--sequence-cell-height) / 2);
    opacity: 1;
  }
  18% {
    left: var(--copy-start);
    top: var(--copy-lane);
  }
  76% {
    left: var(--copy-end);
    top: var(--copy-lane);
  }
  92%,
  100% {
    left: var(--copy-to);
    top: calc(var(--sequence-cell-height) / 2);
  }
}
@media (prefers-reduced-motion: reduce) {
  .copy-packet {
    /* This user-controlled teaching animation is essential to showing the copy.
       Override the global reset that otherwise finishes it in 0.01ms. */
    animation-duration: var(--copy-duration) !important;
  }
}
</style>
