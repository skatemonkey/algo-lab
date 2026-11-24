<script setup lang="ts">
import { computed } from 'vue'
import ArrayPointer from './ArrayPointer.vue'

export interface ArrayMarker {
  index: number
  label: string
  valueSeparator?: string
  tone?: 'accent' | 'success' | 'error'
  pointerTone?: 'neutral' | 'accent' | 'success'
  pointer?: boolean
}
const props = withDefaults(
  defineProps<{
    values: readonly number[]
    label: string
    markers?: readonly ArrayMarker[]
    range?: { left: number; right: number }
    interactive?: boolean
    disabledIndex?: number
    indicesOnly?: boolean
    pointerLabels?: boolean
    cellLabel?: (value: number, index: number) => string
    cellOffsets?: readonly number[]
  }>(),
  {
    markers: () => [],
    interactive: false,
    indicesOnly: false,
    pointerLabels: false,
  },
)
const emit = defineEmits<{ select: [index: number] }>()
const cells = computed(() =>
  props.values.map((value, index) => {
    const markers = props.markers.filter((marker) => marker.index === index)
    return {
      value,
      index,
      markers: markers.filter((marker) => !props.pointerLabels && !marker.pointer),
      pointers: markers.filter((marker) => props.pointerLabels || marker.pointer),
      marker: markers[0],
      excluded: !!props.range && (index < props.range.left || index > props.range.right),
    }
  }),
)
const markerRows = computed(() => Math.max(1, ...cells.value.map((cell) => cell.markers.length)))
const hasPointers = computed(
  () => props.pointerLabels || cells.value.some((cell) => cell.pointers.length),
)
</script>

<template>
  <ol
    class="lesson-array"
    :class="{ 'pointer-labels': hasPointers, dense: values.length > 12 }"
    :style="{ '--array-length': values.length, '--marker-rows': markerRows }"
    :aria-label="label"
  >
    <li
      v-for="cell in cells"
      :key="cell.index"
      :class="[cell.marker?.tone ?? 'accent', { marked: cell.marker, excluded: cell.excluded }]"
      :data-index="cell.index"
      :style="
        cellOffsets ? { transform: `translateY(${cellOffsets[cell.index] ?? 0}px)` } : undefined
      "
    >
      <div v-if="!cell.pointers.length" class="array-markers">
        <span
          v-for="marker in cell.markers"
          :key="marker.label"
          class="array-marker algo-mono"
          :class="marker.tone ?? 'accent'"
        >
          {{ marker.label }}
        </span>
      </div>
      <div v-else class="array-pointers">
        <ArrayPointer
          v-for="(marker, index) in cell.pointers"
          :key="marker.label"
          :name="marker.label"
          :value="cell.index"
          :value-separator="marker.valueSeparator"
          position="50%"
          placement="above"
          :lane="cell.pointers.length - 1 - index"
          :tone="marker.pointerTone ?? 'neutral'"
        />
      </div>
      <component
        :is="interactive ? 'button' : 'div'"
        :type="interactive ? 'button' : undefined"
        class="array-value algo-mono"
        :title="String(indicesOnly ? cell.index : cell.value)"
        :aria-label="
          interactive
            ? (cellLabel?.(cell.value, cell.index) ?? `Inspect index ${cell.index}: ${cell.value}`)
            : undefined
        "
        :aria-pressed="interactive ? cell.marker?.tone === 'accent' : undefined"
        :disabled="interactive && cell.index === disabledIndex"
        @click="interactive && emit('select', cell.index)"
      >
        {{ indicesOnly ? cell.index : cell.value }}
      </component>
      <span v-if="!indicesOnly" class="array-index algo-mono">{{ cell.index }}</span>
      <div v-if="cell.pointers.length && cell.markers.length" class="array-annotations">
        <span
          v-for="marker in cell.markers"
          :key="marker.label"
          class="array-marker algo-mono"
          :class="marker.tone ?? 'accent'"
        >
          {{ marker.label }}
        </span>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.lesson-array {
  display: grid;
  grid-template-columns: repeat(var(--array-length), minmax(0, 1fr));
  gap: var(--algo-space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}
.lesson-array li {
  position: relative;
  min-width: 0;
  text-align: center;
  --marker-color: var(--algo-accent);
  --marker-background: var(--algo-accent-soft);
  --marker-line: var(--algo-accent-line);
}
.lesson-array .success {
  --marker-color: var(--algo-success);
  --marker-background: var(--algo-success-soft);
  --marker-line: var(--algo-success-line);
}
.lesson-array .error {
  --marker-color: var(--algo-error);
  --marker-background: color-mix(in srgb, var(--algo-error) 6%, var(--algo-paper));
  --marker-line: color-mix(in srgb, var(--algo-error) 40%, var(--algo-paper));
}
.array-markers {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: calc(var(--marker-rows) * 36px);
}
.array-pointers {
  position: relative;
  height: 0;
}
.array-annotations {
  position: absolute;
  inset-inline: 0;
  top: 100%;
}
.pointer-labels {
  padding-top: var(--algo-pointer-top-space);
}
.pointer-labels .array-markers {
  position: relative;
  height: 0;
}
.pointer-labels.dense :deep(.pointer-label) {
  gap: 2px;
  font-size: var(--algo-text-xs);
  padding-inline: 5px;
}
.array-marker.accent {
  --marker-color: var(--algo-accent);
}
.array-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  color: var(--marker-color);
  font-size: var(--algo-text-sm);
  white-space: nowrap;
}
.array-value {
  display: block;
  width: 100%;
  padding: var(--algo-space-4) var(--algo-space-2);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  color: var(--algo-ink);
  font-size: var(--algo-text-value);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    color var(--algo-motion),
    background var(--algo-motion),
    border-color var(--algo-motion);
}
button.array-value {
  cursor: pointer;
}
button.array-value:hover:not(:disabled) {
  border-color: var(--algo-accent-line);
}
button.array-value:disabled {
  color: var(--algo-muted);
  cursor: default;
  border-style: dashed;
}
.excluded:not(.marked) .array-value {
  opacity: 0.35;
}
.marked .array-value {
  color: var(--marker-color);
  border-color: var(--marker-line);
  background: var(--marker-background);
}
.array-index {
  display: block;
  margin-top: var(--algo-space-2);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
</style>
