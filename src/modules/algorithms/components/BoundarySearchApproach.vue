<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@lucide/vue'
import ArrayPointer from './ArrayPointer.vue'
import BoundaryApproachLayout from './BoundaryApproachLayout.vue'
import { usePointerLabels } from '../composables/usePointerLabels'
import type { BoundarySearchApproach } from '../domain/searchPresentation'
import type { LessonFact } from '../domain/lesson'

const props = defineProps<{
  values: readonly (boolean | number)[]
  approach: BoundarySearchApproach
  label: string
  boundary: number
  answer: number
  canSave: (index: number) => boolean
  compareTo?: (index: number) => number
  comparisonLabel?: string
  comparisonFor?: (index: number) => string
  facts?: readonly LessonFact[]
  presets: readonly string[]
  selectedPreset: string
  active: boolean
  error: string
  dirty: boolean
  applyInput: () => boolean
}>()
const emit = defineEmits<{ edit: []; preset: [index: number]; restore: [] }>()
const selected = ref<number | null>(null)
const board = ref<HTMLElement | null>(null)
const answer = computed(() => props.answer)
const comparisonIndex = computed(() =>
  selected.value === null ? null : (props.compareTo?.(selected.value) ?? null),
)
const outcome = computed(() => (selected.value === null ? null : selected.value >= props.boundary))
const saved = computed(() => selected.value !== null && props.canSave(selected.value))
const range = computed(() => {
  if (selected.value === null) return null
  return outcome.value
    ? { left: 0, right: selected.value - 1 }
    : { left: selected.value + 1, right: props.values.length - 1 }
})
const searchFeedback = computed(() => {
  if (!range.value || selected.value === null) return null
  const { left, right } = range.value
  const empty = left > right
  return {
    direction: outcome.value ? 'Search left' : 'Search right',
    empty,
    position: position(empty ? selected.value : (left + right) / 2),
  }
})
const pointers = computed(() => [
  ...(answer.value >= 0
    ? [
        {
          name: props.approach.answerLabel,
          index: answer.value,
          placement: 'above' as const,
          lane: 0,
          tone: 'success' as const,
        },
      ]
    : []),
  ...(selected.value !== null
    ? [
        {
          name: 'mid',
          index: selected.value,
          placement: 'above' as const,
          lane: selected.value === answer.value ? 1 : 0,
          tone: 'accent' as const,
        },
      ]
    : []),
])
const comparisonPointers = computed(() => [
  ...pointers.value,
  ...(comparisonIndex.value !== null
    ? [
        {
          name: props.comparisonLabel ?? 'compare',
          index: comparisonIndex.value,
          placement: 'above' as const,
          lane:
            comparisonIndex.value === selected.value && selected.value === answer.value
              ? 2
              : comparisonIndex.value === selected.value || comparisonIndex.value === answer.value
                ? 1
                : 0,
          tone: 'neutral' as const,
        },
      ]
    : []),
])
const { offsets: labelOffsets } = usePointerLabels(board, comparisonPointers, '.approach-cell')
const explanation = computed(() => {
  if (!props.values.length) return 'Empty array. Return −1.'
  if (selected.value === null) return ''
  const save = saved.value ? `Save index ${selected.value}. ` : ''
  const direction = outcome.value ? 'left' : 'right'
  const empty = searchFeedback.value?.empty ? ' The range is empty.' : ''
  return `${save}Search ${direction}.${empty}`
})
watch(
  () => props.values,
  () => {
    selected.value = null
  },
)
function edit() {
  selected.value = null
  emit('edit')
}
function canInspect(index: number) {
  const comparison = props.compareTo?.(index)
  return comparison === undefined || (comparison >= 0 && comparison < props.values.length)
}
function inspect(index: number) {
  if (!canInspect(index)) return
  selected.value = selected.value === index ? null : index
}
function discarded(index: number) {
  return (
    range.value !== null &&
    index !== selected.value &&
    (index < range.value.left || index > range.value.right)
  )
}
function position(index: number) {
  const fraction = (index + 0.5) / props.values.length
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--algo-array-gap))`
}
</script>

<template>
  <BoundaryApproachLayout
    :approach="approach"
    :label="label"
    :facts="facts"
    :presets="presets"
    :selected-preset="selectedPreset"
    :active="active"
    :error="error"
    :dirty="dirty"
    :apply-input="applyInput"
    :outcome="outcome"
    @edit="edit"
    @preset="emit('preset', $event)"
    @restore="emit('restore')"
  >
    <template #inputs="{ errorId }">
      <slot name="inputs" :error-id="errorId" />
    </template>
    <template #default="{ editing }">
      <figure
        class="approach-visual"
        :style="{
          '--array-length': Math.max(values.length, 1),
          '--extra-pointer-space':
            compareTo?.(answer) === answer ? 'var(--algo-pointer-lane)' : '0px',
        }"
      >
        <template v-if="values.length">
          <div
            ref="board"
            class="approach-array-board"
            :class="{ 'has-backdrop': $slots.backdrop }"
          >
            <slot name="backdrop" :range="range" />
            <ol class="approach-array" aria-label="Try a midpoint">
              <li
                v-for="(value, index) in values"
                :key="index"
                :class="{
                  'in-right-region': index >= boundary && canInspect(index),
                  'reference-only': !canInspect(index),
                  'first-match': index === answer,
                  inspecting: index === selected,
                  discarded: discarded(index),
                }"
              >
                <button
                  type="button"
                  class="approach-cell algo-mono"
                  :aria-label="
                    canInspect(index)
                      ? `Try index ${index} as mid: ${value}`
                      : `Index ${index}: ${value}. No neighbor to compare.`
                  "
                  :aria-pressed="selected === index"
                  :disabled="editing || !canInspect(index)"
                  :title="canInspect(index) ? String(value) : 'No neighbor to compare'"
                  @click="inspect(index)"
                >
                  {{ value }}
                </button>
                <span class="approach-index algo-mono" aria-hidden="true">{{ index }}</span>
              </li>
            </ol>
            <ArrayPointer
              v-for="pointer in comparisonPointers"
              :key="pointer.name"
              :name="pointer.name"
              :value="pointer.index"
              :value-separator="pointer.name === comparisonLabel ? '→' : undefined"
              :position="position(pointer.index)"
              :placement="pointer.placement"
              :lane="pointer.lane"
              :tone="pointer.tone"
              :label-offset="labelOffsets[pointer.name] ?? 0"
            />
          </div>
          <div
            class="approach-range"
            :aria-label="
              range
                ? range.left <= range.right
                  ? `Search indices ${range.left} through ${range.right}`
                  : 'Search range is empty'
                : undefined
            "
            :data-range-left="range?.left"
            :data-range-right="range?.right"
          >
            <div
              v-if="range && range.left <= range.right"
              class="search-range"
              :class="outcome ? 'search-left' : 'search-right'"
              :style="{ gridColumn: `${range.left + 1} / ${range.right + 2}` }"
            >
              <component :is="outcome ? ArrowLeft : ArrowRight" :size="16" aria-hidden="true" />
            </div>
            <span
              v-if="saved && selected !== null"
              class="saved-marker"
              :style="{ gridColumn: selected + 1 }"
            >
              Saved
              <code class="saved-value" aria-label="Saved index">{{ selected }}</code>
            </span>
            <p
              v-if="searchFeedback"
              class="range-caption"
              :class="{ 'is-empty': searchFeedback.empty }"
              :style="{ '--range-center': searchFeedback.position }"
            >
              {{ searchFeedback.direction }}
              <span v-if="searchFeedback.empty" class="empty-range">· empty</span>
            </p>
          </div>
          <p
            v-if="comparisonFor && selected !== null"
            class="approach-comparison algo-mono"
            aria-live="polite"
          >
            {{ comparisonFor(selected) }}
          </p>
        </template>
        <div v-else class="empty-approach algo-mono" aria-label="Empty array">[]</div>
        <p class="algo-sr-only" role="status" aria-atomic="true">{{ explanation }}</p>
      </figure>
    </template>
  </BoundaryApproachLayout>
</template>

<style scoped>
.approach-visual {
  margin: 0;
  padding-top: calc(
    var(--algo-pointer-top-space) + var(--algo-space-2) + var(--extra-pointer-space)
  );
}
.approach-array-board {
  position: relative;
}
.approach-array,
.approach-range {
  display: grid;
  grid-template-columns: repeat(var(--array-length), minmax(0, 1fr));
  gap: var(--algo-array-gap);
}
.approach-array {
  margin: 0;
  padding: 0;
  list-style: none;
}
.approach-array li {
  min-width: 0;
  text-align: center;
}
.approach-cell {
  display: block;
  width: 100%;
  height: calc(var(--algo-space-12) + var(--algo-space-3));
  padding: var(--algo-space-2) 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  --cell-fill: var(--algo-soft);
  background: var(--cell-fill);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  cursor: pointer;
  transition:
    background var(--algo-motion),
    border-color var(--algo-motion),
    color var(--algo-motion);
}
.has-backdrop .approach-cell {
  position: relative;
  background: color-mix(in srgb, var(--cell-fill) 80%, transparent);
}
.in-right-region .approach-cell {
  --cell-fill: var(--algo-success-soft);
  color: var(--algo-success);
}
.reference-only .approach-cell {
  --cell-fill: transparent;
  border-style: dashed;
  color: var(--algo-muted);
}
.approach-comparison {
  margin: var(--algo-space-2) 0 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  text-align: center;
}
.first-match .approach-cell {
  border-color: var(--algo-success-line);
}
.discarded .approach-cell {
  color: var(--algo-muted);
  --cell-fill: transparent;
  border-style: dashed;
}
.approach-cell:hover:not(:disabled) {
  border-color: var(--algo-accent-line);
}
.approach-cell:disabled {
  cursor: default;
}
.inspecting .approach-cell {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
  --cell-fill: var(--algo-accent-soft);
}
.approach-index {
  display: block;
  margin-top: var(--algo-space-2);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.approach-range {
  position: relative;
  height: calc(var(--algo-space-12) + var(--algo-space-4));
  margin-top: var(--algo-space-3);
  align-items: start;
}
.search-range {
  position: relative;
  top: var(--algo-pointer-edge);
  grid-row: 1;
  height: 3px;
  border-radius: 3px;
  color: var(--algo-accent);
  background: var(--algo-accent-line);
}
.search-range svg {
  position: absolute;
  top: -6px;
  background: var(--algo-canvas);
}
.search-left svg {
  left: -1px;
}
.search-right svg {
  right: -1px;
}
.range-caption {
  --range-caption-width: 8rem;
  position: absolute;
  top: var(--algo-space-8);
  left: clamp(
    0px,
    calc(var(--range-center) - var(--range-caption-width) / 2),
    calc(100% - var(--range-caption-width))
  );
  width: var(--range-caption-width);
  margin: 0;
  color: var(--algo-accent);
  font-size: var(--algo-text-sm);
  text-align: center;
  white-space: nowrap;
}
.range-caption.is-empty {
  --range-caption-width: 10rem;
}
.empty-range {
  color: var(--algo-muted);
}
.saved-marker {
  grid-row: 1;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-1);
  padding: 2px var(--algo-space-1);
  border: 1px solid var(--algo-result-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-result-soft);
  color: var(--algo-result);
  font-size: var(--algo-text-xs);
  white-space: nowrap;
}
.saved-value {
  font-family: var(--algo-mono);
}
.empty-approach {
  display: grid;
  place-items: center;
  min-height: calc(var(--algo-space-12) * 2);
  color: var(--algo-muted);
  font-size: var(--algo-text-title);
}
@media (prefers-reduced-motion: reduce) {
  .approach-cell,
  .boundary-approach :deep(.array-pointer) {
    transition: none;
  }
}
</style>
