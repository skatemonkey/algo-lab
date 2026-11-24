<script setup lang="ts">
import { computed, ref } from 'vue'
import ArrayPointer from './ArrayPointer.vue'
import { usePointerLabels } from '../composables/usePointerLabels'
import { candidateRangeEntries } from '../domain/candidateRange'
import SearchDecisionCards from './SearchDecisionCards.vue'
import SearchRegionDivider from './SearchRegionDivider.vue'
import type { SearchDecisionCase, SearchDivision } from '../domain/searchPresentation'
import type { SquareRootApproach, SquareRootFrame } from '../domain/squareRoot'
const props = defineProps<{
  n: number
  approach: SquareRootApproach
  boundary: number
  frame: SquareRootFrame
  cases: readonly SearchDecisionCase[]
  editing: boolean
}>()
const outcome = computed(() => {
  switch (props.frame.instruction) {
    case 'condition':
      return props.frame.outcome
    case 'save':
      return true
    case 'left':
      return props.approach === 'lower'
    case 'right':
      return props.approach === 'upper'
    default:
      return null
  }
})
const empty = computed(() => props.frame.left > props.frame.right)
const done = computed(() => props.frame.instruction === 'return')
const finishing = computed(() =>
  ['result', 'exact', 'adjust', 'return'].includes(props.frame.instruction),
)
const candidate = computed(() => (finishing.value ? props.frame.answer : props.frame.mid))
const square = computed(() => {
  if (candidate.value === null || props.frame.instruction === 'midpoint') return null
  return finishing.value ? BigInt(candidate.value) ** 2n : props.frame.square
})
const splitCandidate = computed(() => props.boundary + (props.approach === 'lower' ? 1 : 0))
const entries = computed(() => {
  const { left, right, mid, answer, result } = props.frame
  const focus = mid ?? answer
  return candidateRangeEntries(props.n, [
    left,
    right,
    // Keep both sides of the fixed boundary visible in compressed ranges.
    splitCandidate.value - 1,
    splitCandidate.value,
    ...[mid, answer, result].filter((value): value is number => value !== null),
    ...(focus === null ? [] : [focus - 1, focus + 1]),
  ])
})
const track = ref<HTMLElement | null>(null)
function entryIndex(value: number) {
  if (value < 0) return -1
  if (value > props.n) return entries.value.length
  return entries.value.findIndex((entry) => entry.value === value)
}
const division = computed<SearchDivision>(() => ({
  index: entryIndex(splitCandidate.value),
  before: props.approach === 'lower' ? 'x² ≤ n' : 'x² < n',
  after: props.approach === 'lower' ? 'x² > n' : 'x² ≥ n',
}))
const pointers = computed(() => {
  const { frame, approach } = props
  const definitions = [
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
      updated: ['bounds', 'right'].includes(frame.instruction),
    },
    {
      name: 'mid',
      value: frame.mid,
      placement: 'above' as const,
      tone: 'accent' as const,
      updated: frame.instruction === 'midpoint',
    },
    {
      name: approach === 'upper' ? 'boundary' : 'answer',
      value: frame.answer,
      placement: 'below' as const,
      tone: 'success' as const,
      updated: ['answer', 'save', 'return'].includes(frame.instruction),
    },
    ...(approach === 'upper'
      ? [
          {
            name: 'answer',
            value: frame.result,
            placement: 'below' as const,
            tone: 'success' as const,
            updated: ['result', 'adjust', 'return'].includes(frame.instruction),
          },
        ]
      : []),
  ]
  return definitions.flatMap((pointer) =>
    pointer.value === null
      ? []
      : [
          {
            ...pointer,
            value: pointer.value,
            index: entryIndex(pointer.value),
            edge:
              pointer.value < 0
                ? ('before' as const)
                : pointer.value > props.n
                  ? ('after' as const)
                  : null,
          },
        ],
  )
})
const { offsets: labelOffsets, lanes: labelLanes } = usePointerLabels(
  track,
  pointers,
  '.root-candidates > li',
)
const rangeStyle = computed(() =>
  empty.value
    ? null
    : {
        gridColumn: `${entryIndex(props.frame.left) + 1} / ${entryIndex(props.frame.right) + 2}`,
      },
)
function inRange(value: number) {
  return value >= props.frame.left && value <= props.frame.right
}
function position(index: number) {
  if (index < 0) return 'calc(0% - var(--algo-pointer-edge))'
  if (index >= entries.value.length) return 'calc(100% + var(--algo-pointer-edge))'
  const fraction = (index + 0.5) / entries.value.length
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--algo-array-gap))`
}
const proof = computed(() => {
  if (props.frame.result === null) return ''
  const root = BigInt(props.frame.result)
  return `${root}² = ${root * root} ≤ ${props.n} < ${root + 1n}² = ${(root + 1n) ** 2n}`
})
</script>

<template>
  <div class="root-decisions" :class="{ editing }">
    <SearchDecisionCards :cases="cases" :outcome="outcome" />
  </div>
  <div
    class="root-visualization visualization"
    role="region"
    aria-label="Square root candidate range"
  >
    <div class="range-stage">
      <div ref="track" class="candidate-track" :style="{ '--candidate-count': entries.length }">
        <SearchRegionDivider :division="division" :length="entries.length" />
        <ol class="root-candidates" aria-label="Candidate numbers">
          <li
            v-for="entry in entries"
            :key="entry.key"
            class="root-candidate"
            :class="
              entry.value === null
                ? 'gap'
                : {
                    excluded: !inRange(entry.value),
                    saved: entry.value === frame.answer,
                    midpoint: entry.value === frame.mid,
                    resolved: done && entry.value === frame.result,
                  }
            "
            :data-candidate="entry.value"
          >
            <span v-if="entry.value === null" class="candidate-gap" aria-label="More candidates">
              …
            </span>
            <span v-else class="candidate-cell algo-mono">{{ entry.value }}</span>
          </li>
        </ol>
        <div class="candidate-range" :data-range-left="frame.left" :data-range-right="frame.right">
          <div v-if="rangeStyle" class="range-band" :style="rangeStyle" />
        </div>
        <ArrayPointer
          v-for="pointer in pointers"
          :key="pointer.name"
          :name="pointer.name"
          :value="pointer.value"
          :position="position(pointer.index)"
          :placement="pointer.placement"
          :lane="labelLanes[pointer.name] ?? 0"
          :tone="pointer.tone"
          :edge="pointer.edge"
          :updated="pointer.updated"
          :label-offset="labelOffsets[pointer.name] ?? 0"
        />
      </div>
    </div>
    <div class="comparison-area">
      <span v-if="empty" class="empty-range">Range empty</span>
      <code
        v-if="candidate !== null && square !== null"
        class="square-check"
        data-testid="square-comparison"
      >
        {{ candidate }} × {{ candidate }} = {{ square.toString() }}
        {{ square < BigInt(n) ? '<' : square > BigInt(n) ? '>' : '=' }} {{ n }}
      </code>
      <code
        v-if="approach === 'upper' && frame.instruction === 'adjust'"
        class="adjustment"
        data-testid="root-adjustment"
      >
        {{ frame.answer }} − 1 = {{ frame.result }}
      </code>
      <code v-if="done" class="root-proof">{{ proof }}</code>
    </div>
  </div>
</template>

<style scoped>
.root-decisions {
  padding: var(--algo-space-2) var(--algo-space-5) 0;
}
.root-decisions .search-decisions {
  max-width: 28rem;
  margin-inline: auto;
}
.root-decisions.editing {
  visibility: hidden;
}
.root-visualization {
  --algo-array-gap: var(--algo-space-2);
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 350px;
  padding: var(--algo-space-4) var(--algo-space-6) var(--algo-space-5);
}
.range-stage {
  margin-block: auto;
  padding-block: calc(var(--algo-pointer-top-space) + var(--algo-space-6))
    var(--algo-pointer-bottom-space);
}
.candidate-track {
  --algo-array-header-height: var(--algo-space-5);
  position: relative;
  display: grid;
  grid-template-rows: var(--algo-array-header-height) auto auto;
  max-width: min(100%, calc(var(--candidate-count) * 7rem));
  margin-inline: auto;
}
.root-candidates,
.candidate-range {
  display: grid;
  grid-template-columns: repeat(var(--candidate-count), minmax(0, 1fr));
  gap: var(--algo-array-gap);
}
.root-candidates {
  grid-row: 2;
  margin: 0;
  padding: 0;
  list-style: none;
}
.root-candidate {
  display: grid;
  min-width: 0;
  text-align: center;
}
.candidate-cell,
.candidate-gap {
  display: grid;
  place-items: center;
  min-height: 52px;
  padding: var(--algo-space-1) 2px;
  font-size: var(--algo-text-base);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.candidate-cell {
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  color: var(--algo-ink);
  transition:
    color var(--algo-motion),
    background var(--algo-motion),
    border-color var(--algo-motion);
}
.candidate-gap {
  color: var(--algo-muted);
}
.excluded .candidate-cell {
  background: transparent;
  color: color-mix(in srgb, var(--algo-muted) 50%, var(--algo-paper));
  border-color: color-mix(in srgb, var(--algo-line) 65%, var(--algo-paper));
  border-style: dashed;
}
.saved .candidate-cell,
.resolved .candidate-cell {
  border-style: solid;
  background: var(--algo-success-soft);
  border-color: var(--algo-success-line);
  color: var(--algo-success);
}
.midpoint:not(.resolved) .candidate-cell {
  border-style: solid;
  background: var(--algo-accent-soft);
  border-color: var(--algo-accent-line);
  color: var(--algo-accent);
}
.candidate-range {
  position: relative;
  grid-row: 3;
  height: 5px;
  margin-top: var(--algo-space-3);
}
.range-band {
  background: var(--algo-accent-line);
  border-radius: 3px;
}
.empty-range {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.comparison-area {
  display: grid;
  align-content: start;
  gap: var(--algo-space-2);
  min-height: 94px;
  text-align: center;
}
.square-check {
  color: var(--algo-accent);
}
.adjustment {
  color: var(--algo-success);
}
.root-proof {
  color: var(--algo-secondary);
}
code {
  font: var(--algo-text-base)/1.6 var(--algo-mono);
  overflow-wrap: anywhere;
}
@media (prefers-reduced-motion: reduce) {
  .candidate-cell,
  .root-visualization :deep(.array-pointer),
  .root-visualization :deep(.pointer-label),
  .root-visualization :deep(.pointer-stem),
  .root-visualization :deep(.pointer-stem::before) {
    transition: none;
  }
}
</style>
