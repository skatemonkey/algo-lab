<script setup lang="ts">
import { computed } from 'vue'
import PointerSolutionRules from './PointerSolutionRules.vue'
import PointerSequence from './PointerSequence.vue'
import { pointerRuleStep, type LinkedListFrame } from '../domain/twoPointers'
import { linkedListMiddleRules } from '../lessons/twoPointers'

const props = defineProps<{
  values: readonly number[]
  frame: LinkedListFrame
  previousFrame: LinkedListFrame | null
  editing: boolean
  active: boolean
}>()

const activeStep = computed(() =>
  props.active && !props.editing
    ? pointerRuleStep(linkedListMiddleRules, props.frame.decision, props.frame.instruction)
    : undefined,
)
const moving = computed(() => {
  const instruction = props.frame.instruction
  return activeStep.value && (instruction === 'slow' || instruction === 'fast') ? instruction : null
})
const pointers = computed(() =>
  (['slow', 'fast'] as const).map((name) => ({
    name,
    index: props.frame[name],
    updated: props.frame.instruction === 'initialize' || moving.value === name,
    step:
      moving.value === name || (props.frame.instruction === 'return' && name === 'slow')
        ? activeStep.value
        : undefined,
  })),
)
const traversed = computed(() => {
  if (!moving.value || !props.previousFrame) return []
  const from = props.previousFrame[moving.value]
  const to = props.frame[moving.value] ?? props.values.length
  return from === null ? [] : Array.from({ length: to - from }, (_, index) => from + index)
})
const highlighted = computed(() =>
  moving.value ? [props.frame[moving.value] ?? props.values.length] : [],
)
</script>

<template>
  <PointerSolutionRules
    class="linked-list-rules"
    :rules="linkedListMiddleRules"
    :outcome="frame.decision"
    :instruction="frame.instruction"
    :editing="editing"
  />
  <PointerSequence
    class="linked-list-solution"
    linked
    :values="values"
    :pointers="pointers"
    :traversed="traversed"
    :highlighted="highlighted"
    :active-step="activeStep"
    :result-index="frame.slow"
    :complete="frame.instruction === 'return'"
  />
</template>

<style scoped>
.linked-list-rules {
  --algo-solution-rules-width: 100%;
}
.linked-list-solution {
  min-height: 0;
  padding-top: var(--algo-space-2);
}
</style>
