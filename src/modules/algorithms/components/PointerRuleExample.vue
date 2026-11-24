<script setup lang="ts">
import { computed } from 'vue'
import PointerRuleDiagram from './PointerRuleDiagram.vue'
import type { ArrayTransformFrame, ArrayTransformInstruction } from '../domain/twoPointers'

const props = defineProps<{
  label: string
  before: ArrayTransformFrame
  after: ArrayTransformFrame
  compact?: boolean
  action?: ArrayTransformInstruction
  actions?: readonly ArrayTransformInstruction[]
}>()
function stepFor(instruction?: ArrayTransformInstruction) {
  const index = instruction ? (props.actions?.indexOf(instruction) ?? -1) : -1
  return index < 0 ? undefined : index + 1
}
const highlightedPointer = computed(() =>
  props.action === 'left' || props.action === 'right' ? props.action : null,
)
const swapIndices = computed(() => [...new Set([props.before.left, props.before.right])])
const cellSteps = computed(() => {
  const swap = stepFor('swap')
  if (swap) return Object.fromEntries(swapIndices.value.map((index) => [index, swap]))
  const write = stepFor('write')
  return write ? { [props.after.left]: write } : undefined
})
const snapshots = computed(() =>
  [
    { label: 'Before', frame: props.before, changed: false },
    { label: 'After', frame: props.after, changed: true },
  ].map(({ label, frame, changed }) => ({
    label,
    values: frame.values,
    pointers: [
      {
        name: 'left',
        index: frame.left,
        updated: changed && props.before.left !== props.after.left,
        highlighted: highlightedPointer.value === 'left' || (props.action === 'write' && changed),
        step: changed ? stepFor('left') : undefined,
      },
      {
        name: 'right',
        index: frame.right,
        updated: changed && props.before.right !== props.after.right,
        highlighted: highlightedPointer.value === 'right' || (props.action === 'write' && !changed),
        step: changed ? stepFor('right') : undefined,
      },
    ],
    prefixLength: frame.prefixLength,
    prefixLabel: changed ? 'Kept' : '',
    cellSteps: changed ? cellSteps.value : undefined,
    activeStep: stepFor(props.action),
    highlighted:
      props.action === 'swap'
        ? swapIndices.value
        : props.action === 'write'
          ? [changed ? props.after.left : props.before.right]
          : highlightedPointer.value
            ? [frame[highlightedPointer.value]]
            : [],
    written: changed
      ? props.after.values.flatMap((value, index) =>
          value === props.before.values[index] ? [] : [index],
        )
      : [],
  })),
)
</script>

<template>
  <PointerRuleDiagram
    :label="`${label}: before and after`"
    :snapshots="snapshots"
    :compact="compact"
  />
</template>
