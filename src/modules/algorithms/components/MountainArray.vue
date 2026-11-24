<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LessonArray, { type ArrayMarker } from './LessonArray.vue'

const props = withDefaults(
  defineProps<{
    values: readonly number[]
    rise?: number
    label: string
    description?: string
    markers?: readonly ArrayMarker[]
    comparison?: { from: number; to: number; tone?: 'accent' | 'success' | 'error' }
    range?: { left: number; right: number }
    interactive?: boolean
    disabledIndex?: number
  }>(),
  { markers: () => [], interactive: false, description: '', rise: 140 },
)
const emit = defineEmits<{ select: [index: number] }>()
const container = ref<HTMLElement | null>(null)
const dimensions = ref({ width: 0, height: 0 })
const points = ref<{ x: number; y: number }[]>([])
let observer: ResizeObserver | undefined
let mounted = false

const peakIndex = computed(() => props.values.indexOf(Math.max(...props.values)))
const offsets = computed(() => {
  const min = Math.min(...props.values)
  const span = Math.max(...props.values) - min || 1
  return props.values.map((value) => props.rise * (1 - (value - min) / span))
})
const markers = computed<ArrayMarker[]>(() => [
  ...props.markers,
  { index: peakIndex.value, label: 'peak', tone: 'success' },
])

// Read the rendered cells so the line passes through their centers at any desktop width.
function measure() {
  if (!mounted || !container.value?.clientWidth) return
  const bounds = container.value.getBoundingClientRect()
  dimensions.value = { width: bounds.width, height: bounds.height }
  points.value = Array.from(container.value.querySelectorAll('.array-value'), (cell) => {
    const rect = cell.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 - bounds.left,
      y: rect.top + rect.height / 2 - bounds.top,
    }
  })
}
onMounted(() => {
  mounted = true
  observer = new ResizeObserver(measure)
  if (container.value) observer.observe(container.value)
  measure()
  void document.fonts.ready.then(measure)
})
onUnmounted(() => {
  mounted = false
  observer?.disconnect()
})
watch(() => [props.values, props.markers, props.comparison], measure, { flush: 'post' })

const outline = computed(() => points.value.map(({ x, y }) => `${x},${y}`).join(' '))
const skipsNeighbor = computed(() =>
  props.comparison ? Math.abs(props.comparison.from - props.comparison.to) > 1 : false,
)
const connection = computed(() => {
  if (!props.comparison) return ''
  const from = points.value[props.comparison.from]
  const to = points.value[props.comparison.to]
  if (!from || !to) return ''
  return skipsNeighbor.value
    ? `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${dimensions.value.height - 12} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`
})
</script>

<template>
  <div
    ref="container"
    class="mountain-array"
    :style="{ '--mountain-rise': `${rise}px` }"
    :data-peak-index="peakIndex"
  >
    <svg
      v-if="points.length"
      class="mountain-profile"
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
      role="img"
      :aria-label="`Mountain peak at index ${peakIndex}, value ${values[peakIndex]}. ${description}`"
    >
      <polyline :points="outline" class="mountain-outline" />
      <path
        v-if="connection"
        :d="connection"
        class="mountain-connection"
        :class="[comparison?.tone ?? 'accent', { 'skips-neighbor': skipsNeighbor }]"
        :data-from-index="comparison?.from"
        :data-to-index="comparison?.to"
        data-testid="mountain-connection"
      />
    </svg>
    <LessonArray
      class="mountain-cells"
      :values="values"
      :label="label"
      :markers="markers"
      :range="range"
      :cell-offsets="offsets"
      :interactive="interactive"
      :disabled-index="disabledIndex"
      @select="emit('select', $event)"
    />
  </div>
</template>

<style scoped>
.mountain-array {
  position: relative;
  padding-top: var(--mountain-pointer-space, calc(var(--algo-space-12) + var(--algo-space-2)));
  padding-bottom: calc(var(--mountain-rise) + var(--mountain-bottom-space, var(--algo-space-12)));
}
.mountain-profile {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
.mountain-outline {
  fill: none;
  stroke: color-mix(in srgb, var(--algo-muted) 55%, transparent);
  stroke-width: 2;
  stroke-linejoin: round;
}
.mountain-connection {
  fill: none;
  stroke: var(--algo-accent);
  stroke-width: 3;
  stroke-linecap: round;
}
.mountain-connection.success {
  stroke: var(--algo-success);
}
.mountain-connection.error {
  stroke: var(--algo-error);
}
.skips-neighbor {
  stroke-dasharray: 5 7;
}
.mountain-cells {
  position: relative;
  padding-top: 0;
}
.mountain-cells :deep(li) {
  position: relative;
}
.mountain-cells :deep(.array-markers) {
  position: absolute;
  inset-inline: 0;
  bottom: 100%;
  height: auto;
  padding-bottom: var(--algo-space-1);
}
.mountain-cells :deep(.array-marker) {
  height: var(--algo-space-6);
}
.mountain-cells :deep(.array-marker:empty) {
  display: none;
}
.mountain-cells :deep(.array-value) {
  width: min(100%, 88px);
  margin-inline: auto;
}
.mountain-cells :deep(.excluded:not(.marked) .array-value) {
  opacity: 1;
  color: var(--algo-muted);
  background: var(--algo-canvas);
}
.mountain-cells :deep(.array-index) {
  width: fit-content;
  margin-inline: auto;
  padding-inline: var(--algo-space-1);
  background: var(--algo-canvas);
}
</style>
