<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@lucide/vue'
import ArrayPointer from './ArrayPointer.vue'
import BoundaryApproachLayout from './BoundaryApproachLayout.vue'
import { usePointerLabels } from '../composables/usePointerLabels'
import type { SquareRootApproach } from '../domain/squareRoot'
import { squareRootApproaches } from '../lessons/squareRoot'
import { candidateRangeEntries } from '../domain/candidateRange'

const props = defineProps<{
  n: number
  variant: SquareRootApproach
  boundary: number
  result: number
  presets: readonly string[]
  selectedPreset: string
  active: boolean
  error: string
  dirty: boolean
  applyInput: () => boolean
}>()
const emit = defineEmits<{ edit: []; preset: [index: number]; restore: [] }>()
const definition = computed(() => squareRootApproaches[props.variant])
const selected = ref<number | null>(null)
const board = ref<HTMLElement | null>(null)
const square = computed(() => (selected.value === null ? null : BigInt(selected.value) ** 2n))
const outcome = computed(() => (square.value === null ? null : matches(selected.value!)))
const decision = computed(() => definition.value.cases.find((item) => item.value === outcome.value))
const entries = computed(() =>
  candidateRangeEntries(props.n, [
    1,
    props.boundary - 2,
    props.boundary - 1,
    props.boundary,
    props.boundary + 1,
    props.boundary + 2,
    props.n - 1,
  ]),
)
const selectedIndex = computed(() =>
  entries.value.findIndex((entry) => entry.value === selected.value),
)
const boundaryIndex = computed(() =>
  entries.value.findIndex((entry) => entry.value === props.boundary),
)
const pointers = computed(() => [
  {
    name: definition.value.answerLabel,
    index: boundaryIndex.value,
    placement: 'above' as const,
    lane: 0,
  },
  ...(selected.value === null
    ? []
    : [
        {
          name: 'mid',
          index: selectedIndex.value,
          placement: 'above' as const,
          lane: selected.value === props.boundary ? 1 : 0,
        },
      ]),
])
const { offsets: labelOffsets } = usePointerLabels(board, pointers, '.candidate-cells > li')
const range = computed(() => {
  if (selected.value === null || !decision.value) return null
  return decision.value.direction === 'right'
    ? { left: selected.value + 1, right: props.n }
    : { left: 0, right: selected.value - 1 }
})
const visibleRange = computed(() => {
  if (!range.value || range.value.left > range.value.right) return null
  const start = decision.value?.direction === 'right' ? selectedIndex.value + 1 : 0
  const end = decision.value?.direction === 'left' ? selectedIndex.value : entries.value.length
  return { gridColumn: `${start + 1} / ${end + 1}` }
})
const adjusted = computed(() => props.variant === 'upper' && props.boundary !== props.result)
watch(
  () => [props.n, props.variant],
  () => {
    selected.value = null
  },
)
function matches(value: number) {
  const squared = BigInt(value) ** 2n
  return props.variant === 'lower' ? squared <= BigInt(props.n) : squared >= BigInt(props.n)
}
function edit() {
  selected.value = null
  emit('edit')
}
function discarded(value: number) {
  return (
    range.value !== null &&
    value !== selected.value &&
    (value < range.value.left || value > range.value.right)
  )
}
function position(index: number) {
  const fraction = (index + 0.5) / entries.value.length
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--algo-array-gap))`
}
</script>

<template>
  <BoundaryApproachLayout
    class="square-root-approach"
    :approach="definition"
    label="Integer square root"
    :outcome="outcome"
    :facts="[{ id: 'approach-root-input', label: 'n', value: n }]"
    :presets="presets"
    :selected-preset="selectedPreset"
    :active="active"
    :error="error"
    :dirty="dirty"
    :apply-input="applyInput"
    @edit="edit"
    @preset="emit('preset', $event)"
    @restore="emit('restore')"
  >
    <template #inputs="{ errorId }">
      <slot name="inputs" :error-id="errorId" />
    </template>
    <template #default="{ editing }">
      <figure class="candidate-visual" :style="{ '--candidate-count': entries.length }">
        <figcaption>
          Candidate numbers
          <span class="algo-mono">0 … {{ n }}</span>
        </figcaption>
        <div ref="board" class="candidate-board">
          <ol class="candidate-cells" aria-label="Try a candidate">
            <li v-for="entry in entries" :key="entry.key">
              <span v-if="entry.value === null" class="candidate-gap" aria-label="More candidates">
                …
              </span>
              <button
                v-else
                type="button"
                class="candidate-cell algo-mono"
                :class="{
                  matching: matches(entry.value),
                  boundary: entry.value === boundary,
                  inspecting: entry.value === selected,
                  discarded: discarded(entry.value),
                }"
                :aria-label="`Try candidate ${entry.value} as mid`"
                :aria-pressed="entry.value === selected"
                :disabled="editing"
                @click="selected = selected === entry.value ? null : entry.value"
              >
                {{ entry.value }}
              </button>
            </li>
          </ol>
          <ArrayPointer
            :name="definition.answerLabel"
            :value="boundary"
            :position="position(boundaryIndex)"
            placement="above"
            tone="success"
            :label-offset="labelOffsets[definition.answerLabel] ?? 0"
          />
          <ArrayPointer
            v-if="selected !== null"
            name="mid"
            :value="selected"
            :position="position(selectedIndex)"
            placement="above"
            tone="accent"
            :lane="selected === boundary ? 1 : 0"
            :label-offset="labelOffsets.mid ?? 0"
          />
          <div class="candidate-ranges">
            <div
              v-if="visibleRange"
              class="candidate-range"
              :class="decision?.direction"
              :style="visibleRange"
            >
              <component
                :is="decision?.direction === 'right' ? ArrowRight : ArrowLeft"
                :size="16"
                aria-hidden="true"
              />
              <span>{{ decision?.action }}</span>
            </div>
            <span
              v-if="selected !== null && outcome"
              class="saved-candidate"
              :style="{ gridColumn: selectedIndex + 1 }"
            >
              Saved
              <code>{{ selected }}</code>
            </span>
          </div>
        </div>
        <div class="candidate-comparison" role="status">
          <code v-if="square !== null">
            {{ selected }}² = {{ square.toString() }}
            {{ square < BigInt(n) ? '<' : square > BigInt(n) ? '>' : '=' }} {{ n }}
          </code>
          <span v-if="range && range.left > range.right">{{ decision?.action }} · empty</span>
        </div>
        <p v-if="adjusted" class="boundary-correction">
          <span>Answer</span>
          <code>{{ boundary }} − 1 = {{ result }}</code>
        </p>
      </figure>
    </template>
  </BoundaryApproachLayout>
</template>

<style scoped>
.square-root-approach {
  --approach-columns: minmax(0, 1.2fr) minmax(24rem, 1.45fr) minmax(0, 0.85fr);
}
.candidate-visual {
  margin: 0;
  padding-top: var(--algo-space-6);
}
figcaption {
  display: flex;
  gap: var(--algo-space-3);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.candidate-board {
  position: relative;
  max-width: min(100%, calc(var(--candidate-count) * 7rem));
  margin: var(--algo-pointer-top-space) auto 0;
}
.candidate-cells,
.candidate-ranges {
  display: grid;
  grid-template-columns: repeat(var(--candidate-count), minmax(0, 1fr));
  gap: var(--algo-array-gap);
}
.candidate-cells {
  list-style: none;
  margin: 0;
  padding: 0;
}
.candidate-cell,
.candidate-gap {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 60px;
}
.candidate-cell {
  padding: var(--algo-space-2);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background var(--algo-motion),
    border-color var(--algo-motion),
    color var(--algo-motion);
}
.candidate-cell.matching {
  background: var(--algo-success-soft);
  color: var(--algo-success);
}
.candidate-cell.boundary {
  border-color: var(--algo-success-line);
}
.candidate-cell.discarded {
  background: transparent;
  color: var(--algo-muted);
  border-style: dashed;
}
.candidate-cell.inspecting {
  background: var(--algo-accent-soft);
  color: var(--algo-accent);
  border-color: var(--algo-accent);
}
.candidate-cell:hover:not(:disabled) {
  border-color: var(--algo-accent);
}
.candidate-cell:disabled {
  cursor: default;
}
.candidate-gap {
  color: var(--algo-muted);
}
.candidate-ranges {
  height: var(--algo-space-12);
  margin-top: var(--algo-space-3);
  align-items: start;
}
.candidate-range {
  position: relative;
  grid-row: 1;
  height: 3px;
  margin-top: var(--algo-space-2);
  color: var(--algo-accent);
  background: var(--algo-accent-line);
  border-radius: 3px;
}
.candidate-range svg {
  position: absolute;
  top: -6px;
  background: var(--algo-canvas);
}
.candidate-range.right svg {
  right: -1px;
}
.candidate-range.left svg {
  left: -1px;
}
.candidate-range span {
  position: absolute;
  top: var(--algo-space-4);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: var(--algo-text-sm);
}
.saved-candidate {
  grid-row: 1;
  justify-self: center;
  padding: 2px var(--algo-space-1);
  color: var(--algo-result);
  background: var(--algo-result-soft);
  border: 1px solid var(--algo-result-line);
  border-radius: var(--algo-radius-sm);
  font-size: var(--algo-text-xs);
  white-space: nowrap;
}
.saved-candidate code {
  font-family: var(--algo-mono);
}
.candidate-comparison {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--algo-space-4);
  min-height: var(--algo-space-6);
  color: var(--algo-secondary);
  font-size: var(--algo-text-sm);
}
.candidate-comparison code {
  font: var(--algo-text-body) var(--algo-mono);
  overflow-wrap: anywhere;
}
.boundary-correction {
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--algo-space-3);
  margin: var(--algo-space-4) 0 0;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.boundary-correction code {
  color: var(--algo-success);
  font-family: var(--algo-mono);
}
@media (prefers-reduced-motion: reduce) {
  .candidate-cell {
    transition: none;
  }
}
</style>
