<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import ArrayPointer from './ArrayPointer.vue'
import DiagramArrowhead from './DiagramArrowhead.vue'
import RuleActionMarker from './RuleActionMarker.vue'
import { usePointerLabels } from '../composables/usePointerLabels'
const props = withDefaults(
  defineProps<{
    values: readonly number[]
    pointers: readonly {
      name: string
      index: number | null
      updated: boolean
      highlighted?: boolean
      step?: number
    }[]
    linked?: boolean
    prefixLength?: number
    prefixLabel?: string
    written?: readonly number[]
    highlighted?: readonly number[]
    moving?: readonly number[]
    traversed?: readonly number[]
    cellSteps?: Readonly<Record<number, number>>
    activeStep?: number
    resultIndex?: number | null
    complete?: boolean
    discardTail?: boolean
    compact?: boolean
  }>(),
  {
    linked: false,
    prefixLength: 0,
    prefixLabel: '',
    written: () => [],
    highlighted: () => [],
    moving: () => [],
    traversed: () => [],
    resultIndex: null,
    complete: false,
    discardTail: false,
  },
)
const track = ref<HTMLElement | null>(null)
const linkArrowId = useId()
const cells = computed(() => (props.linked ? [...props.values, null] : props.values))
const pointers = computed(() =>
  props.pointers.map((pointer, index, all) => ({
    ...pointer,
    value: pointer.index === null ? 'null' : pointer.index,
    index: pointer.index === null ? props.values.length : pointer.index,
    placement: 'above' as const,
    lane: props.linked
      ? undefined
      : all.slice(0, index).filter((other) => other.index === pointer.index).length,
  })),
)
const { offsets, lanes } = usePointerLabels(track, pointers, '.sequence-cell')
function position(index: number) {
  if (index >= cells.value.length) return 'calc(100% + var(--algo-pointer-edge))'
  const fraction = (index + 0.5) / cells.value.length
  return `calc(${fraction * 100}% + ${fraction - 0.5} * var(--sequence-gap))`
}
const prefixWidth = computed(
  () =>
    `calc(${(props.prefixLength / cells.value.length) * 100}% - ${1 - props.prefixLength / cells.value.length} * var(--sequence-gap))`,
)
</script>
<template>
  <div
    class="visualization pointer-visualization"
    :class="{ linked, compact }"
    role="region"
    :aria-label="linked ? 'Linked list visualization' : 'Array transformation'"
  >
    <div v-if="values.length" class="sequence-stage">
      <div ref="track" class="sequence-track" :style="{ '--sequence-length': cells.length }">
        <ol class="sequence-list" :aria-label="linked ? 'Linked list nodes' : 'Working array'">
          <li
            v-for="(value, index) in cells"
            :key="index"
            class="sequence-item"
            :class="{
              kept: index < prefixLength,
              written: written.includes(index),
              'is-highlighted': highlighted.includes(index),
              result: complete && index === resultIndex,
              discarded: complete && discardTail && index >= prefixLength,
              'null-node': value === null,
            }"
            :aria-label="
              value === null
                ? 'End of list: null'
                : `${linked ? 'Node' : 'Index'} ${index}: ${value}${index === resultIndex && complete ? ', middle node' : ''}`
            "
          >
            <div class="sequence-cell">
              <span
                class="sequence-value algo-mono"
                :class="{ 'is-moving': moving.includes(index) }"
                :title="value === null ? 'null' : String(value)"
              >
                {{ value === null ? 'null' : value }}
              </span>
              <RuleActionMarker
                v-if="cellSteps?.[index]"
                :step="cellSteps[index]!"
                :active="cellSteps[index] === activeStep"
              />
            </div>
            <span class="sequence-index algo-mono" aria-hidden="true">
              {{ value === null ? ' ' : index }}
            </span>
            <svg
              v-if="linked && index < values.length"
              class="next-link"
              :class="{ 'is-traversed': traversed.includes(index) }"
              :data-link-from="index"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <defs><DiagramArrowhead :id="`${linkArrowId}-${index}`" /></defs>
              <line x1="1" y1="8" x2="11" y2="8" :marker-end="`url(#${linkArrowId}-${index})`" />
            </svg>
          </li>
        </ol>
        <ArrayPointer
          v-for="pointer in pointers"
          :key="pointer.name"
          :class="{ 'is-highlighted': pointer.highlighted }"
          :name="pointer.name"
          :value="pointer.value"
          :position="position(pointer.index)"
          placement="above"
          :lane="lanes[pointer.name] ?? 0"
          :label-offset="offsets[pointer.name] ?? 0"
          :edge="pointer.index >= cells.length ? 'after' : null"
          :updated="pointer.updated"
          :step="pointer.step"
          :active-step="activeStep"
          :tone="complete && linked && pointer.name === 'slow' ? 'success' : 'neutral'"
        />
        <slot name="overlay" :position="position" />
        <div v-if="!linked" class="prefix-track" aria-hidden="true">
          <span v-if="prefixLength" class="prefix-band" :style="{ width: prefixWidth }" />
          <span v-if="prefixLength && prefixLabel" class="prefix-label">{{ prefixLabel }}</span>
        </div>
      </div>
    </div>
    <p v-else class="empty-array">Empty array</p>
  </div>
</template>
<style scoped>
.pointer-visualization {
  --sequence-gap: var(--algo-array-gap);
  --sequence-cell-height: 52px;
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 390px;
  padding: var(--algo-space-6);
}
.linked {
  --sequence-gap: var(--algo-space-5);
}
.pointer-visualization.compact {
  min-height: 0;
  padding: var(--algo-space-6) 0 0;
}
.compact .sequence-stage {
  padding-bottom: var(--algo-space-4);
}
.sequence-stage {
  width: 100%;
  padding-top: var(--algo-pointer-top-space);
  padding-bottom: var(--algo-space-12);
}
.sequence-track {
  position: relative;
  isolation: isolate;
}
.sequence-list {
  display: grid;
  grid-template-columns: repeat(var(--sequence-length), minmax(0, 1fr));
  gap: var(--sequence-gap);
  padding: 0;
  margin: 0;
  list-style: none;
}
.sequence-item {
  position: relative;
  min-width: 0;
  text-align: center;
}
.sequence-cell {
  position: relative;
  display: grid;
  place-items: center;
  height: var(--sequence-cell-height);
  padding: var(--algo-space-1);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-paper);
  transition:
    background var(--algo-motion),
    border-color var(--algo-motion);
}
.sequence-value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--algo-text-body);
}
.sequence-value.is-moving {
  visibility: hidden;
}
.sequence-index {
  display: block;
  min-height: 18px;
  margin-top: var(--algo-space-2);
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.kept .sequence-cell,
.result .sequence-cell {
  background: var(--algo-success-soft);
  border-color: var(--algo-success-line);
  color: var(--algo-success);
}
.written .sequence-cell {
  background: var(--algo-accent-soft);
  border-color: var(--algo-accent);
  color: var(--algo-accent);
}
.is-highlighted .sequence-cell {
  background: var(--algo-accent-line);
  border-color: var(--algo-accent);
  color: var(--algo-ink);
  box-shadow: 0 0 0 1px var(--algo-accent);
}
.array-pointer.is-highlighted {
  color: var(--algo-accent);
}
.array-pointer.is-highlighted :deep(.pointer-label) {
  background: var(--algo-accent-line);
  border-color: var(--algo-accent);
  color: var(--algo-accent);
}
.discarded {
  opacity: 0.4;
}
.next-link {
  position: absolute;
  top: 18px;
  left: calc(100% + (var(--sequence-gap) - 16px) / 2);
  color: var(--algo-muted);
  overflow: visible;
}
.next-link line {
  stroke: currentColor;
  stroke-width: var(--algo-arrow-stroke);
}
.next-link.is-traversed {
  color: var(--algo-accent);
}
.linked .sequence-cell {
  border-radius: var(--algo-radius);
}
.null-node .sequence-cell {
  padding-inline: 0;
  color: var(--algo-muted);
  border-style: dashed;
  background: var(--algo-canvas);
}
.null-node .sequence-value {
  font-size: var(--algo-text-sm);
}
.prefix-track {
  height: 30px;
  margin-top: var(--algo-space-2);
}
.prefix-band {
  display: block;
  height: 4px;
  border-radius: 2px;
  background: var(--algo-success-line);
  transition: width var(--algo-motion);
}
.prefix-label {
  display: block;
  margin-top: var(--algo-space-1);
  color: var(--algo-success);
  font-size: var(--algo-text-xs);
}
.empty-array {
  width: 100%;
  color: var(--algo-muted);
  text-align: center;
  font-size: var(--algo-text-base);
}
@media (prefers-reduced-motion: reduce) {
  .sequence-cell,
  .prefix-band {
    transition: none;
  }
}
</style>
