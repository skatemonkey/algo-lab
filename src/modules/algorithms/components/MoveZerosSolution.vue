<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RotateCcw } from '@lucide/vue'
import ArraySwapMotion from './ArraySwapMotion.vue'
import PointerSolutionRules from './PointerSolutionRules.vue'
import PointerSequence from './PointerSequence.vue'
import {
  arrayTransformVariables,
  pointerRuleStep,
  type ArrayTransformFrame,
} from '../domain/twoPointers'
import { moveZerosRules } from '../lessons/twoPointers'

const props = defineProps<{
  frame: ArrayTransformFrame
  previousFrame: ArrayTransformFrame | null
  editing: boolean
  active: boolean
}>()
const emit = defineEmits<{ replay: [] }>()

const swapping = ref(false)
const swapRun = ref(0)
// Read the trace's preceding snapshot so seeking and replaying behave like stepping.
const showSwap = computed(
  () =>
    props.active &&
    !props.editing &&
    props.frame.instruction === 'swap' &&
    props.frame.left !== props.frame.right &&
    props.previousFrame?.instruction === 'condition',
)
function playSwap() {
  swapping.value = false
  if (!showSwap.value) return
  swapRun.value++
  swapping.value = true
}
function replaySwap() {
  emit('replay')
  playSwap()
}
const displayFrame = computed(() =>
  swapping.value && props.previousFrame ? props.previousFrame : props.frame,
)
const activeStep = computed(() =>
  props.active && !props.editing
    ? pointerRuleStep(moveZerosRules, props.frame.decision ?? null, props.frame.instruction)
    : undefined,
)
const pointers = computed(() =>
  arrayTransformVariables(props.frame).map((variable) => ({
    name: variable.name,
    index: Number(variable.value),
    updated: !!variable.updated,
    step: variable.name === props.frame.instruction ? activeStep.value : undefined,
  })),
)
const cellSteps = computed(() =>
  props.frame.instruction === 'swap' && activeStep.value
    ? Object.fromEntries(props.frame.written.map((index) => [index, activeStep.value!]))
    : undefined,
)

watch([() => props.frame, () => props.active, () => props.editing], playSwap, { immediate: true })
</script>

<template>
  <PointerSolutionRules
    :rules="moveZerosRules"
    :outcome="frame.decision ?? null"
    :instruction="frame.instruction"
    :editing="editing"
  >
    <template #action-end="{ rule, index }">
      <button
        v-if="showSwap && rule.instructions?.[index] === 'swap'"
        class="replay-swap"
        type="button"
        aria-label="Replay swap"
        title="Replay swap"
        @click="replaySwap"
      >
        <RotateCcw :size="13" aria-hidden="true" />
      </button>
    </template>
  </PointerSolutionRules>
  <PointerSequence
    class="move-zeros-solution"
    :values="displayFrame.values"
    :pointers="pointers"
    :prefix-length="displayFrame.prefixLength"
    prefix-label="Nonzero prefix"
    :written="swapping ? [] : frame.written"
    :moving="swapping ? frame.written : []"
    :cell-steps="cellSteps"
    :active-step="activeStep"
    :complete="frame.instruction === 'return'"
  >
    <template #overlay="{ position }">
      <ArraySwapMotion
        v-if="showSwap && previousFrame"
        :left="position(frame.left)"
        :right="position(frame.right)"
        :left-value="previousFrame.values[frame.left]!"
        :right-value="previousFrame.values[frame.right]!"
        :running="swapping"
        :run="swapRun"
        @finish="swapping = false"
      />
    </template>
  </PointerSequence>
</template>

<style scoped>
.move-zeros-solution {
  min-height: 0;
  padding-top: var(--algo-space-2);
}
.move-zeros-solution :deep(.sequence-index) {
  /* A fixed return lane keeps the zero's path clear of indices without layout jumps. */
  margin-top: 32px;
}
.replay-swap {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin: -2px 0 -2px var(--algo-space-1);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--algo-success-soft);
  color: var(--algo-success);
  cursor: pointer;
}
.replay-swap:hover {
  background: var(--algo-success-line);
}
</style>
