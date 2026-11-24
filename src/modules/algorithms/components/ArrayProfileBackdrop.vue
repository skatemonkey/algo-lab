<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    values: readonly number[]
    label?: string
    left?: number
    right?: number
    highlighted?: readonly number[]
  }>(),
  { label: 'Value profile behind the array', left: 0, highlighted: () => [] },
)
const canvas = ref<SVGSVGElement | null>(null)
const width = ref(0)
const gap = ref(0)
let observer: ResizeObserver | undefined
function measure() {
  if (!canvas.value) return
  width.value = canvas.value.getBoundingClientRect().width
  gap.value = parseFloat(getComputedStyle(canvas.value).getPropertyValue('--algo-array-gap')) || 0
}
onMounted(() => {
  observer = new ResizeObserver(measure)
  if (canvas.value) observer.observe(canvas.value)
  measure()
})
onUnmounted(() => observer?.disconnect())
watch(() => props.values, measure, { flush: 'post' })
const points = computed(() => {
  const low = Math.min(...props.values)
  const span = Math.max(...props.values) - low || 1
  const cellWidth = (width.value - (props.values.length - 1) * gap.value) / props.values.length
  return props.values.map((value, index) => ({
    x: index * (cellWidth + gap.value) + cellWidth / 2,
    y: 86 - ((value - low) / span) * 74,
  }))
})
const outside = (index: number) =>
  index < props.left || index > (props.right ?? props.values.length - 1)
</script>

<template>
  <svg
    ref="canvas"
    class="array-profile-backdrop"
    :viewBox="`0 0 ${width || 1} 96`"
    role="img"
    :aria-label="label"
  >
    <g v-if="width">
      <line
        v-for="(point, index) in points.slice(0, -1)"
        :key="`line-${index}`"
        :x1="point.x"
        :y1="point.y"
        :x2="points[index + 1]!.x"
        :y2="points[index + 1]!.y"
        :class="{
          excluded: outside(index) || outside(index + 1),
          highlighted: highlighted.includes(index) && highlighted.includes(index + 1),
        }"
      />
      <circle
        v-for="(point, index) in points"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        r="2.5"
        :data-index="index"
        :class="{ excluded: outside(index), highlighted: highlighted.includes(index) }"
      />
    </g>
  </svg>
</template>

<style scoped>
.array-profile-backdrop {
  position: absolute;
  top: -42px;
  left: 0;
  width: 100%;
  height: 96px;
  pointer-events: none;
}
line {
  stroke: var(--algo-muted);
  stroke-width: 1;
  opacity: 0.3;
  transition: opacity var(--algo-motion);
}
circle {
  fill: var(--algo-muted);
  opacity: 0.3;
  transition: opacity var(--algo-motion);
}
line.highlighted {
  stroke: var(--algo-accent);
  stroke-width: 1.5;
  opacity: 0.55;
}
circle.highlighted {
  fill: var(--algo-accent);
  opacity: 0.55;
}
.excluded {
  opacity: 0.18;
}
@media (prefers-reduced-motion: reduce) {
  line,
  circle {
    transition: none;
  }
}
</style>
