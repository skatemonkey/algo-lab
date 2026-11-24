<script setup lang="ts">
import PointerApproachLayout from './PointerApproachLayout.vue'
import PointerRuleDiagram from './PointerRuleDiagram.vue'
import { traceLinkedListMiddle, type LinkedListFrame } from '../domain/twoPointers'
import {
  linkedListMiddleApproach as approach,
  linkedListMiddleExamples as examples,
} from '../lessons/twoPointers'

const frames = traceLinkedListMiddle(examples.advance)
const before = frames[0]!
const after = frames.find((frame) => frame.instruction === 'fast')!
function pointers(frame: LinkedListFrame, active?: 'slow' | 'fast', previous?: LinkedListFrame) {
  return (['slow', 'fast'] as const).map((name, index) => ({
    name,
    index: frame[name],
    updated: !!previous && previous[name] !== frame[name],
    highlighted: active === name,
    step: previous ? index + 1 : frame.instruction === 'return' && name === 'slow' ? 1 : undefined,
  }))
}
function movement(activeAction: number | null) {
  const active = activeAction === 0 ? 'slow' : activeAction === 1 ? 'fast' : undefined
  return [
    { label: 'Before', frame: before },
    { label: 'After', frame: after },
  ].map(({ label, frame }, index) => ({
    label,
    values: examples.advance,
    linked: true,
    pointers: pointers(frame, active, index ? before : undefined),
    highlighted: active ? [frame[active] ?? examples.advance.length] : [],
    traversed: index === 0 && active ? (active === 'slow' ? [0] : [0, 1]) : [],
    activeStep: activeAction === null ? undefined : activeAction + 1,
  }))
}
const endingFrames = examples.endings.map((example) => ({
  ...example,
  frame: traceLinkedListMiddle(example.values).at(-1)!,
}))
function endings(inspected: boolean) {
  return endingFrames.map(({ values, frame }) => ({
    label: frame.fast === null ? 'Even · fast = null' : 'Odd · fast.next = null',
    values,
    linked: true,
    pointers: pointers(frame, inspected ? 'slow' : undefined),
    highlighted: inspected ? [frame.slow] : [],
    activeStep: inspected ? 1 : undefined,
    resultIndex: frame.slow,
    complete: true,
  }))
}
</script>

<template>
  <PointerApproachLayout
    class="linked-list-approach"
    :approach="approach"
    :technique="approach.technique"
    label="Middle of a linked list approach"
    compact
    interactive
  >
    <template #default="{ rule, activeAction }">
      <PointerRuleDiagram
        v-if="rule.value"
        label="Advance slow and fast: before and after"
        :snapshots="movement(activeAction)"
        compact
      />
      <PointerRuleDiagram
        v-else
        label="Middle nodes for odd and even lengths"
        :snapshots="endings(activeAction !== null)"
        :connected="false"
        compact
      />
    </template>
  </PointerApproachLayout>
</template>

<style scoped>
.linked-list-approach {
  --algo-example-pointer-space: 84px;
}
</style>
