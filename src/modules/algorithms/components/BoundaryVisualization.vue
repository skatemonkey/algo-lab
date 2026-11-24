<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePointerLabels } from '../composables/usePointerLabels'
import { Check } from '@lucide/vue'
import ArrayPointer from './ArrayPointer.vue'
import SearchRegionDivider from './SearchRegionDivider.vue'
import type { SearchFrame } from '../domain/binarySearch'
import type { SearchDivision } from '../domain/searchPresentation'
const props = withDefaults(
  defineProps<{
    values: readonly (boolean | number)[]
    frame: SearchFrame<string>
    target?: number
    showAnswer?: boolean
    arrayLabel?: string
    minimal?: boolean
    division?: SearchDivision
  }>(),
  { showAnswer: true, minimal: false },
)
const done = computed(() => props.frame.instruction === 'return')
const inspecting = computed(() =>
  ['midpoint', 'condition', 'smaller', 'check'].includes(props.frame.instruction),
)
const inRange = (index: number) => index >= props.frame.left && index <= props.frame.right
const pointers = computed(() => {
  const { frame, values } = props
  return [
    {
      name: 'left',
      value: frame.left,
      placement: 'above' as const,
      tone: 'neutral' as const,
      updated: ['bounds', 'left'].includes(frame.instruction),
    },
    {
      name: 'right',
      value: frame.right,
      placement: 'above' as const,
      tone: 'neutral' as const,
      updated: ['bounds', 'right', 'right-match'].includes(frame.instruction),
    },
    {
      name: 'mid',
      value: frame.mid,
      placement: 'above' as const,
      tone: 'accent' as const,
      updated: frame.instruction === 'midpoint',
    },
    {
      name: 'answer',
      value: frame.answer,
      placement: 'below' as const,
      tone: 'success' as const,
      updated: ['save', 'return'].includes(frame.instruction),
    },
  ]
    .filter((pointer) => props.showAnswer || pointer.name !== 'answer')
    .map((pointer) => ({
      ...pointer,
      anchored:
        values.length > 0 &&
        pointer.value !== null &&
        (pointer.name !== 'answer' || pointer.value >= 0),
    }))
})
const anchoredPointers = computed(() => pointers.value.filter((pointer) => pointer.anchored))
const unassignedPointers = computed(() => pointers.value.filter((pointer) => !pointer.anchored))
const arrayTrack = ref<HTMLElement | null>(null)
const { offsets: labelOffsets, lanes: labelLanes } = usePointerLabels(
  arrayTrack,
  computed(() =>
    anchoredPointers.value.map((pointer) => ({
      name: pointer.name,
      index: pointer.value!,
      placement: pointer.placement,
    })),
  ),
)

function edge(index: number) {
  return index < 0 ? 'before' : index >= props.values.length ? 'after' : null
}
function position(index: number) {
  if (index < 0) return 'calc(0% - var(--algo-pointer-edge))'
  if (index >= props.values.length) return 'calc(100% + var(--algo-pointer-edge))'
  // Match cell centers in the CSS grid, including the gap between cells.
  const fraction = (index + 0.5) / props.values.length
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--algo-array-gap))`
}
</script>

<template>
  <div
    class="visualization"
    :class="{ minimal }"
    role="region"
    :aria-label="arrayLabel ?? 'Binary search array'"
  >
    <div v-if="!minimal" class="canvas-caption">
      <span class="algo-mono">A</span>
      <div class="canvas-facts algo-mono">
        <span v-if="target !== undefined" class="target-value" data-testid="target-value">
          target = {{ target }}
        </span>
        <span>n = {{ values.length }}</span>
      </div>
    </div>
    <div v-if="values.length" class="array-stage">
      <div
        ref="arrayTrack"
        class="array-track"
        :class="{ 'has-division': division }"
        :style="{ '--array-length': values.length }"
      >
        <SearchRegionDivider v-if="division" :division="division" :length="values.length" />
        <slot name="backdrop" />
        <ol
          class="array"
          :class="{ dense: values.length > 12 }"
          :style="{ '--array-length': values.length }"
          :aria-label="arrayLabel ?? (target === undefined ? 'Boolean array' : 'Integer array')"
        >
          <li
            v-for="(value, index) in values"
            :key="index"
            class="array-item"
            :class="{
              excluded: !inRange(index),
              midpoint: index === frame.mid && (minimal || inspecting),
              candidate: index === frame.answer,
              resolved: done && index === frame.answer,
            }"
            :aria-label="`Index ${index}: ${value}${index === frame.mid ? ', midpoint' : ''}${index === frame.answer ? ', saved answer' : ''}${!inRange(index) ? ', outside search range' : ''}`"
          >
            <div class="array-cell">
              <Check v-if="done && index === frame.answer" :size="12" class="found-check" />
              <span class="cell-value" :title="String(value)">{{ value }}</span>
            </div>
            <span class="array-index algo-mono" aria-hidden="true">{{ index }}</span>
          </li>
        </ol>
        <div
          class="range-track"
          :style="{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }"
          aria-hidden="true"
        >
          <div
            v-if="frame.left <= frame.right"
            class="range-band"
            :style="{ gridColumn: `${frame.left + 1} / ${frame.right + 2}` }"
          />
        </div>
        <ArrayPointer
          v-for="pointer in anchoredPointers"
          :key="pointer.name"
          :name="pointer.name"
          :value="pointer.value!"
          :position="position(pointer.value!)"
          :placement="pointer.placement"
          :lane="labelLanes[pointer.name] ?? 0"
          :label-offset="labelOffsets[pointer.name] ?? 0"
          :edge="edge(pointer.value!)"
          :tone="pointer.tone"
          :updated="pointer.updated"
        />
      </div>
    </div>
    <div v-else class="empty-array">
      <code>[]</code>
      <span>Empty array</span>
    </div>
    <div v-if="!minimal" class="canvas-footer">
      <div class="unassigned-pointers">
        <span
          v-for="pointer in unassignedPointers"
          :key="pointer.name"
          class="unassigned-pointer algo-mono"
          :data-pointer="pointer.name"
        >
          <span>{{ pointer.name }}</span>
          <strong :data-testid="`variable-${pointer.name}`">{{ pointer.value ?? '—' }}</strong>
        </span>
      </div>
      <span
        v-if="done && showAnswer"
        class="result algo-mono"
        data-testid="search-result"
        role="status"
      >
        return {{ frame.answer }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.visualization {
  --algo-pointer-top-space: 116px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 390px;
  padding: var(--algo-space-8) var(--algo-space-4);
}
.canvas-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--algo-text-base);
  color: var(--algo-muted);
}
.canvas-caption > span:first-child {
  color: var(--algo-secondary);
}
.canvas-facts {
  display: flex;
  align-items: center;
  gap: var(--algo-space-5);
}
.target-value {
  color: var(--algo-accent);
}
.cell-value {
  min-width: 0;
  max-width: 100%;
  padding-inline: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.array-stage {
  margin: auto 0;
  padding: var(--algo-pointer-top-space) 0 var(--algo-pointer-bottom-space);
}
.array-track {
  position: relative;
}
.array {
  display: grid;
  grid-template-columns: repeat(var(--array-length), minmax(0, 1fr));
  gap: var(--algo-array-gap);
  list-style: none;
  padding: 0;
  margin: 0;
}
.has-division {
  --algo-array-header-height: var(--algo-space-5);
  display: grid;
  grid-template-rows: var(--algo-array-header-height) auto auto;
}
.has-division .array {
  grid-row: 2;
}
.has-division .range-track {
  grid-row: 3;
}
.array-item {
  position: relative;
  text-align: center;
  min-width: 0;
}
.array-cell {
  position: relative;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--algo-soft);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  color: var(--algo-ink);
  font: var(--algo-text-body) var(--algo-mono);
  transition:
    background var(--algo-motion),
    color var(--algo-motion),
    border-color var(--algo-motion),
    transform var(--algo-motion);
}
.dense .array-cell {
  font-size: var(--algo-text-xs);
}
.excluded .array-cell {
  background: var(--algo-paper);
  border-color: var(--algo-line);
  color: var(--algo-muted);
  border-style: dashed;
}
.candidate .array-cell {
  background: var(--algo-success-soft);
  border-color: var(--algo-success-line);
  color: var(--algo-success);
}
.midpoint .array-cell {
  background: var(--algo-accent);
  border-color: var(--algo-accent);
  color: var(--algo-paper);
  transform: translateY(-3px);
}
.resolved .array-cell {
  background: var(--algo-success);
  border-color: var(--algo-success);
  color: var(--algo-paper);
}
.found-check {
  position: absolute;
  top: 3px;
  right: 3px;
}
.array-index {
  display: block;
  margin-top: var(--algo-space-3);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.range-track {
  display: grid;
  gap: var(--algo-array-gap);
  margin-top: var(--algo-space-3);
  height: 5px;
}
.range-band {
  height: 5px;
  background: var(--algo-accent-soft);
  border: 1px solid var(--algo-accent-line);
  border-top: 0;
  border-radius: 0 0 3px 3px;
}
.canvas-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  gap: var(--algo-space-4);
}
.unassigned-pointers {
  display: flex;
  align-items: center;
  gap: var(--algo-space-5);
}
.unassigned-pointer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--algo-text-sm);
  color: var(--algo-muted);
}
.unassigned-pointer strong {
  font-weight: 450;
  color: var(--algo-secondary);
}
.result {
  font-size: var(--algo-text-body);
  color: var(--algo-success);
}
.empty-array {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--algo-space-3);
  flex: 1;
  color: var(--algo-muted);
}
.empty-array code {
  font: var(--algo-text-title) var(--algo-mono);
  color: var(--algo-secondary);
}
.empty-array span {
  font-size: var(--algo-text-body);
}
.minimal {
  --algo-array-gap: var(--algo-space-2);
  --algo-pointer-bottom-space: 76px;
  padding: var(--algo-space-10) var(--algo-space-5) 0;
}
.minimal .array-track {
  width: 100%;
  margin-inline: auto;
}
.minimal .array-cell {
  height: 52px;
  background: color-mix(in srgb, var(--algo-paper) 24%, transparent);
  transform: none;
}
.minimal .excluded .array-cell {
  background: color-mix(in srgb, var(--algo-canvas) 24%, transparent);
  border-color: color-mix(in srgb, var(--algo-line) 65%, transparent);
}
.minimal .excluded:not(.candidate, .midpoint) .cell-value {
  opacity: 0.4;
}
.minimal .candidate .array-cell,
.minimal .resolved .array-cell {
  background: color-mix(in srgb, var(--algo-success-soft) 75%, transparent);
  border-color: var(--algo-success-line);
  color: var(--algo-success);
}
.minimal .midpoint .array-cell {
  background: color-mix(in srgb, var(--algo-accent-soft) 75%, transparent);
  border-color: var(--algo-accent-line);
  color: var(--algo-accent);
}
.minimal .cell-value {
  text-shadow:
    0 0 3px var(--algo-paper),
    0 0 3px var(--algo-paper);
}
.minimal .range-band {
  border: 0;
  background: var(--algo-accent-line);
  border-radius: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .minimal .array-cell {
    transition: none;
  }
}
</style>
